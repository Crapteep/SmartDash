from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, token, signup, devices, elements, dashboard, websocket

from .core import settings

# settings = Settings.get()


app = FastAPI()
app.include_router(users.router)
app.include_router(token.router)
app.include_router(signup.router)
app.include_router(devices.router)
app.include_router(elements.router)
app.include_router(dashboard.router)
app.include_router(websocket.router)

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

@app.get('/')
async def root():
    return {'message': 'Hello!'}
