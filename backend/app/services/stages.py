import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.stage import Stage


def list_for_event(db: Session, event_id: uuid.UUID) -> list[Stage]:
    return list(
        db.scalars(select(Stage).where(Stage.event_id == event_id).order_by(Stage.order))
    )


def get(db: Session, stage_id: uuid.UUID) -> Stage | None:
    return db.get(Stage, stage_id)


def create(db: Session, event_id: uuid.UUID, name: str, order: int) -> Stage:
    stage = Stage(event_id=event_id, name=name, order=order)
    db.add(stage)
    db.commit()
    db.refresh(stage)
    return stage


def update(db: Session, stage: Stage, **fields: object) -> Stage:
    for k, v in fields.items():
        if v is not None:
            setattr(stage, k, v)
    db.commit()
    db.refresh(stage)
    return stage


def delete(db: Session, stage: Stage) -> None:
    db.delete(stage)
    db.commit()
