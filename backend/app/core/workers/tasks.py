import asyncio
from fastapi import WebSocket
from ..utils.helpers import ConnectionManager





async def run_trigger(connection_manager: ConnectionManager, trigger, device_id: str):
    while connection_manager.active_connections[device_id]:
        try:
            if connection_manager.active_connections[device_id]:
                data = {"code": trigger.code, "pin": trigger.pin}

                await connection_manager.broadcast(data, device_id)
                await asyncio.sleep(trigger.interval)

        except Exception as e:
            print(f"Error tutaj w trigger: {e}")
            await asyncio.sleep(2)
