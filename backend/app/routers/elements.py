from fastapi import APIRouter, Depends, HTTPException
from auth.auth_handler import get_current_user
from core.schemas.elements import Element, ElementCreate
from core.models.database import insert_new_element, fetch_device_by_id
from bson import ObjectId
from bson.errors import InvalidId


router = APIRouter(
    prefix="/elements",
    tags=["elements"],
    dependencies=[Depends(get_current_user)]
)


@router.post('/create')
async def create_user_element(element: ElementCreate, current_user: Element = Depends(get_current_user)):
    device_exists = await fetch_device_by_id(element.device_id, user_id=current_user["_id"])
    if not device_exists:
        raise HTTPException(404, detail="Device not found")
    element.user_id = current_user["_id"]
    element.device_id = ObjectId(element.device_id)
    response = await insert_new_element(element.dict())
    if response:
        return {"message": "Element has been created!"}
    else:
        return {"message": "Failed to create the element!"}
