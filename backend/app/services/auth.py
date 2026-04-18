from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User, UserRole


class AuthError(Exception):
    pass


def register_user(db: Session, *, email: str, password: str, name: str, role: UserRole) -> User:
    exists = db.scalar(select(User).where(User.email == email))
    if exists is not None:
        raise AuthError("email already registered")
    user = User(email=email, password_hash=hash_password(password), name=name, role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, *, email: str, password: str) -> User:
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(password, user.password_hash):
        raise AuthError("invalid credentials")
    return user
