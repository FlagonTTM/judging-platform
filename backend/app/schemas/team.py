from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class TeamCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    track: str | None = Field(default=None, max_length=255)
    members: list[dict[str, Any]] = Field(default_factory=list)
    contacts: dict[str, Any] = Field(default_factory=dict)


class TeamUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    track: str | None = Field(default=None, max_length=255)
    members: list[dict[str, Any]] | None = None
    contacts: dict[str, Any] | None = None


class TeamOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    event_id: str
    name: str
    track: str | None
    members: list[dict[str, Any]]
    contacts: dict[str, Any]
