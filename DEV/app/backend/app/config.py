import os
from functools import lru_cache
from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    app_name: str = "LettyQuest API"
    api_prefix: str = "/api/v1"
    database_url: str = Field("sqlite:///./data/app.db", env="DATABASE_URL")
    environment: str = Field("local", env="APP_ENV")
    llm_model: str = Field("llama3", env="LLM_MODEL")

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "..", ".env")
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
