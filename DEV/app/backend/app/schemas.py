from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class MealItemBase(BaseModel):
    name: str
    quantity: float = 0.0
    unit: str = "g"
    calories: float = 0.0
    protein: float = 0.0
    carbs: float = 0.0
    fats: float = 0.0
    fiber: float = 0.0
    glycemic_load: float = 0.0


class MealItemCreate(MealItemBase):
    pass


class MealItemRead(MealItemBase):
    id: int

    class Config:
        orm_mode = True


class MealCreate(BaseModel):
    user_id: Optional[str] = None
    source: str = Field("text", description="text or photo")
    note: Optional[str] = None
    items: List[MealItemCreate] = []


class MealRead(BaseModel):
    id: int
    user_id: Optional[str]
    source: str
    note: Optional[str]
    logged_at: datetime
    items: List[MealItemRead]

    class Config:
        orm_mode = True


class ScoreRequest(BaseModel):
    carbs: float
    protein: float
    fiber: float
    fats: float
    sat_fat: float = 0.0
    gi: float = Field(50, description="Average glycemic index (0-100)")
    hydration: float = Field(0.0, description="Hydration percentage contribution")


class ScoreRead(BaseModel):
    stability: float
    satiety: float
    balance: float
    total_score: float
    computed_at: datetime

    class Config:
        orm_mode = True


class MealWithScore(MealRead):
    score: Optional[ScoreRead] = None


class EnergyRead(BaseModel):
    energy_percent: float
    crash_risk: bool
    last_meal_at: Optional[datetime] = None


class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    source: str = "stub"


class HealthRead(BaseModel):
    status: str = "ok"
    timestamp: datetime
