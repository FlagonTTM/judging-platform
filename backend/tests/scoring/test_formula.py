from decimal import Decimal

import pytest

from app.scoring.formula import CriterionScore, final_score, judge_score


def test_judge_score_example_from_spec():
    result = judge_score([
        CriterionScore(Decimal("8"), Decimal("10"), Decimal("40")),
        CriterionScore(Decimal("7"), Decimal("10"), Decimal("60")),
    ])
    assert result == Decimal("74.00")


def test_judge_score_full_marks():
    result = judge_score([CriterionScore(Decimal("10"), Decimal("10"), Decimal("100"))])
    assert result == Decimal("100.00")


def test_judge_score_zero_max_raises():
    with pytest.raises(ValueError):
        judge_score([CriterionScore(Decimal("5"), Decimal("0"), Decimal("100"))])


def test_final_score_avg():
    assert final_score([Decimal("70"), Decimal("80"), Decimal("90")]) == Decimal("80.00")


def test_final_score_empty():
    assert final_score([]) == Decimal("0.00")


def test_final_score_rounding_half_up():
    assert final_score([Decimal("50"), Decimal("51")]) == Decimal("50.50")
