import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.criterion import Criterion


class WeightSumError(Exception):
    pass


def list_for_event(db: Session, event_id: uuid.UUID) -> list[Criterion]:
    return list(db.scalars(select(Criterion).where(Criterion.event_id == event_id)))


def get(db: Session, criterion_id: uuid.UUID) -> Criterion | None:
    return db.get(Criterion, criterion_id)


def total_weight(db: Session, event_id: uuid.UUID, *, exclude_id: uuid.UUID | None = None) -> int:
    crits = list_for_event(db, event_id)
    return sum(c.weight for c in crits if c.id != exclude_id)


def create(db: Session, event_id: uuid.UUID, **fields) -> Criterion:
    new_total = total_weight(db, event_id) + fields["weight"]
    if new_total > 100:
        raise WeightSumError(f"sum of weights would be {new_total}, max 100")
    crit = Criterion(event_id=event_id, **fields)
    db.add(crit)
    db.commit()
    db.refresh(crit)
    return crit


def update(db: Session, crit: Criterion, **fields) -> Criterion:
    new_weight = fields.get("weight", crit.weight)
    if new_weight is not None and new_weight != crit.weight:
        new_total = total_weight(db, crit.event_id, exclude_id=crit.id) + new_weight
        if new_total > 100:
            raise WeightSumError(f"sum of weights would be {new_total}, max 100")
    for k, v in fields.items():
        if v is not None:
            setattr(crit, k, v)
    db.commit()
    db.refresh(crit)
    return crit


def delete(db: Session, crit: Criterion) -> None:
    db.delete(crit)
    db.commit()
