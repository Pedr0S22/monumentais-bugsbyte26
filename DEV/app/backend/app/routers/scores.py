from datetime import datetime
from fastapi import APIRouter
from .. import schemas, scoring

router = APIRouter(prefix="/api/v1/scores", tags=["scores"])


@router.post("", response_model=schemas.ScoreRead)
def compute_score(payload: schemas.ScoreRequest):
    result = scoring.compute_score(
        carbs=payload.carbs,
        protein=payload.protein,
        fiber=payload.fiber,
        fats=payload.fats,
        sat_fat=payload.sat_fat,
        gi=payload.gi,
        hydration=payload.hydration,
    )
    return schemas.ScoreRead(
        stability=result.stability,
        satiety=result.satiety,
        balance=result.balance,
        total_score=result.total_score,
        computed_at=datetime.utcnow(),
    )
