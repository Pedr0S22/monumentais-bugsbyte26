from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from .. import schemas
from ..db import get_db

router = APIRouter(prefix="/api/v1/meals", tags=["meals"])

@router.post("", response_model=schemas.LettyHistoricResponse)
async def create_meal_from_image(
    profile_id: int = Form(...), # NEW: Mandatory profile_id
    image: UploadFile = File(...), 
    meal_name: str = Form("Analyzed Meal"),
    db: Session = Depends(get_db)
):
    try:
        contents = await image.read()
        
        # MOCK VISION LLM RESPONSE mapped to letty_historic:
        vision_item = {
            "profile_id": profile_id,
            "meal": meal_name,
            "protein": 30.5,
            "fiber": 8.0,
            "hydration": 500.0,
            "saturated_fat": 4.5,
            "energy": 450,
            "energy_boost": 25,
            "burn_rate_per_hour": 60.0,
            "mood": "Energized",
            "tip": "Great balance of protein and fiber!",
            "focus_time": 2.5
        }
        
        query = text("""
            INSERT INTO letty_historic (
                profile_id, meal, logged_at, protein, fiber, hydration, 
                saturated_fat, energy, energy_boost, burn_rate_per_hour, mood, tip, focus_time
            )
            VALUES (
                :profile_id, :meal, CURRENT_TIMESTAMP, :protein, :fiber, :hydration, 
                :saturated_fat, :energy, :energy_boost, :burn_rate_per_hour, :mood, :tip, :focus_time
            )
            RETURNING id_letty;
        """)
        
        result = db.execute(query, vision_item).fetchone()
        id_letty = result[0]
        db.commit()
        
        return schemas.LettyHistoricResponse(
            status="success",
            id_letty=id_letty,
            metrics=vision_item
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recent/{profile_id}", response_model=schemas.LettyHistoricListResponse)
def get_recent_meals(profile_id: int, db: Session = Depends(get_db)):
    query = text("""
        SELECT id_letty, profile_id, meal, logged_at, protein, fiber, hydration, 
               saturated_fat, energy, energy_boost, burn_rate_per_hour, mood, tip, focus_time
        FROM letty_historic
        WHERE profile_id = :profile_id
        ORDER BY logged_at DESC 
        LIMIT 3
    """)
    results = db.execute(query, {"profile_id": profile_id}).fetchall()
    return schemas.LettyHistoricListResponse(meals=[dict(row._mapping) for row in results])

@router.get("/all/{profile_id}", response_model=schemas.LettyHistoricListResponse)
def get_all_meals(profile_id: int, db: Session = Depends(get_db)):
    query = text("""
        SELECT id_letty, profile_id, meal, logged_at, protein, fiber, hydration, 
               saturated_fat, energy, energy_boost, burn_rate_per_hour, mood, tip, focus_time
        FROM letty_historic
        WHERE profile_id = :profile_id
        ORDER BY logged_at DESC
    """)
    results = db.execute(query, {"profile_id": profile_id}).fetchall()
    return schemas.LettyHistoricListResponse(meals=[dict(row._mapping) for row in results])