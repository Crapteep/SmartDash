from fastapi import APIRouter, HTTPException, Depends
from ..core.schemas import token
from fastapi.security import OAuth2PasswordRequestForm
from ..auth import auth_handler
from datetime import timedelta
from ..core.settings import settings

ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes


router = APIRouter(
    prefix='/token',
    tags=['token'],
)


@router.post("/", response_model=token.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await auth_handler.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password", headers={
                            "WWW-Authenticate": "Bearer"})

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user["username"],
        "type": "user"
    }
    access_token = auth_handler.generate_user_token(
        data=payload, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}
