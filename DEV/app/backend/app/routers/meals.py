from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from .. import schemas
from ..db import get_db

router = APIRouter(prefix="/api/v1/meals", tags=["meals"])

@router.post("", response_model=schemas.MealMetricsResponse)
async def create_meal_from_image(
    image: UploadFile = File(...), 
    user_id: Optional[str] = Form(None),
    note: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    try:
        contents = await image.read()
        
        # MOCK VISION LLM RESPONSE:
        vision_item = {
            "name": "Analyzed Meal from Image",
            "quantity": 1.0, "unit": "serving",
            "calories": 450.0, "protein": 30.0,
            "carbs": 40.0, "fats": 15.0,
            "fiber": 8.0, "glycemic_load": 25.0
        }
        vision_score = {
            "stability": 80.0, "satiety": 85.0,
            "balance": 90.0, "total_score": 85.0
        }
        
        # 1. Insert into meals table
        meal_query = text("""
            INSERT INTO meals (user_id, source, note, logged_at)
            VALUES (:user_id, 'photo', :note, CURRENT_TIMESTAMP)
            RETURNING id;
        """)
        meal_result = db.execute(meal_query, {"user_id": user_id, "note": note}).fetchone()
        meal_id = meal_result[0]
        
        # 2. Insert into meal_items
        item_query = text("""
            INSERT INTO meal_items (meal_id, name, quantity, unit, calories, protein, carbs, fats, fiber, glycemic_load)
            VALUES (:meal_id, :name, :quantity, :unit, :calories, :protein, :carbs, :fats, :fiber, :glycemic_load)
        """)
        vision_item["meal_id"] = meal_id
        db.execute(item_query, vision_item)
        
        # 3. Insert into scores
        score_query = text("""
            INSERT INTO scores (meal_id, stability, satiety, balance, total_score, computed_at)
            VALUES (:meal_id, :stability, :satiety, :balance, :total_score, CURRENT_TIMESTAMP)
        """)
        vision_score["meal_id"] = meal_id
        db.execute(score_query, vision_score)
        
        db.commit()
        
        return schemas.MealMetricsResponse(
            status="success",
            meal_id=meal_id,
            metrics=vision_item,
            score=vision_score
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recent", response_model=schemas.MealListResponse)
def get_recent_meals(db: Session = Depends(get_db)):
    query = text("""
        SELECT m.id, m.user_id, m.source, m.logged_at, s.total_score
        FROM meals m
        LEFT JOIN scores s ON m.id = s.meal_id
        ORDER BY m.logged_at DESC 
        LIMIT 3
    """)
    results = db.execute(query).fetchall()
    return schemas.MealListResponse(meals=[dict(row._mapping) for row in results])


@router.get("/all", response_model=schemas.MealListResponse)
def get_all_meals(db: Session = Depends(get_db)):
    query = text("""
        SELECT m.id, m.user_id, m.source, m.logged_at, s.total_score
        FROM meals m
        LEFT JOIN scores s ON m.id = s.meal_id
        ORDER BY m.logged_at DESC
    """)
    results = db.execute(query).fetchall()
    return schemas.MealListResponse(meals=[dict(row._mapping) for row in results])