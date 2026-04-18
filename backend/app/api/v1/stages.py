import uuid

from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession
from app.api.v1.events import AdminUser
from app.models.stage import Stage
from app.schemas.stage import StageCreate, StageOut, StageUpdate
from app.services import stages as svc

router = APIRouter(tags=["stages"])


def _to_out(s: Stage) -> StageOut:
    return StageOut(
        id=str(s.id), event_id=str(s.event_id), name=s.name, order=s.order
    )


@router.post(
    "/events/{event_id}/stages",
    response_model=StageOut,
    status_code=status.HTTP_201_CREATED,
)
def create_stage(
    event_id: uuid.UUID, payload: StageCreate, db: DbSession, _: AdminUser
) -> StageOut:
    return _to_out(svc.create(db, event_id, payload.name, payload.order))


@router.get("/events/{event_id}/stages", response_model=list[StageOut])
def list_stages(event_id: uuid.UUID, db: DbSession) -> list[StageOut]:
    return [_to_out(s) for s in svc.list_for_event(db, event_id)]


@router.patch("/stages/{stage_id}", response_model=StageOut)
def update_stage(
    stage_id: uuid.UUID, payload: StageUpdate, db: DbSession, _: AdminUser
) -> StageOut:
    stage = svc.get(db, stage_id)
    if stage is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "stage not found")
    return _to_out(svc.update(db, stage, **payload.model_dump(exclude_none=True)))


@router.delete("/stages/{stage_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stage(stage_id: uuid.UUID, db: DbSession, _: AdminUser) -> None:
    stage = svc.get(db, stage_id)
    if stage is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "stage not found")
    svc.delete(db, stage)
