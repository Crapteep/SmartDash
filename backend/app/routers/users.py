from fastapi import APIRouter, Depends
from ..core.schemas import users
from ..auth import auth_handler
from ..core.settings import settings


ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

router = APIRouter(
    prefix='/users',
    tags=['users'],
    dependencies=[Depends(auth_handler.get_current_user)]
)


@router.get("/me", response_model=users.User)
async def read_users_me(current_user: users.User = Depends(auth_handler.get_current_user)):
    return current_user




