import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.api.v1.events import AdminUser
from app.models.team import Team
from app.schemas.team import TeamCreate, TeamOut, TeamUpdate
from app.services import teams as svc

router = APIRouter(tags=["teams"])


def _to_out(t: Team) -> TeamOut:
    return TeamOut(
        id=str(t.id),
        event_id=str(t.event_id),
        name=t.name,
        track=t.track,
        members=t.members,
        contacts=t.contacts,
    )


@router.get("/me/team", response_model=TeamOut | None)
def my_team(db: DbSession, user: CurrentUser) -> TeamOut | None:
    teams = db.scalars(select(Team)).all()
    for t in teams:
        if t.contacts.get("owner_email") == user.email:
            return _to_out(t)
    return None


@router.get("/events/{event_id}/teams", response_model=list[TeamOut])
def list_teams(event_id: uuid.UUID, db: DbSession) -> list[TeamOut]:
    return [_to_out(t) for t in svc.list_for_event(db, event_id)]


@router.post(
    "/events/{event_id}/teams",
    response_model=TeamOut,
    status_code=status.HTTP_201_CREATED,
)
def create_team(
    event_id: uuid.UUID,
    payload: TeamCreate,
    db: DbSession,
    _: AdminUser,
) -> TeamOut:
    return _to_out(svc.create(db, event_id, **payload.model_dump()))


@router.get("/teams/{team_id}", response_model=TeamOut)
def get_team(team_id: uuid.UUID, db: DbSession, _: CurrentUser) -> TeamOut:
    team = svc.get(db, team_id)
    if team is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "team not found")
    return _to_out(team)


@router.patch("/teams/{team_id}", response_model=TeamOut)
def update_team(
    team_id: uuid.UUID,
    payload: TeamUpdate,
    db: DbSession,
    _: AdminUser,
) -> TeamOut:
    team = svc.get(db, team_id)
    if team is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "team not found")
    return _to_out(svc.update(db, team, **payload.model_dump(exclude_unset=True)))


@router.delete("/teams/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(team_id: uuid.UUID, db: DbSession, _: AdminUser) -> None:
    team = svc.get(db, team_id)
    if team is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "team not found")
    svc.delete(db, team)
