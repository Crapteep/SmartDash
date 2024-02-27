
from pydantic import BaseSettings
from functools import lru_cache
import os
from dotenv import load_dotenv

load_dotenv(r'backend\app\.env')

class Settings(BaseSettings):
    env_name: str = "Development"
    db_url: str = "mongodb://localhost:27017"
    access_token_expire_minutes: int = 30
    secret_key_user: str | None = None
    secret_key_device: str | None = None
    algorithm: str | None = None

    class Config:
        env_file = ".env"

    @classmethod
    @lru_cache()
    def get(cls) -> "Settings":
        env_name = os.environ.get("ENV_NAME", "").lower()
        if env_name == "production":
            cls.Config.env_file = ".env.production"
        return cls()

