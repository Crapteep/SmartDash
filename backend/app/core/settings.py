from pydantic import BaseSettings, Field
from functools import lru_cache
from pathlib import Path

class Settings(BaseSettings):
    environment: str = Field(default="Development", env="ENVIRONMENT")
    db_url: str = Field(default="mongodb://localhost:27017", env="DB_URL")
    access_token_expire_minutes: int = Field(default=24 * 7 * 60, env="ACCESS_TOKEN_EXPIRE_MINUTES")  # 7 days
    secret_key_user: str = Field(..., env="SECRET_KEY_USER")
    secret_key_device: str = Field(..., env="SECRET_KEY_DEVICE")
    algorithm: str | None = Field(default='HS256', env="ALGORITHM")
    client_url: str | None = Field(default='http://localhost:5173/', env="CLIENT_URL")
    backend_cors_origins: str | None = Field(default=None, env="BACKEND_CORS_ORIGINS")
    project_name: str | None = Field(default='SmartDash', env="PROJECT_NAME")

    @property
    def backend_cors_origins_list(self) -> list[str]:
        if self.backend_cors_origins:
            return [origin.strip() for origin in self.backend_cors_origins.split(",")]
        return []
    
    class Config:
        env_file = str(Path(__file__).resolve().parent.parent / '.env')
        env_file_encoding = 'utf-8'

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
