import uuid
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import CurrentUser, DbSession
from app.api.guards import require_judge
from app.models.event import Event
from app.models.score import Score
from app.models.team import Team
from app.models.user import User, UserRole
from app.schemas.score import BulkScoresIn, ScoreOut, TeamResultOut
from app.services import leaderboard as lb_svc
from app.services import scores as svc
from app.services import teams as teams_svc

router = APIRouter(tags=["scores"])

JudgeUser = Annotated[User, Depends(require_judge)]


def _to_out(s: Score) -> ScoreOut:
    return ScoreOut(
        id=str(s.id),
        team_id=str(s.team_id),
        criterion_id=str(s.criterion_id),
        judge_id=str(s.judge_id),
        value=s.value,
        comment=s.comment,
        status=s.status.value,
        submitted_at=s.submitted_at,
    )


def _team_or_404(db: DbSession, team_id: uuid.UUID) -> Team:
    team = db.get(Team, team_id)
    if team is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "team not found")
    return team


@router.get("/teams/{team_id}/scores/me", response_model=list[ScoreOut])
def list_my_scores(team_id: uuid.UUID, db: DbSession, user: JudgeUser) -> list[ScoreOut]:
    return [_to_out(s) for s in svc.list_my_for_team(db, team_id=team_id, judge_id=user.id)]


@router.put("/teams/{team_id}/scores", response_model=list[ScoreOut])
def upsert_scores(
    team_id: uuid.UUID,
    payload: BulkScoresIn,
    db: DbSession,
    user: JudgeUser,
) -> list[ScoreOut]:
    team = _team_or_404(db, team_id)
    try:
        result = svc.upsert_drafts(
            db,
            event_id=team.event_id,
            team_id=team_id,
            judge_id=user.id,
            items=[(uuid.UUID(i.criterion_id), i.value, i.comment) for i in payload.items],
        )
    except svc.ScoreValidationError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, str(exc)) from exc
    return [_to_out(s) for s in result]


@router.post("/teams/{team_id}/scores/submit", response_model=list[ScoreOut])
def submit_scores(team_id: uuid.UUID, db: DbSession, user: JudgeUser) -> list[ScoreOut]:
    team = _team_or_404(db, team_id)
    try:
        result = svc.submit_for_team(
            db, team_id=team_id, judge_id=user.id, event_id=team.event_id
        )
    except svc.ScoreValidationError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, str(exc)) from exc
    return [_to_out(s) for s in result]


@router.get("/teams/{team_id}/result", response_model=TeamResultOut)
def get_team_result(
    team_id: uuid.UUID,
    db: DbSession,
    user: CurrentUser,
) -> TeamResultOut:
    team = _team_or_404(db, team_id)
    event = db.get(Event, team.event_id)
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "event not found")
    if user.role == UserRole.team:
        if not teams_svc.is_owner(team, user.email):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "not your team")
        if not event.results_published:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "results not published yet")
    rows = lb_svc.compute(db, team.event_id)
    for rank, row in enumerate(rows, 1):
        if row["team_id"] == str(team_id):
            return TeamResultOut(rank=rank, **row)
    return TeamResultOut(
        team_id=str(team_id),
        team_name=team.name,
        rank=len(rows) + 1,
        final_score=Decimal("0.00"),
        judges_count=0,
    )
