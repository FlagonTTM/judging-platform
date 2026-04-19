#!/usr/bin/env python3
"""Seed демо-данных для TulaHack 2026 judging platform.

Usage (внутри Docker):
    docker compose exec api python seed.py

Usage (локально с запущенным docker compose):
    DATABASE_URL=postgresql+psycopg://judging:judging@localhost:5432/judging \
      python seed.py

Пароль у всех: demo1234

Создаёт:
    - 1 admin
    - 3 судей
    - 8 команд с наполненными submissions, включая одну с заведомо слабым описанием
    - 8 участников команд (по одному владельцу на команду)
    - 1 event с 4 критериями (30/30/25/15) и 4 этапами
    - Submitted scores от всех трёх судей по всем командам, с разбросом
    - Один judge не досдал оценки одной команды → draft
    - Разный stage-прогресс между командами
    - leaderboard_public=True, results_published=True, judge_comments_visible=True
"""
from __future__ import annotations

import uuid
from datetime import UTC, datetime

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.criterion import Criterion
from app.models.event import Event
from app.models.score import Score, ScoreStatus
from app.models.stage import Stage, StageStatus, TeamStageProgress
from app.models.team import Team
from app.models.user import User, UserRole


def _now() -> datetime:
    return datetime.now(UTC)


ADMIN_EMAIL = "admin@demo.ru"
JUDGE_EMAILS = ["judge1@demo.ru", "judge2@demo.ru", "judge3@demo.ru"]
JUDGE_NAMES = ["Анна Соколова", "Дмитрий Волков", "Елена Ким"]

TEAMS: list[dict[str, object]] = [
    {
        "name": "Pulse Retail",
        "track": "LentaTech · аналитика",
        "owner_email": "team1@demo.ru",
        "owner_name": "Михаил Орлов",
        "telegram": "@pulse_retail",
        "submission": {
            "description": (
                "Платформа предсказывает отток покупателей магазинов «Лента» за 14 дней. "
                "Модель обучается на 2.3 млн чеков, точность F1=0.84, "
                "экономит категорийщикам до 12 часов в неделю.\n"
                "- Интеграция с внутренним DWH Ленты\n"
                "- Дашборд топ-10 рисковых сегментов\n"
                "- Уведомления в Teams при критическом падении LTV"
            ),
            "repo_url": "https://github.com/pulse-retail/core",
            "demo_url": "https://pulse-demo.vercel.app",
            "video_url": "https://youtu.be/dQw4w9WgXcQ",
            "screenshot_url": "https://picsum.photos/id/1015/1200/800",
        },
        "score_row": [9, 9, 8, 9],
        "stage_progress": ["done", "done", "done", "in_progress"],
    },
    {
        "name": "ShelfScan AI",
        "track": "LentaTech · операционный отдел",
        "owner_email": "team2@demo.ru",
        "owner_name": "Виктория Гусева",
        "telegram": "@shelfscan",
        "submission": {
            "description": (
                "Приложение для мерчендайзеров: фото полки → автоматический "
                "контроль выкладки и out-of-stock. На пилоте в 3 магазинах Тулы "
                "снизили потери от пустых полок на 18%.\n"
                "1. Распознавание 4500 SKU за 2 секунды на iPhone\n"
                "2. Сравнение с планограммой и отчёт-диффом\n"
                "3. Интеграция с 1С Розница через REST"
            ),
            "repo_url": "https://github.com/shelfscan-ai/mobile",
            "demo_url": "https://shelfscan-demo.lentatech.ru",
            "video_url": "https://vimeo.com/76979871",
            "screenshot_url": "https://picsum.photos/id/1025/1200/800",
        },
        "score_row": [8, 9, 9, 8],
        "stage_progress": ["done", "done", "done", "done"],
    },
    {
        "name": "RouteMaster",
        "track": "LentaTech · логистика",
        "owner_email": "team3@demo.ru",
        "owner_name": "Артём Белов",
        "telegram": "@routemaster_tula",
        "submission": {
            "description": (
                "Оптимизатор маршрутов для курьеров доставки «Ленты Онлайн». "
                "Алгоритм ALNS сокращает общий пробег фур на 11%, учитывает "
                "временные окна клиентов и ограничения по категориям товаров.\n"
                "- Оффлайн-солвер на C++ с Python API\n"
                "- Web-панель для диспетчера\n"
                "- Экспорт в систему курьера"
            ),
            "repo_url": "https://github.com/routemaster/solver",
            "demo_url": "https://routemaster.demo",
            "video_url": "https://youtu.be/M7lc1UVf-VE",
            "screenshot_url": None,
        },
        "score_row": [8, 8, 7, 8],
        "stage_progress": ["done", "done", "in_progress", "pending"],
    },
    {
        "name": "TariffMind",
        "track": "LentaTech · ценообразование",
        "owner_email": "team4@demo.ru",
        "owner_name": "София Морозова",
        "telegram": "@tariffmind",
        "submission": {
            "description": (
                "Сервис динамического ценообразования для скоропортящихся категорий. "
                "Считает оптимальную скидку за 200мс на товар, повышает ROS на 7%. "
                "Работает с категориями: овощи, мясо, молочка.\n"
                "— Bayesian-модель с обучением на 6 мес. данных\n"
                "— Guardrails на минимальную маржу\n"
                "— Выгрузка в POS через SAP"
            ),
            "repo_url": "https://github.com/tariffmind/pricing",
            "demo_url": "https://tariffmind.app",
            "video_url": "https://youtu.be/ZXsQAXx_ao0",
            "screenshot_url": "https://picsum.photos/id/1040/1200/800",
        },
        "score_row": [9, 8, 8, 7],
        "stage_progress": ["done", "done", "done", "in_progress"],
    },
    {
        "name": "FreshFlow",
        "track": "LentaTech · склад",
        "owner_email": "team5@demo.ru",
        "owner_name": "Павел Новиков",
        "telegram": "@freshflow_team",
        "submission": {
            "description": (
                "Систем контроля свежести продукции на распределительном центре. "
                "IoT-датчики температуры + ML-прогноз остаточного срока годности. "
                "Снизили списания в пилоте на 9%.\n"
                "- Edge-устройство на ESP32\n"
                "- Бэкенд на FastAPI + TimescaleDB\n"
                "- Алерты в Telegram для кладовщиков"
            ),
            "repo_url": "https://github.com/freshflow/edge",
            "demo_url": "https://freshflow.demo",
            "video_url": None,
            "screenshot_url": "https://picsum.photos/id/1050/1200/800",
        },
        "score_row": [7, 8, 8, 7],
        "stage_progress": ["done", "done", "in_progress", "pending"],
    },
    {
        "name": "VoiceCart",
        "track": "LentaTech · клиентский сервис",
        "owner_email": "team6@demo.ru",
        "owner_name": "Дарья Лебедева",
        "telegram": "@voicecart",
        "submission": {
            "description": (
                "Голосовой ассистент для мобильного приложения «Лента»: "
                "«Добавь хлеб и молоко на неделю» — формирует корзину за 3 секунды. "
                "Работает оффлайн, 92% точность распознавания.\n"
                "1. Whisper-small на устройстве\n"
                "2. NER для извлечения SKU\n"
                "3. Матчинг товаров с fallback на синонимы"
            ),
            "repo_url": "https://github.com/voicecart/app",
            "demo_url": "https://voicecart.tulahack.app",
            "video_url": "https://youtu.be/jNQXAC9IVRw",
            "screenshot_url": "https://picsum.photos/id/1060/1200/800",
        },
        "score_row": [8, 7, 8, 8],
        "stage_progress": ["done", "done", "done", "done"],
    },
    {
        "name": "StaffGrid",
        "track": "LentaTech · HR",
        "owner_email": "team7@demo.ru",
        "owner_name": "Илья Захаров",
        "telegram": "@staffgrid",
        "submission": {
            "description": (
                "Наш инновационный продукт — современное решение для планирования "
                "смен сотрудников. Уникальная технология делает это удобно и эффективно."
            ),
            "repo_url": "https://github.com/staffgrid/core",
            "demo_url": None,
            "video_url": None,
            "screenshot_url": None,
        },
        "score_row": [5, 6, 6, 5],
        "stage_progress": ["done", "in_progress", "pending", "pending"],
    },
    {
        "name": "ReceiptLens",
        "track": "LentaTech · лояльность",
        "owner_email": "team8@demo.ru",
        "owner_name": "Кирилл Сорокин",
        "telegram": "@receiptlens",
        "submission": {
            "description": (
                "Сканер чеков на фото с автоматической категоризацией трат для "
                "программы лояльности «Лента». Распознаёт 15 сетей-конкурентов, "
                "вытягивает 98% позиций корректно.\n"
                "- OCR на базе PaddleOCR\n"
                "- Матчер товаров через эмбеддинги\n"
                "- Начисление баллов по правилам категорий"
            ),
            "repo_url": "https://github.com/receiptlens/ocr",
            "demo_url": "https://receiptlens.demo",
            "video_url": "https://youtu.be/oHg5SJYRHA0",
            "screenshot_url": "https://picsum.photos/id/1074/1200/800",
        },
        "score_row": [8, 8, 7, 8],
        "stage_progress": ["done", "done", "in_progress", "pending"],
    },
]

CRITERIA = [
    ("Техническая реализация", 30, 10),
    ("Бизнес-ценность", 30, 10),
    ("UX и качество демо", 25, 10),
    ("Презентация", 15, 10),
]

STAGES = ["Идея и ресёрч", "Разработка", "Тестирование", "Финальный питч"]


PASSWORD_HASH = hash_password("demo1234")


def _status_from_str(s: str) -> StageStatus:
    return {
        "pending": StageStatus.pending,
        "in_progress": StageStatus.in_progress,
        "done": StageStatus.done,
    }[s]


def seed() -> None:
    db = SessionLocal()
    try:
        admin = User(
            id=uuid.uuid4(),
            email=ADMIN_EMAIL,
            password_hash=PASSWORD_HASH,
            name="Администратор",
            role=UserRole.admin,
        )
        db.add(admin)

        judges: list[User] = []
        for email, name in zip(JUDGE_EMAILS, JUDGE_NAMES, strict=True):
            j = User(
                id=uuid.uuid4(),
                email=email,
                password_hash=PASSWORD_HASH,
                name=name,
                role=UserRole.judge,
            )
            db.add(j)
            judges.append(j)

        team_users: list[User] = []
        for team_info in TEAMS:
            u = User(
                id=uuid.uuid4(),
                email=str(team_info["owner_email"]),
                password_hash=PASSWORD_HASH,
                name=str(team_info["owner_name"]),
                role=UserRole.team,
            )
            db.add(u)
            team_users.append(u)

        db.flush()

        event = Event(
            id=uuid.uuid4(),
            name="TulaHack 2026 — LentaTech Judging Demo",
            start_at=datetime(2026, 4, 17, 21, 0, tzinfo=UTC),
            end_at=datetime(2026, 4, 19, 13, 0, tzinfo=UTC),
            deadline=datetime(2026, 4, 19, 13, 0, tzinfo=UTC),
            leaderboard_public=True,
            results_published=True,
            judge_comments_visible=True,
        )
        db.add(event)
        db.flush()

        criteria: list[Criterion] = []
        for idx, (name, weight, max_score) in enumerate(CRITERIA):
            c = Criterion(
                id=uuid.uuid4(),
                event_id=event.id,
                name=name,
                weight=weight,
                max_score=max_score,
                order_index=idx,
            )
            db.add(c)
            criteria.append(c)

        stages: list[Stage] = []
        for order, name in enumerate(STAGES):
            s = Stage(id=uuid.uuid4(), event_id=event.id, name=name, order=order)
            db.add(s)
            stages.append(s)
        db.flush()

        for i, info in enumerate(TEAMS):
            submission = dict(info["submission"])  # type: ignore[arg-type]
            team = Team(
                id=uuid.uuid4(),
                event_id=event.id,
                name=str(info["name"]),
                track=str(info["track"]),
                contacts={
                    "owner_email": str(info["owner_email"]),
                    "telegram": str(info["telegram"]),
                },
                submission=submission,
            )
            db.add(team)
            db.flush()

            progress_strs: list[str] = list(info["stage_progress"])  # type: ignore[arg-type]
            for stage, status_str in zip(stages, progress_strs, strict=True):
                db.add(
                    TeamStageProgress(
                        id=uuid.uuid4(),
                        team_id=team.id,
                        stage_id=stage.id,
                        status=_status_from_str(status_str),
                        updated_by=team_users[i].id,
                    )
                )

            score_row: list[int] = list(info["score_row"])  # type: ignore[arg-type]
            for j_idx, judge in enumerate(judges):
                jitter = (j_idx - 1)  # -1, 0, +1 — разброс судей
                last_team = i == len(TEAMS) - 1
                is_draft = last_team and j_idx == 2
                for crit, base in zip(criteria, score_row, strict=True):
                    value = max(1, min(crit.max_score, base + jitter))
                    db.add(
                        Score(
                            id=uuid.uuid4(),
                            team_id=team.id,
                            judge_id=judge.id,
                            criterion_id=crit.id,
                            value=value,
                            comment=(
                                f"{judge.name}: по критерию «{crit.name}» — "
                                f"{'сильная работа' if base >= 8 else 'есть что улучшить'}"
                            ),
                            status=ScoreStatus.draft if is_draft else ScoreStatus.submitted,
                            submitted_at=None if is_draft else _now(),
                        )
                    )

        db.commit()
        print("✓ Seed complete")
        print(f"  Admin:    {ADMIN_EMAIL} / demo1234")
        print(f"  Judges:   {', '.join(JUDGE_EMAILS)} / demo1234")
        print(f"  Teams:    {len(TEAMS)} команд, пароль demo1234")
        for info in TEAMS:
            print(f"    - {info['name']:16} {info['owner_email']}")
        print(f"  Event:    {event.name}")
        print(f"  Leaderboard: /events/{event.id}/leaderboard")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
