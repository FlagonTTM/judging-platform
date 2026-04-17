from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_501_NOT_IMPLEMENTED)
def register() -> dict[str, str]:
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/login", status_code=status.HTTP_501_NOT_IMPLEMENTED)
def login() -> dict[str, str]:
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/logout", status_code=status.HTTP_501_NOT_IMPLEMENTED)
def logout() -> dict[str, str]:
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/me", status_code=status.HTTP_501_NOT_IMPLEMENTED)
def me() -> dict[str, str]:
    raise HTTPException(status_code=501, detail="Not implemented yet")
