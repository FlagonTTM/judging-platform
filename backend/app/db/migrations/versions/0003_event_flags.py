"""event flags

Revision ID: 0003
Revises: 0002
Create Date: 2026-04-18 14:23:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "events",
        sa.Column("results_published", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "events",
        sa.Column("leaderboard_public", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "events",
        sa.Column(
            "judge_comments_visible", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
    )


def downgrade() -> None:
    op.drop_column("events", "judge_comments_visible")
    op.drop_column("events", "leaderboard_public")
    op.drop_column("events", "results_published")
