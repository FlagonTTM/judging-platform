"""create domain tables

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-18 04:30:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "events",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("start_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deadline", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_table(
        "teams",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "event_id",
            sa.Uuid(),
            sa.ForeignKey("events.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("track", sa.String(255), nullable=True),
        sa.Column("members", sa.JSON(), nullable=False),
        sa.Column("contacts", sa.JSON(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_teams_event_id", "teams", ["event_id"])
    op.create_table(
        "criteria",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "event_id",
            sa.Uuid(),
            sa.ForeignKey("events.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("weight", sa.Integer(), nullable=False),
        sa.Column("max_score", sa.Integer(), nullable=False),
    )
    op.create_index("ix_criteria_event_id", "criteria", ["event_id"])
    op.create_table(
        "scores",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "team_id",
            sa.Uuid(),
            sa.ForeignKey("teams.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "judge_id",
            sa.Uuid(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "criterion_id",
            sa.Uuid(),
            sa.ForeignKey("criteria.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("value", sa.Numeric(5, 2), nullable=False),
        sa.Column("comment", sa.String(2000), nullable=True),
        sa.Column(
            "status",
            sa.Enum("draft", "submitted", name="score_status"),
            nullable=False,
        ),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.UniqueConstraint("team_id", "judge_id", "criterion_id", name="uq_score_judge_team_crit"),
    )
    op.create_index("ix_scores_team_id", "scores", ["team_id"])
    op.create_index("ix_scores_judge_id", "scores", ["judge_id"])
    op.create_index("ix_scores_criterion_id", "scores", ["criterion_id"])


def downgrade() -> None:
    op.drop_index("ix_scores_criterion_id", table_name="scores")
    op.drop_index("ix_scores_judge_id", table_name="scores")
    op.drop_index("ix_scores_team_id", table_name="scores")
    op.drop_table("scores")
    op.execute("DROP TYPE IF EXISTS score_status")
    op.drop_index("ix_criteria_event_id", table_name="criteria")
    op.drop_table("criteria")
    op.drop_index("ix_teams_event_id", table_name="teams")
    op.drop_table("teams")
    op.drop_table("events")
