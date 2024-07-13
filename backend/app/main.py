from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import archive_data, users, token, signup, devices, elements, dashboard, websocket, virtual_pins, triggers
from .core.utils.helpers import Manager
from .core.settings import Settings

settings = Settings.get()


app = FastAPI()
app.include_router(users.router, prefix="/api/v1")
app.include_router(token.router)
app.include_router(signup.router, prefix="/api/v1")
app.include_router(devices.router, prefix="/api/v1")
app.include_router(elements.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(websocket.router, prefix="/api/v1")
app.include_router(virtual_pins.router, prefix="/api/v1")
app.include_router(triggers.router, prefix="/api/v1")
app.include_router(archive_data.router, prefix="/api/v1")


manager = Manager()

origins = [
    settings.client_url,
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"Hello": "World"}