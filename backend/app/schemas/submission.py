from pydantic import BaseModel, ConfigDict, Field


class SubmissionIn(BaseModel):
    description: str | None = Field(default=None, max_length=2000)
    repo_url: str | None = Field(default=None, max_length=500)
    demo_url: str | None = Field(default=None, max_length=500)
    video_url: str | None = Field(default=None, max_length=500)
    screenshot_url: str | None = Field(default=None, max_length=500)


class SubmissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    description: str | None
    repo_url: str | None
    demo_url: str | None
    video_url: str | None
    screenshot_url: str | None


class CheckItemOut(BaseModel):
    key: str
    label: str
    status: str
    message: str


class CheckResultOut(BaseModel):
    overall: str
    items: list[CheckItemOut]


class PreviewCoverageOut(BaseModel):
    criterion_id: str
    criterion_name: str
    coverage: str
    note: str


class PreviewOut(BaseModel):
    one_liner: str
    features: list[str]
    coverage: list[PreviewCoverageOut]
    weak_spots: list[str]
    likely_questions: list[str]
