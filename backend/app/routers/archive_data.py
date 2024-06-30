from fastapi import APIRouter, Depends, Query, HTTPException, status, Path
from ..auth import auth_handler
from ..core.models import crud
from ..core.utils.validators import Validator
from ..core.schemas.archive_data import RelativeTime
from typing import Annotated


router = APIRouter(
    prefix="/archive-data",
    tags=["Archive Data"],
    dependencies=[Depends(auth_handler.get_current_user)]
)





@router.get("/{id_}/{pin}",
            name="Get historical data for a given virtual pin of a given device",
            description="Retrieves historical data for a specified device based on the provided parameters.")
async def get_data(*,
                   id_: Annotated[str, Depends(Validator.validate_device_id)],
                   pin: str = Path(..., alias="pin", description="Virtual pin number for which data is requested."),
                   time_ago: str = Query(..., alias="time_ago", description="Time range relative to current time (e.g., '1h', '3d').")
                   ):
    
    data = RelativeTime(pin=pin, time_ago=time_ago)
    timestamp = data.to_unix_timestamp()

    response = await crud.DataArchive.get_data(id_, data.pin, timestamp)
    if not response:
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT, detail='No historical data for this range and/or pin')
    return response


@router.delete("/{id_}/{pin}",
               name="Delete historical data for a given virtual pin of a given device",
               description="Deletes all historical data associated with a specific virtual pin of a specified device.")
async def delete_historical_data_for_specific_pin():
    pass


@router.delete("/{id_}",
               name="Delete historical data for all virtual pins of a given device",
               description="Deletes all historical data associated with all virtual pins of a specified device.")
async def delete_device_historical_data():
    pass
