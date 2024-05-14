from fastapi import APIRouter, Depends, Query, HTTPException, status
from ..auth import auth_handler
from ..core.models import crud
from ..core.utils.validators import Validator
from ..core.schemas.archive_data import RelativeTime

router = APIRouter(
    prefix="/archive-data",
    tags=["Archive Data"],
    dependencies=[Depends(auth_handler.get_current_user)]
)


@router.get("/{id_}")
async def get_data(*,
                   id_: str = Depends(Validator.is_valid_object_id),
                   pin: str = Query(..., alias="pin"),
                   time_ago: str = Query(..., alias="time_ago")
                   ):
    data = RelativeTime(pin=pin, time_ago=time_ago)
    timestamp = data.to_unix_timestamp()

    response = await crud.DataArchive.get_data(id_, data.pin, timestamp)
    if not response:
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT, detail='No historical data for this range and/or pin')
    return response
