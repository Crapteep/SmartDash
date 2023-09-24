from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, token, signup, devices, elements, dashboard

from .core import settings

# settings = Settings.get()


app = FastAPI()
app.include_router(users.router)
app.include_router(token.router)
app.include_router(signup.router)
app.include_router(devices.router)
app.include_router(elements.router)
app.include_router(dashboard.router)

origins = [
    'http://localhost:3000',
    'http://localhost:8000'
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
