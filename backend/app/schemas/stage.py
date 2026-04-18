from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.models.stage import StageStatus


class StageCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    order: int = Field(ge=0)


class StageUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    order: int | None = Field(default=None, ge=0)


class StageOut(BaseModel):
    id: str
    event_id: str
    name: str
    order: int


class ProgressUpdate(BaseModel):
    stage_id: str
    status: StageStatus


class TeamProgressItem(BaseModel):
    stage_id: str
    stage_name: str
    order: int
    status: StageStatus
    updated_at: datetime | None


class TeamProgressOut(BaseModel):
    team_id: str
    items: list[TeamProgressItem]


class EventProgressRow(BaseModel):
    team_id: str
    team_name: str
    items: list[TeamProgressItem]
