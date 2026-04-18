from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ScoreIn(BaseModel):
    criterion_id: str
    value: Decimal = Field(ge=0)
    comment: str | None = Field(default=None, max_length=2000)


class BulkScoresIn(BaseModel):
    items: list[ScoreIn]


class ScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    team_id: str
    criterion_id: str
    judge_id: str
    value: Decimal
    comment: str | None
    status: str
    submitted_at: datetime | None


class LeaderboardRow(BaseModel):
    team_id: str
    team_name: str
    final_score: Decimal
    judges_count: int


class TeamResultOut(BaseModel):
    team_id: str
    team_name: str
    rank: int
    final_score: Decimal
    judges_count: int
