from datetime import timedelta
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