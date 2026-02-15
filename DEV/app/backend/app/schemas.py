from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

# --- Health ---
class HealthRead(BaseModel):
    status: int
    timestamp: datetime

# --- Chat (RAG) ---
class ChatRequest(BaseModel):
    message: str
    profile_id: Optional[int] = None # Match your new DB logic

class ChatResponse(BaseModel):
    status_code: int
    message: str
    source: str = "stub"
    timestamp: datetime

# --- Battery (formerly Energy) ---
class BatteryUpdate(BaseModel):
    profile_id: int
    battery_level: int
    focus_time: float
    burn_rate_per_hour: float

class BatteryRead(BaseModel):
    code_status: int
    battery_level: int
    crash_risk: bool
    logged_at: Optional[datetime] = None
    focus_time: float
    burn_rate_per_hour: float
    timestamp: datetime

class BatteryHistoryItem(BaseModel):
    battery_level: int
    logged_at: datetime
    focus_time: float
    burn_rate_per_hour: float

class BatteryHistoryResponse(BaseModel):
    status_code: int
    history: List[BatteryHistoryItem]
    timestamp: datetime

# --- Letty Historic (formerly Meals) ---
class LettyHistoricResponse(BaseModel):
    status: str
    id_letty: int
    metrics: Dict[str, Any]

class LettyHistoricSummary(BaseModel):
    id_letty: int
    profile_id: int
    meal: str
    logged_at: datetime
    protein: float
    fiber: float
    hydration: float
    saturated_fat: float
    energy: int
    energy_boost: int
    burn_rate_per_hour: float
    mood: str
    tip: str
    focus_time: float

class ProfileRead(BaseModel):
    status_code: int
    profile: dict
    timestamp: datetime

class LettyHistoricListResponse(BaseModel):
    meals: List[LettyHistoricSummary]