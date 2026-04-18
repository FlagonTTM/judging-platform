import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import DbSession
from app.api.guards import require_admin
from app.models.event import Event
from app.models.user import User
from app.schemas.event import EventCreate, EventOut, EventUpdate
from app.services import events as svc

router = APIRouter(prefix="/events", tags=["events"])

AdminUser = Annotated[User, Depends(require_admin)]


def _to_out(e: Event) -> EventOut:
    return EventOut(
        id=str(e.id),
        name=e.name,
        start_at=e.start_at,
        end_at=e.end_at,
        deadline=e.deadline,
    )


@router.get("", response_model=list[EventOut])
def list_events(db: DbSession) -> list[EventOut]:
    return [_to_out(e) for e in svc.list_events(db)]


@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: uuid.UUID, db: DbSession) -> EventOut:
    event = svc.get_event(db, event_id)
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "event not found")
    return _to_out(event)


@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventCreate, db: DbSession, _: AdminUser) -> EventOut:
    return _to_out(svc.create_event(db, **payload.model_dump()))


@router.patch("/{event_id}", response_model=EventOut)
def update_event(
    event_id: uuid.UUID,
    payload: EventUpdate,
    db: DbSession,
    _: AdminUser,
) -> EventOut:
    event = svc.get_event(db, event_id)
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "event not found")
    return _to_out(svc.update_event(db, event, **payload.model_dump(exclude_unset=True)))


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: uuid.UUID, db: DbSession, _: AdminUser) -> None:
    event = svc.get_event(db, event_id)
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "event not found")
    svc.delete_event(db, event)
