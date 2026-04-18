from __future__ import annotations

from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal


@dataclass(frozen=True)
class CriterionScore:
    value: Decimal
    max_score: Decimal
    weight: Decimal  # 0-100


def judge_score(scores: list[CriterionScore]) -> Decimal:
    """Взвешенный балл от одного судьи в шкале 0-100."""
    total = Decimal("0")
    for s in scores:
        if s.max_score <= 0:
            raise ValueError("max_score must be > 0")
        total += s.value / s.max_score * s.weight
    return total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def final_score(judge_scores: list[Decimal]) -> Decimal:
    """Среднее по всем судьям."""
    if not judge_scores:
        return Decimal("0.00")
    avg = sum(judge_scores, Decimal("0")) / Decimal(len(judge_scores))
    return avg.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
