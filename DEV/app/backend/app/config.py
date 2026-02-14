import os
from functools import lru_cache
from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    app_name: str = "LettyQuest API"
    api_prefix: str = "/api/v1"
    database_url: str = Field("sqlite:///./data/app.db", env="DATABASE_URL")
    environment: str = Field("local", env="APP_ENV")
    llm_model: str = Field("llama3", env="LLM_MODEL")
    # Weights that determine how much each component contributes to the final energy score.
    stability_weight: float = Field(0.6, env="STABILITY_WEIGHT")
    satiety_weight: float = Field(0.3, env="SATIETY_WEIGHT")
    balance_weight: float = Field(0.1, env="BALANCE_WEIGHT")

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "..", ".env")
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
