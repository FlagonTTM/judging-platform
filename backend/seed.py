#!/usr/bin/env python3
"""Seed demo data for TulaHack 2026 judging platform.

Usage (внутри Docker):
    docker compose exec api python seed.py

Usage (локально с запущенным docker compose):
    DATABASE_URL=postgresql+psycopg://judging:judging@localhost:5432/judging \
      python seed.py

Creates:
    - 1 admin  (admin@demo.ru / demo1234)
    - 2 judges (judge1@demo.ru, judge2@demo.ru / demo1234)
    - 3 teams  (owner emails: team1@demo.ru, team2@demo.ru, team3@demo.ru / demo1234)
    - 1 event  with 3 criteria (weights 40/35/25)
    - 3 stages: Разработка, Тестирование, Демо
    - Full submitted scores from both judges for all teams
    - leaderboard_public = True, results_published = True
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
JUDGE_EMAILS = ["judge1@demo.ru", "judge2@demo.ru"]
TEAM_EMAILS = ["team1@demo.ru", "team2@demo.ru", "team3@demo.ru"]
TEAM_NAMES = ["Команда Альфа", "Команда Бета", "Команда Гамма"]
PASSWORD_HASH = hash_password("demo1234")


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
        for i, email in enumerate(JUDGE_EMAILS, 1):
            j = User(
                id=uuid.uuid4(),
                email=email,
                password_hash=PASSWORD_HASH,
                name=f"Судья {i}",
                role=UserRole.judge,
            )
            db.add(j)
            judges.append(j)

        team_users: list[User] = []
        for i, email in enumerate(TEAM_EMAILS, 1):
            t = User(
                id=uuid.uuid4(),
                email=email,
                password_hash=PASSWORD_HASH,
                name=f"Участник {i}",
                role=UserRole.team,
            )
            db.add(t)
            team_users.append(t)

        db.flush()

        event = Event(
            id=uuid.uuid4(),
            name="TulaHack 2026 — Demo Event",
            start_at=datetime(2026, 4, 17, 21, 0, tzinfo=UTC),
            end_at=datetime(2026, 4, 19, 13, 0, tzinfo=UTC),
            deadline=datetime(2026, 4, 19, 13, 0, tzinfo=UTC),
            leaderboard_public=True,
            results_published=True,
            judge_comments_visible=True,
        )
        db.add(event)
        db.flush()

        criteria_data = [
            ("Техническая реализация", 40, 10),
            ("Бизнес-ценность", 35, 10),
            ("Качество презентации", 25, 10),
        ]
        criteria: list[Criterion] = []
        for idx, (name, weight, max_score) in enumerate(criteria_data):
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

        stages_data = ["Разработка", "Тестирование", "Демо"]
        stages: list[Stage] = []
        for order, name in enumerate(stages_data):
            s = Stage(id=uuid.uuid4(), event_id=event.id, name=name, order=order)
            db.add(s)
            stages.append(s)
        db.flush()

        team_score_values = [
            [9, 8, 9],
            [7, 9, 8],
            [8, 7, 7],
        ]
        teams: list[Team] = []
        for i, (team_name, owner_email, score_row) in enumerate(
            zip(TEAM_NAMES, TEAM_EMAILS, team_score_values, strict=True)
        ):
            team = Team(
                id=uuid.uuid4(),
                event_id=event.id,
                name=team_name,
                contacts={"owner_email": owner_email},
            )
            db.add(team)
            teams.append(team)
            db.flush()

            for stage in stages:
                status = StageStatus.done if stage.order < 2 else StageStatus.in_progress
                db.add(TeamStageProgress(
                    id=uuid.uuid4(),
                    team_id=team.id,
                    stage_id=stage.id,
                    status=status,
                    updated_by=team_users[i].id,
                ))

            for judge in judges:
                for crit, val in zip(criteria, score_row, strict=True):
                    db.add(Score(
                        id=uuid.uuid4(),
                        team_id=team.id,
                        judge_id=judge.id,
                        criterion_id=crit.id,
                        value=val,
                        comment=f"Судья {judge.name}: хорошая работа по критерию «{crit.name}»",
                        status=ScoreStatus.submitted,
                        submitted_at=_now(),
                    ))

        db.commit()
        print("✓ Seed complete")
        print(f"  Admin:   {ADMIN_EMAIL} / demo1234")
        print(f"  Judges:  {', '.join(JUDGE_EMAILS)} / demo1234")
        print(f"  Teams:   {', '.join(TEAM_EMAILS)} / demo1234")
        print(f"  Event:   {event.name} (id={event.id})")
        print(f"  Leaderboard: http://localhost:5173/events/{event.id}/leaderboard")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
