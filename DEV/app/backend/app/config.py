import os
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    app_name: str = "LettyQuest API"
    api_prefix: str = "/api/v1"
    database_url: str = Field("sqlite:///./data/app.sqlite3", env="DATABASE_URL")
    environment: str = Field("local", env="APP_ENV")
    llm_model: str = Field("llama3", env="LLM_MODEL")

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), "..", ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()