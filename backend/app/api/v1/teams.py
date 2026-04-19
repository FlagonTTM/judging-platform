import uuid

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.api.v1.events import AdminUser
from app.models.team import Team
from app.models.user import User, UserRole
from app.schemas.submission import (
    CheckItemOut,
    CheckResultOut,
    PreviewCoverageOut,
    PreviewOut,
    SubmissionIn,
    SubmissionOut,
)
from app.schemas.team import TeamCreate, TeamOut, TeamUpdate
from app.services import sheets_import as sheets_svc
from app.services import submission as sub_svc
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


class ImportTeamsIn(BaseModel):
    sheet_url: str = Field(min_length=1)
    skip_header: bool = True


class ImportTeamsOut(BaseModel):
    created: int
    skipped: int
    errors: list[str]


@router.post("/events/{event_id}/teams/import", response_model=ImportTeamsOut)
def import_teams(
    event_id: uuid.UUID,
    payload: ImportTeamsIn,
    db: DbSession,
    _: AdminUser,
) -> ImportTeamsOut:
    try:
        result = sheets_svc.import_from_sheet(
            db, event_id, payload.sheet_url, skip_header=payload.skip_header
        )
    except sheets_svc.SheetImportError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
    return ImportTeamsOut(
        created=result.created, skipped=result.skipped, errors=result.errors
    )


def _team_for_submission(db: DbSession, team_id: uuid.UUID, user: User, *, write: bool) -> Team:
    team = svc.get(db, team_id)
    if team is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "team not found")
    if user.role == UserRole.admin:
        return team
    if user.role == UserRole.team:
        if not svc.is_owner(team, user.email):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "not your team")
        return team
    if user.role == UserRole.judge and not write:
        return team
    raise HTTPException(status.HTTP_403_FORBIDDEN, "forbidden")


def _submission_out(team: Team) -> SubmissionOut:
    data = sub_svc.normalize(team.submission or {})
    return SubmissionOut(**data)


@router.get("/teams/{team_id}/submission", response_model=SubmissionOut)
def get_submission(
    team_id: uuid.UUID, db: DbSession, user: CurrentUser
) -> SubmissionOut:
    team = _team_for_submission(db, team_id, user, write=False)
    return _submission_out(team)


@router.put("/teams/{team_id}/submission", response_model=SubmissionOut)
def put_submission(
    team_id: uuid.UUID,
    payload: SubmissionIn,
    db: DbSession,
    user: CurrentUser,
) -> SubmissionOut:
    team = _team_for_submission(db, team_id, user, write=True)
    team.submission = sub_svc.normalize(payload.model_dump())
    db.commit()
    db.refresh(team)
    return _submission_out(team)


@router.post("/teams/{team_id}/submission/check", response_model=CheckResultOut)
def check_submission(
    team_id: uuid.UUID, db: DbSession, user: CurrentUser
) -> CheckResultOut:
    team = _team_for_submission(db, team_id, user, write=False)
    result = sub_svc.run_check(team.submission or {})
    return CheckResultOut(
        overall=result.overall,
        items=[CheckItemOut(**i.__dict__) for i in result.items],
    )


@router.post("/teams/{team_id}/submission/preview", response_model=PreviewOut)
def preview_submission(
    team_id: uuid.UUID, db: DbSession, user: CurrentUser
) -> PreviewOut:
    team = _team_for_submission(db, team_id, user, write=False)
    result = sub_svc.run_preview(db, team.event_id, team.submission or {})
    return PreviewOut(
        one_liner=result.one_liner,
        features=result.features,
        coverage=[PreviewCoverageOut(**c.__dict__) for c in result.coverage],
        weak_spots=result.weak_spots,
        likely_questions=result.likely_questions,
    )
