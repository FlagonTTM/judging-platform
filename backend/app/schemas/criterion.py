from pydantic import BaseModel, ConfigDict, Field


class CriterionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    weight: int = Field(ge=1, le=100)
    max_score: int = Field(ge=1, le=1000)


class CriterionUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    weight: int | None = Field(default=None, ge=1, le=100)
    max_score: int | None = Field(default=None, ge=1, le=1000)


class CriterionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    event_id: str
    name: str
    description: str | None
    weight: int
    max_score: int
