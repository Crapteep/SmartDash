from fastapi import APIRouter, HTTPException
from ..auth import auth_handler
from ..core.schemas import response, users
from ..core.models import crud


router = APIRouter(
    prefix="/signup",
    tags=["signup"],
)


@router.post("/",
             response_model=response.ResponseModel,
             name="Create new user")
async def create_new_user(user: users.UserCreate):
    if await crud.User.get_by_email(user.email):
        raise HTTPException(
            status_code=409, detail=f"User with this email: {user.email} already exists!")
    if await crud.User.get_by_username(user.username):
        raise HTTPException(
            status_code=409, detail=f"User with this username: {user.username} already exist!")

    hashed_password = auth_handler.get_password_hash(user.password)

    user_dict = user.dict()
    user_dict["password"] = hashed_password

    response = await crud.User.create(user_dict)
    if response:
        return {"message": "Account has been successfully created!"}
    raise HTTPException(500, detail="Failed to create new account.")
