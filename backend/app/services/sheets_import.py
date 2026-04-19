from __future__ import annotations

import csv
import io
import re
import urllib.error
import urllib.request
import uuid
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.team import Team
from app.services import teams as teams_svc


class SheetImportError(ValueError):
    pass


_SHEET_ID_RE = re.compile(r"/spreadsheets/d/([a-zA-Z0-9-_]+)")
_GID_RE = re.compile(r"[?#&]gid=([0-9]+)")


def _to_csv_url(sheet_url: str) -> str:
    url = sheet_url.strip()
    if not url:
        raise SheetImportError("пустой URL")
    m = _SHEET_ID_RE.search(url)
    if not m:
        raise SheetImportError("не удалось распознать ID таблицы в URL")
    sheet_id = m.group(1)
    gid_match = _GID_RE.search(url)
    gid = gid_match.group(1) if gid_match else "0"
    return f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}"


def _fetch_csv(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "TulaHack-Import/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:  # noqa: S310
            raw = resp.read()
    except urllib.error.HTTPError as exc:
        raise SheetImportError(
            f"Google вернул {exc.code}: проверьте что таблица открыта по ссылке"
        ) from exc
    except urllib.error.URLError as exc:
        raise SheetImportError(f"не удалось скачать таблицу: {exc.reason}") from exc
    return raw.decode("utf-8-sig", errors="replace")


@dataclass
class ParsedTeam:
    name: str
    track: str | None
    owner_email: str | None
    telegram: str | None
    members: list[str]


def _parse_rows(text: str, skip_header: bool) -> list[ParsedTeam]:
    reader = csv.reader(io.StringIO(text))
    rows = [r for r in reader if any(cell.strip() for cell in r)]
    if skip_header and rows:
        rows = rows[1:]
    out: list[ParsedTeam] = []
    for row in rows:
        cells = [c.strip() for c in row]
        name = cells[0] if cells else ""
        if not name:
            continue
        track = cells[1] if len(cells) > 1 and cells[1] else None
        owner = cells[2] if len(cells) > 2 and cells[2] else None
        tg = cells[3] if len(cells) > 3 and cells[3] else None
        members = [c for c in cells[4:] if c]
        out.append(
            ParsedTeam(name=name, track=track, owner_email=owner, telegram=tg, members=members)
        )
    return out


@dataclass
class ImportResult:
    created: int
    skipped: int
    errors: list[str]


def import_from_sheet(
    db: Session, event_id: uuid.UUID, sheet_url: str, skip_header: bool = True
) -> ImportResult:
    csv_url = _to_csv_url(sheet_url)
    text = _fetch_csv(csv_url)
    parsed = _parse_rows(text, skip_header)
    if not parsed:
        raise SheetImportError("в таблице не найдено ни одной команды")

    existing = {
        t.name
        for t in db.scalars(select(Team).where(Team.event_id == event_id))
    }
    created = 0
    skipped = 0
    errors: list[str] = []
    for team in parsed:
        if team.name in existing:
            skipped += 1
            continue
        contacts: dict[str, str] = {}
        if team.owner_email:
            contacts["owner_email"] = team.owner_email
        if team.telegram:
            contacts["telegram"] = team.telegram
        members = [{"name": m} for m in team.members]
        try:
            teams_svc.create(
                db,
                event_id=event_id,
                name=team.name,
                track=team.track,
                members=members,
                contacts=contacts,
            )
            existing.add(team.name)
            created += 1
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{team.name}: {exc}")
    return ImportResult(created=created, skipped=skipped, errors=errors)
