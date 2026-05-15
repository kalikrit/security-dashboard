# Security Analytics Dashboard

Дашборд информационной безопасности с графиками и метриками.

## Стек
- **Backend**: Django + Django-Ninja, PostgreSQL (SQLite для разработки)
- **Frontend**: SvelteKit, TypeScript, Chart.js
- **Деплой**: Render (бэкенд), Vercel (фронтенд)

## Локальный запуск

### Бэкенд
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py generate_incidents --count=500
python manage.py runserver
```

### Фронтенд
```bash
cd frontend
npm install
npm run dev
```

Откройте http://localhost:5173