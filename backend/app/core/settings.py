from pydantic import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    env_name: str = "Development"
    db_url: str = "mongodb://localhost:27017"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    env_name = os.getenv("ENV_NAME", "").lower()
    db_url = os.getenv("DB_URL", "")

    if env_name == "production":
        Settings.env_name = env_name.upper()
        Settings.Config.env_file = ".env.production"
        Settings.db_url = db_url

    settings = Settings()
    print(f"Loading settings for: {settings.env_name}")
    return settings
