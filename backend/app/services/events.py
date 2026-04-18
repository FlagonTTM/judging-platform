import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.event import Event


def list_events(db: Session) -> list[Event]:
    return list(db.scalars(select(Event).order_by(Event.start_at.desc())))


def get_event(db: Session, event_id: uuid.UUID) -> Event | None:
    return db.get(Event, event_id)


def create_event(db: Session, **fields: Any) -> Event:
    event = Event(**fields)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def update_event(db: Session, event: Event, **fields: Any) -> Event:
    for k, v in fields.items():
        if v is not None:
            setattr(event, k, v)
    db.commit()
    db.refresh(event)
    return event


def delete_event(db: Session, event: Event) -> None:
    db.delete(event)
    db.commit()
