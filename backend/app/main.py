from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import archive_data, users, token, signup, devices, elements, dashboard, websocket, virtual_pins, triggers
from .core.utils.helpers import Manager


app = FastAPI()
app.include_router(users.router)
app.include_router(token.router)
app.include_router(signup.router)
app.include_router(devices.router)
app.include_router(elements.router)
app.include_router(dashboard.router)
app.include_router(websocket.router)
app.include_router(virtual_pins.router)
app.include_router(triggers.router)
app.include_router(archive_data.router)


manager = Manager()

origins = [
    "http://localhost:5173",
    "http://localhost:8000",
    "http://192.168.0.102:3000",
    "http://192.168.0.103:8000",
    "http://192.168.0.103:5173",
    "http://192.168.0.101:5173",
    "http://192.168.0.101:8000",
    "http://192.168.0.106:5173",
    "http://192.168.0.106:8000",
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