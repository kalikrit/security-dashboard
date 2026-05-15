from django.db import models

class SecurityIncident(models.Model):
    class Severity(models.TextChoices):
        HIGH = 'high', 'High'
        MEDIUM = 'medium', 'Medium'
        LOW = 'low', 'Low'

    class IncidentType(models.TextChoices):
        DDOS = 'ddos', 'DDoS'
        PORT_SCAN = 'port_scan', 'Port Scan'
        PHISHING = 'phishing', 'Phishing'
        MALWARE = 'malware', 'Malware'
        BRUTE_FORCE = 'brute_force', 'Brute Force'

    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        IN_PROGRESS = 'in_progress', 'In Progress'
        CLOSED = 'closed', 'Closed'

    timestamp = models.DateTimeField(auto_now_add=True)
    incident_type = models.CharField(max_length=20, choices=IncidentType.choices)
    severity = models.CharField(max_length=10, choices=Severity.choices)
    source_country = models.CharField(max_length=100, blank=True, null=True)
    cve_id = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.timestamp} - {self.incident_type} ({self.severity})"