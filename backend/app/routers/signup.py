from fastapi import APIRouter, HTTPException
from auth.auth_handler import get_password_hash
from core.schemas.response import ResponseModel
from core.models.database import get_user_by_username, get_user_by_email, insert_new_user
from core.schemas.users import UserCreate


router = APIRouter(
    prefix="/signup",
    tags=["signup"],
)


@router.post("/", response_model=ResponseModel)
async def create_new_user(user: UserCreate):
    if await get_user_by_email(user.email):
        raise HTTPException(
            status_code=409, detail=f"User with this email: {user.email} already exists!")
    if await get_user_by_username(user.username):
        raise HTTPException(
            status_code=409, detail=f"User with this username: {user.username} already exist!")

    hashed_password = get_password_hash(user.password)

    user_dict = user.dict()
    user_dict["password"] = hashed_password

    await insert_new_user(user_dict)
    return {"message": "Account has been successfully created!"}
