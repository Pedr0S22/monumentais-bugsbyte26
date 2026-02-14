from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Health ---
class HealthRead(BaseModel):
    status: str = "ok"
    timestamp: datetime

# --- Chat (RAG) ---
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    source: str = "stub"

# --- Energy ---
class EnergyHistoryItem(BaseModel):
    energy_percent: float
    updated_at: datetime

class EnergyHistoryResponse(BaseModel):
    history: List[EnergyHistoryItem]
    last_meal_at: Optional[datetime] = None

# --- Meals ---
# Response for the Vision POST endpoint
class MealMetricsResponse(BaseModel):
    status: str
    meal_id: int
    metrics: Dict[str, Any]
    score: Dict[str, Any]

# Represents a flattened meal + score row from our raw SQL JOIN
class MealSummary(BaseModel):
    id: int
    user_id: Optional[str] = None
    source: str
    logged_at: datetime
    total_score: Optional[float] = None

class MealListResponse(BaseModel):
    meals: List[MealSummary]