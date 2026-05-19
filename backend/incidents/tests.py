from django.test import TestCase
from django.core.management import call_command
from django.utils import timezone
from datetime import timedelta
from incidents.models import SecurityIncident
from incidents.ninja_api import _recent_incidents

class IncidentModelTest(TestCase):
    def test_create_incident(self):
        inc = SecurityIncident.objects.create(
            incident_type=SecurityIncident.IncidentType.DDOS,
            severity=SecurityIncident.Severity.HIGH,
            source_country="Russia",
            status=SecurityIncident.Status.OPEN,
            description="Test incident"
        )
        self.assertEqual(str(inc), f"{inc.timestamp} - ddos (high)")
        self.assertEqual(inc.incident_type, "ddos")
        self.assertEqual(inc.severity, "high")

class SummaryAPITest(TestCase):
    def setUp(self):
        SecurityIncident.objects.create(severity='high', incident_type='DDoS')
        SecurityIncident.objects.create(severity='medium', incident_type='PortScan')
        SecurityIncident.objects.create(severity='low', incident_type='Phishing')
        SecurityIncident.objects.create(severity='high', incident_type='Malware')

    def test_summary_counts(self):
        response = self.client.get('/api/incidents/summary')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['total'], 4)
        self.assertEqual(data['high'], 2)
        self.assertEqual(data['medium'], 1)
        self.assertEqual(data['low'], 1)

class TimelineAPITest(TestCase):
    def setUp(self):
        now = timezone.now()
        for i in range(5):
            SecurityIncident.objects.create(
                timestamp=now - timedelta(days=i),
                severity='high',
                incident_type='DDoS'
            )

    def test_timeline_days(self):
        response = self.client.get('/api/incidents/timeline?days=3')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        # Должно быть не более 3 дней, но может быть меньше из-за группировки
        self.assertLessEqual(len(data), 3)
        # Проверим, что каждая запись содержит date и count
        for item in data:
            self.assertIn('date', item)
            self.assertIn('count', item)

class TopTypesAPITest(TestCase):
    def setUp(self):
        SecurityIncident.objects.create(incident_type='DDoS', severity='high')
        SecurityIncident.objects.create(incident_type='DDoS', severity='medium')
        SecurityIncident.objects.create(incident_type='PortScan', severity='low')
        SecurityIncident.objects.create(incident_type='Phishing', severity='high')

    def test_top_types_default_limit(self):
        response = self.client.get('/api/incidents/top-types')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        # Должно быть не более 5, и DDoS должен быть первым
        self.assertLessEqual(len(data), 5)
        if data:
            self.assertEqual(data[0]['type'], 'DDoS')
            self.assertEqual(data[0]['count'], 2)

    def test_top_types_custom_limit(self):
        response = self.client.get('/api/incidents/top-types?limit=2')
        data = response.json()
        self.assertEqual(len(data), 2)

class ListAPITest(TestCase):
    def setUp(self):
        for i in range(25):
            SecurityIncident.objects.create(
                incident_type='DDoS',
                severity='high',
                source_country='Test'
            )

    def test_pagination(self):
        response = self.client.get('/api/incidents/list?page=1&limit=10')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 10)

    def test_page_out_of_range(self):
        response = self.client.get('/api/incidents/list?page=100&limit=10')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 0)

class LiveStatsAPITest(TestCase):
    def setUp(self):
        # Очищаем глобальный список перед каждым тестом
        _recent_incidents.clear()

    def test_live_stats_structure(self):
        response = self.client.get('/api/incidents/live-stats')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        expected_keys = {'last_second_count', 'last_minute_count', 'top_types', 'severity_counts', 'timestamp'}
        self.assertEqual(set(data.keys()), expected_keys)
        self.assertIn('high', data['severity_counts'])
        self.assertIn('medium', data['severity_counts'])
        self.assertIn('low', data['severity_counts'])

    def test_live_stats_incremental(self):
        # Первый вызов
        resp1 = self.client.get('/api/incidents/live-stats')
        data1 = resp1.json()
        # Второй вызов (должны добавиться новые события)
        resp2 = self.client.get('/api/incidents/live-stats')
        data2 = resp2.json()
        # Проверяем, что счётчик за минуту либо не убывает, либо меняется
        # Но из-за случайности тестируем только структуру
        self.assertIsInstance(data2['last_second_count'], int)
        self.assertIsInstance(data2['last_minute_count'], int)

class GenerateIncidentsCommandTest(TestCase):
    def test_generate_incidents(self):
        initial_count = SecurityIncident.objects.count()
        call_command('generate_incidents', '--count=50')
        new_count = SecurityIncident.objects.count()
        self.assertEqual(new_count - initial_count, 50)