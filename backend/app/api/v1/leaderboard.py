import uuid
from typing import Annotated

from fastapi import APIRouter, Cookie, HTTPException, status

from app.api.deps import DbSession
from app.core.security import decode_access_token
from app.models.event import Event
from app.models.user import User, UserRole
from app.schemas.score import LeaderboardRow
from app.services import leaderboard as svc

router = APIRouter(tags=["leaderboard"])

OptCookie = Annotated[str | None, Cookie(alias="access_token")]


def _maybe_user(db: DbSession, token: str | None) -> User | None:
    if token is None:
        return None
    try:
        payload = decode_access_token(token)
        return db.get(User, uuid.UUID(payload["sub"]))
    except (ValueError, KeyError):
        return None


@router.get("/events/{event_id}/leaderboard", response_model=list[LeaderboardRow])
def get_leaderboard(
    event_id: uuid.UUID,
    db: DbSession,
    access_token: OptCookie = None,
) -> list[LeaderboardRow]:
    event = db.get(Event, event_id)
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "event not found")
    if not event.leaderboard_public:
        user = _maybe_user(db, access_token)
        if user is None or user.role == UserRole.team:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "leaderboard not published")
    return [LeaderboardRow(**row) for row in svc.compute(db, event_id)]
