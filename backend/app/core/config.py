from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://judging:judging@db:5432/judging"
    jwt_secret: str = "change-me"
    jwt_alg: str = "HS256"
    jwt_ttl_hours: int = 12
    cors_origins: str = "http://localhost:5173"


@lru_cache
def get_settings() -> Settings:
    return Settings()
