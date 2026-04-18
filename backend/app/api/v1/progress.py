import uuid

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DbSession
from app.api.guards_team import TeamUser
from app.models.stage import Stage, StageStatus, TeamStageProgress
from app.models.user import UserRole
from app.schemas.stage import (
    EventProgressRow,
    ProgressUpdate,
    TeamProgressItem,
    TeamProgressOut,
)
from app.services import progress as svc
from app.services import teams as teams_svc

router = APIRouter(tags=["progress"])


def _items_to_out(
    items: list[tuple[Stage, TeamStageProgress | None]],
) -> list[TeamProgressItem]:
    return [
        TeamProgressItem(
            stage_id=str(s.id),
            stage_name=s.name,
            order=s.order,
            status=p.status if p else StageStatus.pending,
            updated_at=p.updated_at if p else None,
        )
        for s, p in items
    ]


@router.get("/teams/{team_id}/progress", response_model=TeamProgressOut)
def get_team_progress(
    team_id: uuid.UUID, db: DbSession, user: CurrentUser
) -> TeamProgressOut:
    team = teams_svc.get(db, team_id)
    if team is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "team not found")
    if user.role == UserRole.team and not teams_svc.is_owner(team, user.email):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "not your team")
    items = svc.get_team_items(db, team)
    return TeamProgressOut(team_id=str(team.id), items=_items_to_out(items))


@router.put("/teams/{team_id}/progress", response_model=TeamProgressOut)
def set_team_progress(
    team_id: uuid.UUID,
    payload: ProgressUpdate,
    db: DbSession,
    user: TeamUser,
) -> TeamProgressOut:
    team = teams_svc.get(db, team_id)
    if team is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "team not found")
    if user.role == UserRole.team and not teams_svc.is_owner(team, user.email):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "not your team")
    svc.set_status(db, team, uuid.UUID(payload.stage_id), payload.status, user.id)
    items = svc.get_team_items(db, team)
    return TeamProgressOut(team_id=str(team.id), items=_items_to_out(items))


@router.get("/events/{event_id}/progress", response_model=list[EventProgressRow])
def event_progress(
    event_id: uuid.UUID, db: DbSession, user: CurrentUser
) -> list[EventProgressRow]:
    if user.role == UserRole.team:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "admin/judge only")
    rows = svc.list_for_event(db, event_id)
    return [
        EventProgressRow(
            team_id=str(t.id), team_name=t.name, items=_items_to_out(items)
        )
        for t, items in rows
    ]
