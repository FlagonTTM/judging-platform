from collections.abc import Callable

from fastapi import HTTPException, status

from app.api.deps import CurrentUser
from app.models.user import User, UserRole


def require_role(*roles: UserRole) -> Callable[[User], User]:
    def _dep(user: CurrentUser) -> User:
        if user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "insufficient role")
        return user
    return _dep


require_admin = require_role(UserRole.admin)
require_judge = require_role(UserRole.judge, UserRole.admin)
