from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class StageStatus(enum.StrEnum):
    pending = "pending"
    in_progress = "in_progress"
    done = "done"


class Stage(Base):
    __tablename__ = "stages"
    __table_args__ = (
        UniqueConstraint("event_id", "order", name="uq_stage_event_order"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(), primary_key=True, default=uuid.uuid4)
    event_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class TeamStageProgress(Base):
    __tablename__ = "team_stage_progress"
    __table_args__ = (
        UniqueConstraint("team_id", "stage_id", name="uq_progress_team_stage"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(), primary_key=True, default=uuid.uuid4)
    team_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False, index=True
    )
    stage_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(), ForeignKey("stages.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[StageStatus] = mapped_column(
        Enum(StageStatus, name="stage_status"),
        nullable=False,
        default=StageStatus.pending,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    updated_by: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
