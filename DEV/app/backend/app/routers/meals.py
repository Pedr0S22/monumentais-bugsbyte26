from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas, scoring
from ..db import get_db

router = APIRouter(prefix="/api/v1/meals", tags=["meals"])


def _aggregate_macros(items: List[schemas.MealItemCreate]):
    carbs = sum(i.carbs for i in items)
    protein = sum(i.protein for i in items)
    fiber = sum(i.fiber for i in items)
    fats = sum(i.fats for i in items)
    sat_fat = 0.0  # not collected per-item in schema; placeholder
    gi = 50.0 if not items else sum(i.glycemic_load for i in items) / max(len(items), 1)
    return carbs, protein, fiber, fats, sat_fat, gi


@router.post("", response_model=schemas.MealWithScore)
def create_meal(payload: schemas.MealCreate, db: Session = Depends(get_db)):
    meal = models.Meal(user_id=payload.user_id, source=payload.source, note=payload.note)
    db.add(meal)
    db.flush()

    for item in payload.items:
        db.add(models.MealItem(
            meal_id=meal.id,
            name=item.name,
            quantity=item.quantity,
            unit=item.unit,
            calories=item.calories,
            protein=item.protein,
            carbs=item.carbs,
            fats=item.fats,
            fiber=item.fiber,
            glycemic_load=item.glycemic_load,
        ))

    carbs, protein, fiber, fats, sat_fat, gi = _aggregate_macros(payload.items)
    score_components = scoring.compute_score(carbs=carbs, protein=protein, fiber=fiber, fats=fats, sat_fat=sat_fat, gi=gi)
    score = models.Score(
        meal_id=meal.id,
        stability=score_components.stability,
        satiety=score_components.satiety,
        balance=score_components.balance,
        total_score=score_components.total_score,
    )
    db.add(score)
    db.commit()
    db.refresh(meal)
    db.refresh(score)
    return schemas.MealWithScore.from_orm(meal)


@router.get("", response_model=List[schemas.MealWithScore])
def list_meals(limit: int = 20, db: Session = Depends(get_db)):
    meals = db.query(models.Meal).order_by(models.Meal.logged_at.desc()).limit(limit).all()
    return meals
