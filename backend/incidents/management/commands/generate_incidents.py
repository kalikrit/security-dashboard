import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from incidents.models import SecurityIncident

class Command(BaseCommand):
    help = 'Generate random security incidents for testing'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=100, help='Number of incidents to generate')

    def handle(self, *args, **options):
        count = options['count']
        self.stdout.write(f'Generating {count} random incidents...')

        incident_types = [choice[0] for choice in SecurityIncident.IncidentType.choices]
        severities = [choice[0] for choice in SecurityIncident.Severity.choices]
        statuses = [choice[0] for choice in SecurityIncident.Status.choices]
        countries = ['Russia', 'USA', 'China', 'Germany', 'UK', 'France', 'Brazil', 'India', 'Canada', 'Australia']
        cve_prefixes = ['CVE-2024-', 'CVE-2023-', 'CVE-2025-']
        descriptions = [
            'Suspicious traffic detected',
            'Brute force attempt',
            'Malware signature match',
            'Phishing email reported',
            'Port scan from external IP',
            'Anomaly in network traffic',
            'Unusual outbound connections',
            'Potential data exfiltration',
        ]

        incidents_to_create = []
        now = timezone.now()
        for i in range(count):
            # Случайная дата в пределах последних 30 дней
            random_days_ago = random.randint(0, 30)
            timestamp = now - timedelta(days=random_days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
            
            incident = SecurityIncident(
                timestamp=timestamp,
                incident_type=random.choice(incident_types),
                severity=random.choice(severities),
                source_country=random.choice(countries),
                status=random.choice(statuses),
                cve_id=random.choice(cve_prefixes) + str(random.randint(1000, 9999)) if random.random() > 0.7 else None,
                description=random.choice(descriptions),
            )
            incidents_to_create.append(incident)

        SecurityIncident.objects.bulk_create(incidents_to_create)
        self.stdout.write(self.style.SUCCESS(f'Successfully generated {count} incidents'))