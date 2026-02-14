from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..db import get_db

router = APIRouter(prefix="/api/v1/meals", tags=["meals"])

@router.post("")
async def create_meal_from_image(image: UploadFile = File(...), db: Session = Depends(get_db)):
    # 1. Read image bytes and pass to your Colleague's Vision LLM
    contents = await image.read()
    # vision_metrics = vision_engine.analyze(contents)
    
    # Mocking the Vision LLM response:
    vision_metrics = {
        "calories": 450.0,
        "protein": 30.0,
        "carbs": 40.0,
        "fats": 15.0,
        "total_score": 85.0
    }
    
    # 2. Insert into DB using Raw SQL
    query = text("""
        INSERT INTO meals (calories, protein, carbs, fats, total_score, logged_at)
        VALUES (:calories, :protein, :carbs, :fats, :total_score, CURRENT_TIMESTAMP)
    """)
    db.execute(query, vision_metrics)
    db.commit()
    
    return {"status": "success", "metrics": vision_metrics}

@router.get("/recent")
def get_recent_meals(db: Session = Depends(get_db)):
    # Get last 3 meals
    query = text("SELECT * FROM meals ORDER BY logged_at DESC LIMIT 3")
    results = db.execute(query).fetchall()
    
    # Convert Raw SQL rows to dictionaries
    return {"meals": [dict(row._mapping) for row in results]}

@router.get("/all")
def get_all_meals(db: Session = Depends(get_db)):
    # Get all meals
    query = text("SELECT * FROM meals ORDER BY logged_at DESC")
    results = db.execute(query).fetchall()
    
    return {"meals": [dict(row._mapping) for row in results]}