from django.contrib import admin
from .models import SecurityIncident

@admin.register(SecurityIncident)
class SecurityIncidentAdmin(admin.ModelAdmin):
    list_display = ('id', 'timestamp', 'incident_type', 'severity', 'source_country', 'status')
    list_filter = ('severity', 'status', 'incident_type')
    search_fields = ('source_country', 'cve_id', 'description')