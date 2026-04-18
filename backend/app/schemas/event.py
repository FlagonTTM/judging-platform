from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class EventCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    start_at: datetime
    end_at: datetime
    deadline: datetime | None = None


class EventUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    start_at: datetime | None = None
    end_at: datetime | None = None
    deadline: datetime | None = None
    results_published: bool | None = None
    leaderboard_public: bool | None = None
    judge_comments_visible: bool | None = None


class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    start_at: datetime
    end_at: datetime
    deadline: datetime | None
    results_published: bool
    leaderboard_public: bool
    judge_comments_visible: bool
