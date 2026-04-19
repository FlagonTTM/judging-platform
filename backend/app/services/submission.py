from __future__ import annotations

import re
import urllib.error
import urllib.request
import uuid
from dataclasses import dataclass
from typing import Any

from sqlalchemy.orm import Session

from app.models.criterion import Criterion
from sqlalchemy import select


SUBMISSION_FIELDS = (
    "description",
    "repo_url",
    "demo_url",
    "video_url",
    "screenshot_url",
)

_URL_FIELDS = ("repo_url", "demo_url", "video_url", "screenshot_url")

_SENT_SPLIT = re.compile(r"(?<=[.!?])\s+")
_VAGUE_TERMS = (
    "инновационн",
    "уникальн",
    "лучш",
    "революционн",
    "безгранич",
    "мощн",
    "удобн",
    "прост",
    "современн",
    "эффективн",
)


def normalize(submission: dict[str, Any]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key in SUBMISSION_FIELDS:
        value = submission.get(key)
        if isinstance(value, str):
            value = value.strip()
        result[key] = value or None
    return result


@dataclass
class CheckItem:
    key: str
    label: str
    status: str  # ok | missing | weak | broken
    message: str


@dataclass
class CheckResult:
    overall: str  # ready | weak | not_ready
    items: list[CheckItem]


def _check_url(url: str) -> tuple[bool, str]:
    try:
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "TulaHack/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:  # noqa: S310
            code = resp.getcode()
            if 200 <= code < 400:
                return True, f"{code}"
            return False, f"HTTP {code}"
    except urllib.error.HTTPError as exc:
        if exc.code in (405, 501):
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "TulaHack/1.0"})
                with urllib.request.urlopen(req, timeout=5) as resp:  # noqa: S310
                    code = resp.getcode()
                    if 200 <= code < 400:
                        return True, f"{code}"
            except Exception:  # noqa: BLE001
                pass
        return False, f"HTTP {exc.code}"
    except Exception as exc:  # noqa: BLE001
        return False, str(exc)[:80]


def run_check(submission: dict[str, Any]) -> CheckResult:
    data = normalize(submission)
    items: list[CheckItem] = []

    desc = data.get("description") or ""
    if not desc:
        items.append(
            CheckItem(
                key="description",
                label="Короткое описание",
                status="missing",
                message="Добавьте 2–3 предложения о сути проекта",
            )
        )
    elif len(desc) < 40:
        items.append(
            CheckItem(
                key="description",
                label="Короткое описание",
                status="weak",
                message="Слишком коротко — жюри не поймёт суть",
            )
        )
    elif len(desc) > 1000:
        items.append(
            CheckItem(
                key="description",
                label="Короткое описание",
                status="weak",
                message="Слишком длинно — сократите до 2–3 предложений",
            )
        )
    else:
        items.append(
            CheckItem(
                key="description",
                label="Короткое описание",
                status="ok",
                message="Готово",
            )
        )

    labels = {
        "repo_url": "Ссылка на репозиторий",
        "demo_url": "Demo-ссылка",
        "video_url": "Demo-видео",
        "screenshot_url": "Скриншот",
    }
    for key in _URL_FIELDS:
        url = data.get(key)
        if not url:
            items.append(
                CheckItem(key=key, label=labels[key], status="missing", message="Не указано")
            )
            continue
        ok, info = _check_url(url)
        if ok:
            items.append(CheckItem(key=key, label=labels[key], status="ok", message=info))
        else:
            items.append(
                CheckItem(key=key, label=labels[key], status="broken", message=info)
            )

    statuses = {it.status for it in items}
    if statuses <= {"ok"}:
        overall = "ready"
    elif "broken" in statuses or ("missing" in statuses and {"description"} & {it.key for it in items if it.status == "missing"}):
        overall = "not_ready"
    else:
        overall = "weak"
    return CheckResult(overall=overall, items=items)


@dataclass
class PreviewCoverage:
    criterion_id: str
    criterion_name: str
    coverage: str  # strong | partial | missing
    note: str


@dataclass
class PreviewResult:
    one_liner: str
    features: list[str]
    coverage: list[PreviewCoverage]
    weak_spots: list[str]
    likely_questions: list[str]


def _split_sentences(text: str) -> list[str]:
    text = text.strip()
    if not text:
        return []
    parts = _SENT_SPLIT.split(text)
    return [p.strip() for p in parts if p.strip()]


def _extract_features(description: str) -> list[str]:
    if not description:
        return []
    bullets: list[str] = []
    for line in description.splitlines():
        line = line.strip()
        if not line:
            continue
        m = re.match(r"^[\-\*•·]\s*(.+)$", line)
        if m:
            bullets.append(m.group(1).strip())
            continue
        m = re.match(r"^\d+[.)]\s*(.+)$", line)
        if m:
            bullets.append(m.group(1).strip())
    if bullets:
        return bullets[:3]
    sentences = _split_sentences(description)
    return sentences[1:4]


def _keyword_hit(text: str, name: str) -> bool:
    if not text or not name:
        return False
    text_low = text.lower()
    tokens = [t for t in re.split(r"\W+", name.lower()) if len(t) >= 4]
    if not tokens:
        return name.lower() in text_low
    return any(t in text_low for t in tokens)


def _detect_weaknesses(description: str, data: dict[str, Any]) -> list[str]:
    weak: list[str] = []
    desc_low = (description or "").lower()

    for term in _VAGUE_TERMS:
        if term in desc_low:
            weak.append(
                f"Слово с корнем «{term}» без конкретики — заменить на метрику или факт"
            )
            break

    if description and not re.search(r"\d", description):
        weak.append("Нет ни одной цифры — добавьте метрику, срок или объём")

    if not data.get("demo_url") and not data.get("video_url"):
        weak.append("Нет ни demo-ссылки, ни видео — судья не сможет потрогать продукт")

    if description and len(description.split()) < 25:
        weak.append("Описание слишком короткое — жюри не прочувствует проблему")

    return weak[:4]


def _likely_questions(coverage: list[PreviewCoverage], data: dict[str, Any]) -> list[str]:
    qs: list[str] = []
    missing = [c for c in coverage if c.coverage == "missing"]
    for c in missing[:2]:
        qs.append(f"Как именно проект закрывает критерий «{c.criterion_name}»?")

    if not data.get("demo_url") and not data.get("video_url"):
        qs.append("Где можно увидеть проект в работе прямо сейчас?")
    if not data.get("repo_url"):
        qs.append("Есть ли публичный репозиторий с кодом?")
    if data.get("description") and not re.search(r"\d", data["description"]):
        qs.append("Какие измеримые эффекты даёт ваше решение?")
    return qs[:3]


def run_preview(
    db: Session, event_id: uuid.UUID, submission: dict[str, Any]
) -> PreviewResult:
    data = normalize(submission)
    description = data.get("description") or ""
    sentences = _split_sentences(description)
    one_liner = sentences[0] if sentences else "—"

    features = _extract_features(description)

    crits = list(db.scalars(select(Criterion).where(Criterion.event_id == event_id)))
    coverage: list[PreviewCoverage] = []
    for c in crits:
        desc_hit = _keyword_hit(description, c.name)
        extra_text = " ".join(filter(None, [data.get("demo_url"), data.get("repo_url")]))
        has_link = bool(data.get("demo_url") or data.get("video_url"))
        if desc_hit and has_link:
            cov, note = "strong", "Упомянуто в описании, есть demo"
        elif desc_hit:
            cov, note = "partial", "Упомянуто, но судье нужен артефакт"
        elif _keyword_hit(extra_text, c.name):
            cov, note = "partial", "Есть намёк в ссылках, но не в описании"
        else:
            cov, note = "missing", "Не раскрыт ни в описании, ни в ссылках"
        coverage.append(
            PreviewCoverage(
                criterion_id=str(c.id),
                criterion_name=c.name,
                coverage=cov,
                note=note,
            )
        )

    weak = _detect_weaknesses(description, data)
    questions = _likely_questions(coverage, data)

    return PreviewResult(
        one_liner=one_liner,
        features=features,
        coverage=coverage,
        weak_spots=weak,
        likely_questions=questions,
    )
