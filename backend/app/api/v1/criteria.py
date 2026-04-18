import uuid

from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession
from app.api.v1.events import AdminUser
from app.models.criterion import Criterion
from app.schemas.criterion import CriterionCreate, CriterionOut, CriterionUpdate
from app.services import criteria as svc

router = APIRouter(tags=["criteria"])


def _to_out(c: Criterion) -> CriterionOut:
    return CriterionOut(
        id=str(c.id),
        event_id=str(c.event_id),
        name=c.name,
        description=c.description,
        weight=c.weight,
        max_score=c.max_score,
    )


@router.get("/events/{event_id}/criteria", response_model=list[CriterionOut])
def list_criteria(event_id: uuid.UUID, db: DbSession) -> list[CriterionOut]:
    return [_to_out(c) for c in svc.list_for_event(db, event_id)]


@router.post(
    "/events/{event_id}/criteria",
    response_model=CriterionOut,
    status_code=status.HTTP_201_CREATED,
)
def create_criterion(
    event_id: uuid.UUID,
    payload: CriterionCreate,
    db: DbSession,
    _: AdminUser,
) -> CriterionOut:
    try:
        crit = svc.create(db, event_id, **payload.model_dump())
    except svc.WeightSumError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc
    return _to_out(crit)


@router.patch("/criteria/{criterion_id}", response_model=CriterionOut)
def update_criterion(
    criterion_id: uuid.UUID,
    payload: CriterionUpdate,
    db: DbSession,
    _: AdminUser,
) -> CriterionOut:
    crit = svc.get(db, criterion_id)
    if crit is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "criterion not found")
    try:
        crit = svc.update(db, crit, **payload.model_dump(exclude_unset=True))
    except svc.WeightSumError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc
    return _to_out(crit)


@router.delete("/criteria/{criterion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_criterion(criterion_id: uuid.UUID, db: DbSession, _: AdminUser) -> None:
    crit = svc.get(db, criterion_id)
    if crit is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "criterion not found")
    svc.delete(db, crit)
