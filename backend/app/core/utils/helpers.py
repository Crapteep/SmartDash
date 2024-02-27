from bson import ObjectId
from fastapi import HTTPException
from ..models import crud
from .error_messages import ErrorMessages


def convert_fields_to_objectid(doc):
    if isinstance(doc, dict):
        for key, value in doc.items():
            if isinstance(value, dict) and '$oid' in value:
                doc[key] = ObjectId(value['$oid'])
            elif isinstance(value, dict) or isinstance(value, list):
                doc[key] = convert_fields_to_objectid(value)
            elif key.endswith('_id') and isinstance(value, str):
                try:
                    doc[key] = ObjectId(value)
                except Exception as e:
                    pass
    elif isinstance(doc, list):
        for i, item in enumerate(doc):
            doc[i] = convert_fields_to_objectid(item)
    return doc


async def check_exists(user_id, item_id, item_type):
    item_types = {
        "device": crud.Device.get_device,
        "element": crud.Element.get_element,
    }

    if item_type not in item_types:
        raise HTTPException(500, detail=ErrorMessages.UnsupportedType)

    get_item = item_types[item_type]

    item_exists = await get_item(user_id, item_id)
    if not item_exists:
        raise HTTPException(404, detail=f"{item_type.capitalize()} not found")

    return item_exists


def extract_device_id(client_id: str) -> str:
    parts = client_id.split('_')
    if len(parts) >= 2:
        return parts[0]
    return None