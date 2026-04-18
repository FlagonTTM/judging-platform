import uuid
from collections import defaultdict
from decimal import Decimal
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.criterion import Criterion
from app.models.score import Score, ScoreStatus
from app.models.team import Team
from app.scoring.formula import CriterionScore, final_score, judge_score


def compute(db: Session, event_id: uuid.UUID) -> list[dict[str, Any]]:
    teams = list(db.scalars(select(Team).where(Team.event_id == event_id)))
    crits = {
        c.id: c for c in db.scalars(select(Criterion).where(Criterion.event_id == event_id))
    }
    if not crits:
        return [
            {
                "team_id": str(t.id),
                "team_name": t.name,
                "final_score": Decimal("0.00"),
                "judges_count": 0,
            }
            for t in teams
        ]

    rows: list[dict[str, Any]] = []
    for team in teams:
        scores = db.scalars(
            select(Score).where(
                Score.team_id == team.id, Score.status == ScoreStatus.submitted
            )
        ).all()
        by_judge: dict[uuid.UUID, dict[uuid.UUID, Score]] = defaultdict(dict)
        for s in scores:
            by_judge[s.judge_id][s.criterion_id] = s
        judge_totals: list[Decimal] = []
        for judge_scores in by_judge.values():
            if set(judge_scores.keys()) != set(crits.keys()):
                continue
            judge_totals.append(
                judge_score([
                    CriterionScore(
                        value=Decimal(str(judge_scores[cid].value)),
                        max_score=Decimal(crits[cid].max_score),
                        weight=Decimal(crits[cid].weight),
                    )
                    for cid in crits
                ])
            )
        rows.append({
            "team_id": str(team.id),
            "team_name": team.name,
            "final_score": final_score(judge_totals),
            "judges_count": len(judge_totals),
        })
    rows.sort(key=lambda r: r["final_score"], reverse=True)
    return rows
