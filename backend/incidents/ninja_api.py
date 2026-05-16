import random
from collections import defaultdict
from datetime import datetime, timedelta
from django.utils import timezone
from ninja import Router, Schema
from django.db.models import Count
from .models import SecurityIncident

router = Router()

class SummarySchema(Schema):
    total: int
    high: int
    medium: int
    low: int

class TimelineItemSchema(Schema):
    date: str
    count: int

class TopTypeItemSchema(Schema):
    type: str
    count: int

class IncidentListItemSchema(Schema):
    id: int
    timestamp: str
    incident_type: str
    severity: str
    source_country: str
    status: str
    cve_id: str = None
    description: str = None

@router.get("/summary", response=SummarySchema)
def get_summary(request):
    incidents = SecurityIncident.objects.all()
    return {
        "total": incidents.count(),
        "high": incidents.filter(severity=SecurityIncident.Severity.HIGH).count(),
        "medium": incidents.filter(severity=SecurityIncident.Severity.MEDIUM).count(),
        "low": incidents.filter(severity=SecurityIncident.Severity.LOW).count(),
    }

@router.get("/timeline", response=list[TimelineItemSchema])
def get_timeline(request, days: int = 7):
    start_date = timezone.now() - timedelta(days=days)
    incidents = SecurityIncident.objects.filter(timestamp__gte=start_date)
    result = (
        incidents
        .extra({"date": "date(timestamp)"})
        .values("date")
        .annotate(count=Count("id"))
        .order_by("date")
    )
    # В SQLite item['date'] уже строка, не нужно вызывать .isoformat()
    return [{"date": item["date"], "count": item["count"]} for item in result]

@router.get("/top-types", response=list[TopTypeItemSchema])
def get_top_types(request, limit: int = 5):
    types = (
        SecurityIncident.objects.values("incident_type")
        .annotate(count=Count("id"))
        .order_by("-count")[:limit]
    )
    return [
        {"type": dict(SecurityIncident.IncidentType.choices).get(t["incident_type"], t["incident_type"]), "count": t["count"]}
        for t in types
    ]

@router.get("/list", response=list[IncidentListItemSchema])
def get_incidents(request, page: int = 1, limit: int = 20):
    offset = (page - 1) * limit
    incidents = SecurityIncident.objects.all().order_by("-timestamp")[offset:offset+limit]
    return [
        {
            "id": inc.id,
            "timestamp": inc.timestamp.isoformat(),
            "incident_type": dict(SecurityIncident.IncidentType.choices).get(inc.incident_type, inc.incident_type),
            "severity": inc.severity,
            "source_country": inc.source_country or "",
            "status": inc.status,
            "cve_id": inc.cve_id,
            "description": inc.description,
        }
        for inc in incidents
    ]
    
# Хранилище для имитации скользящего окна (в памяти, для демо)
# В реальном проекте использовали бы Redis или кэш
_recent_incidents = []  # список кортежей (timestamp, type)

@router.get("/live-stats")
def get_live_stats(request):
    global _recent_incidents
    now = datetime.now()
    
    # Имитация генерации новых инцидентов (0-5 событий в секунду)
    new_count = random.randint(0, 5)
    types = ['DDoS', 'PortScan', 'Phishing', 'Malware', 'BruteForce']
    severities = ['high', 'medium', 'low']
    for _ in range(new_count):
        _recent_incidents.append((
            now,
            random.choice(types),
            random.choice(severities)
        ))
    
    # Удаляем инциденты старше 60 секунд
    cutoff = now - timedelta(seconds=60)
    _recent_incidents = [(ts, t, s) for ts, t, s in _recent_incidents if ts > cutoff]
    
    # Подсчёт за последнюю секунду
    last_second_incidents = [inc for inc in _recent_incidents if inc[0] > now - timedelta(seconds=1)]
    last_second_count = len(last_second_incidents)
    
    # Топ типов за минуту
    type_counts = defaultdict(int)
    severity_counts = defaultdict(int)  # high, medium, low
    for _, t, s in _recent_incidents:
        type_counts[t] += 1
        severity_counts[s] += 1
    
    top_types = dict(sorted(type_counts.items(), key=lambda x: x[1], reverse=True)[:5])
    
    return {
        "last_second_count": last_second_count,
        "last_minute_count": len(_recent_incidents),
        "top_types": top_types,
        "severity_counts": {
            "high": severity_counts.get('high', 0),
            "medium": severity_counts.get('medium', 0),
            "low": severity_counts.get('low', 0),
        },
        "timestamp": now.isoformat()
    }   