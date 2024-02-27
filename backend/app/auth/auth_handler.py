
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
from ..core.models import crud
from datetime import datetime, timedelta
from jose import JWTError, jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from ..core.schemas.token import TokenData
import os


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

load_dotenv()

SECRET_KEY_USER = os.getenv("SECRET_KEY_USER")
SECRET_KEY_DEVICE = os.getenv("SECRET_KEY_DEVICE")
ALGORITHM = os.getenv("ALGORITHM")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


async def authenticate_user(username, password):
    user = await crud.User.get_by_username(username)
    if not user:
        return False
    if not verify_password(password, user["password"]):
        return False
    return user


def generate_user_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, key=SECRET_KEY_USER, algorithm=ALGORITHM)
    return encoded_jwt


def generate_device_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=365)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, key=SECRET_KEY_DEVICE, algorithm=ALGORITHM)
    return encoded_jwt


async def verify_token(token: str, secret_key: str, data_key: str | None = None):
    credential_exception = HTTPException(status_code=401, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    
    try:
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
        data = payload.get(data_key)
        if data is None:
            raise credential_exception
    except JWTError:
        raise credential_exception
    
    return data


async def get_current_user(token: str = Depends(oauth2_scheme)):
    username = await verify_token(token, SECRET_KEY_USER, "sub")
    user = await crud.User.get_by_username(username=username)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_current_device(token: str):
    device_id = await verify_token(token, SECRET_KEY_DEVICE, "device_id")
    
    device = await crud.Device.device_exists(device_id)
    if not device:
        raise HTTPException(status_code=401, detail="Device not found")
    return device


