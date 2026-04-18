import uuid

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.stage import Stage, StageStatus, TeamStageProgress
from app.models.team import Team


def get_team_items(
    db: Session, team: Team
) -> list[tuple[Stage, TeamStageProgress | None]]:
    stages = list(
        db.scalars(
            select(Stage).where(Stage.event_id == team.event_id).order_by(Stage.order)
        )
    )
    progress_by_stage = {
        p.stage_id: p
        for p in db.scalars(
            select(TeamStageProgress).where(TeamStageProgress.team_id == team.id)
        )
    }
    return [(s, progress_by_stage.get(s.id)) for s in stages]


def set_status(
    db: Session,
    team: Team,
    stage_id: uuid.UUID,
    status: StageStatus,
    actor_id: uuid.UUID,
) -> TeamStageProgress:
    stage = db.get(Stage, stage_id)
    if stage is None or stage.event_id != team.event_id:
        raise HTTPException(422, "stage not found in event")
    existing = db.scalar(
        select(TeamStageProgress).where(
            TeamStageProgress.team_id == team.id,
            TeamStageProgress.stage_id == stage_id,
        )
    )
    if existing is None:
        existing = TeamStageProgress(
            team_id=team.id, stage_id=stage_id, status=status, updated_by=actor_id
        )
        db.add(existing)
    else:
        existing.status = status
        existing.updated_by = actor_id
    db.commit()
    db.refresh(existing)
    return existing


def list_for_event(
    db: Session, event_id: uuid.UUID
) -> list[tuple[Team, list[tuple[Stage, TeamStageProgress | None]]]]:
    teams = list(
        db.scalars(select(Team).where(Team.event_id == event_id).order_by(Team.name))
    )
    return [(t, get_team_items(db, t)) for t in teams]
