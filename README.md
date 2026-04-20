# Judging Platform

Веб-приложение для автоматизации оценок на хакатоне

## Стек

- **Backend:** FastAPI 0.115 + SQLAlchemy 2 + Pydantic 2 + Alembic
- **Database:** PostgreSQL 16
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Auth:** JWT в httpOnly cookie
- **Deploy:** Docker Compose

## Структура

```text
backend/    # FastAPI монолит
  app/
    api/v1/     # роутеры по доменам
    core/       # config, security
    db/         # session, миграции Alembic
    models/     # SQLAlchemy ORM
    services/   # бизнес-логика (scoring, auth)
  tests/
frontend/   # React SPA
  src/
    app/        # роутер, провайдеры
    pages/      # страницы по ролям
    components/ # переиспользуемые UI-блоки
    lib/        # api-клиент, утилиты
.github/
  workflows/    # CI: lint, test, build
docker-compose.yml
```

## Запуск (dev)

```bash
cp .env.example .env
docker compose up --build
```

- API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- Web: http://localhost:5173

## Тесты

```bash
cd backend
pip install -e ".[dev]"
alembic upgrade head
pytest -v
```

## Роли

- **admin** — события, команды, критерии, жюри, публикация рейтинга
- **judge** — оценки команд по критериям
- **team** — самостоятельная регистрация команды

## Статус

В разработке (хакатон 17–19 апреля 2026).
