from typing import Annotated

from fastapi import Depends, HTTPException, status

from app.api.deps import get_current_user
from app.models.user import User, UserRole


def require_team_role(user: Annotated[User, Depends(get_current_user)]) -> User:
    if user.role not in (UserRole.team, UserRole.admin):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "team role required")
    return user


TeamUser = Annotated[User, Depends(require_team_role)]
