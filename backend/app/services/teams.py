import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.team import Team


def list_for_event(db: Session, event_id: uuid.UUID) -> list[Team]:
    return list(db.scalars(select(Team).where(Team.event_id == event_id).order_by(Team.name)))


def get(db: Session, team_id: uuid.UUID) -> Team | None:
    return db.get(Team, team_id)


def create(db: Session, event_id: uuid.UUID, **fields: Any) -> Team:
    team = Team(event_id=event_id, **fields)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


def update(db: Session, team: Team, **fields: Any) -> Team:
    for k, v in fields.items():
        setattr(team, k, v)
    db.commit()
    db.refresh(team)
    return team


def delete(db: Session, team: Team) -> None:
    db.delete(team)
    db.commit()
