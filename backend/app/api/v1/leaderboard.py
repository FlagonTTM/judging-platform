import uuid

from fastapi import APIRouter

from app.api.deps import DbSession
from app.schemas.score import LeaderboardRow
from app.services import leaderboard as svc

router = APIRouter(tags=["leaderboard"])


@router.get("/events/{event_id}/leaderboard", response_model=list[LeaderboardRow])
def get_leaderboard(event_id: uuid.UUID, db: DbSession) -> list[LeaderboardRow]:
    return [LeaderboardRow(**row) for row in svc.compute(db, event_id)]
