from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..db import get_db

router = APIRouter(prefix="/api/v1/energy", tags=["energy"])


def _hours_since(dt: datetime) -> float:
    now = datetime.now(timezone.utc)
    delta = now - dt.replace(tzinfo=timezone.utc)
    return delta.total_seconds() / 3600


def _clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


@router.get("", response_model=schemas.EnergyRead)
def get_energy(db: Session = Depends(get_db)):
    score = (
        db.query(models.Score)
        .join(models.Meal, models.Meal.id == models.Score.meal_id)
        .order_by(models.Score.computed_at.desc())
        .first()
    )
    if not score:
        return schemas.EnergyRead(energy_percent=50.0, crash_risk=False, last_meal_at=None)

    last_meal_time = score.computed_at
    hours = _hours_since(last_meal_time)
    decay = hours * 3.0
    energy_percent = _clamp(score.total_score - decay)
    crash_risk = energy_percent < 40 or score.stability < 40
    return schemas.EnergyRead(energy_percent=round(energy_percent, 1), crash_risk=crash_risk, last_meal_at=last_meal_time)
