from fastapi import APIRouter, HTTPException, Response, status

from app.api.deps import CurrentUser, DbSession
from app.core.config import get_settings
from app.core.security import create_access_token
from app.schemas.auth import LoginIn, RegisterIn, UserOut
from app.services.auth import AuthError, authenticate, register_user

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_NAME = "access_token"


def _set_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        COOKIE_NAME,
        token,
        max_age=settings.jwt_ttl_hours * 3600,
        httponly=True,
        samesite="lax",
        secure=False,
    )


def _user_out(user) -> UserOut:
    return UserOut(id=str(user.id), email=user.email, name=user.name, role=user.role)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterIn, response: Response, db: DbSession) -> UserOut:
    try:
        user = register_user(
            db,
            email=payload.email,
            password=payload.password,
            name=payload.name,
            role=payload.role,
        )
    except AuthError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc
    _set_cookie(response, create_access_token(str(user.id), user.role.value))
    return _user_out(user)


@router.post("/login", response_model=UserOut)
def login(payload: LoginIn, response: Response, db: DbSession) -> UserOut:
    try:
        user = authenticate(db, email=payload.email, password=payload.password)
    except AuthError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(exc)) from exc
    _set_cookie(response, create_access_token(str(user.id), user.role.value))
    return _user_out(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    response.delete_cookie(COOKIE_NAME)


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser) -> UserOut:
    return _user_out(user)
