import uuid
from collections.abc import Iterable
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.criterion import Criterion
from app.models.score import Score, ScoreStatus


class ScoreValidationError(Exception):
    pass


def _criteria_for_event(db: Session, event_id: uuid.UUID) -> dict[uuid.UUID, Criterion]:
    rows = db.scalars(select(Criterion).where(Criterion.event_id == event_id)).all()
    return {c.id: c for c in rows}


def _existing(
    db: Session, team_id: uuid.UUID, judge_id: uuid.UUID
) -> dict[uuid.UUID, Score]:
    rows = db.scalars(
        select(Score).where(Score.team_id == team_id, Score.judge_id == judge_id)
    ).all()
    return {s.criterion_id: s for s in rows}


def upsert_drafts(
    db: Session,
    *,
    event_id: uuid.UUID,
    team_id: uuid.UUID,
    judge_id: uuid.UUID,
    items: Iterable[tuple[uuid.UUID, Decimal, str | None]],
) -> list[Score]:
    crits = _criteria_for_event(db, event_id)
    existing = _existing(db, team_id, judge_id)
    result: list[Score] = []
    for criterion_id, value, comment in items:
        crit = crits.get(criterion_id)
        if crit is None:
            raise ScoreValidationError(f"criterion {criterion_id} not in event")
        if value < 0 or value > Decimal(crit.max_score):
            raise ScoreValidationError(
                f"value {value} out of range [0, {crit.max_score}] for {crit.name}"
            )
        score = existing.get(criterion_id)
        if score is None:
            score = Score(
                team_id=team_id,
                judge_id=judge_id,
                criterion_id=criterion_id,
                value=value,
                comment=comment,
                status=ScoreStatus.draft,
            )
            db.add(score)
        else:
            if score.status == ScoreStatus.submitted:
                raise ScoreValidationError(
                    f"score for {crit.name} already submitted, cannot edit"
                )
            score.value = value
            score.comment = comment
        result.append(score)
    db.commit()
    for s in result:
        db.refresh(s)
    return result


def submit_for_team(
    db: Session, *, team_id: uuid.UUID, judge_id: uuid.UUID, event_id: uuid.UUID
) -> list[Score]:
    crits = _criteria_for_event(db, event_id)
    existing = _existing(db, team_id, judge_id)
    missing = [c.name for cid, c in crits.items() if cid not in existing]
    if missing:
        raise ScoreValidationError(f"missing scores for: {', '.join(missing)}")
    now = datetime.now(UTC)
    for s in existing.values():
        if s.status == ScoreStatus.draft:
            s.status = ScoreStatus.submitted
            s.submitted_at = now
    db.commit()
    return list(existing.values())


def list_my_for_team(
    db: Session, *, team_id: uuid.UUID, judge_id: uuid.UUID
) -> list[Score]:
    return list(
        db.scalars(
            select(Score).where(Score.team_id == team_id, Score.judge_id == judge_id)
        )
    )
