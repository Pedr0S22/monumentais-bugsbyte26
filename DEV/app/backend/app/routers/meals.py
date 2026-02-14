from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from .. import schemas
from ..db import get_db

router = APIRouter(prefix="/api/v1/meals", tags=["meals"])

import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
# Importa a tua função do ficheiro llm.py
from ..llm import letty_nutrition_evaluator 

router = APIRouter(prefix="/api/v1/meals", tags=["meals"])

@router.post("")
async def create_meal(
    profile_id: int = Form(...),
    image: Optional[UploadFile] = File(None), # Foto agora é Opcional
    user_text: Optional[str] = Form(None),    # Texto agora é Opcional
    db: Session = Depends(get_db)
):
    temp_path = None
    try:
        # 1. Se houver imagem, guardamos temporariamente para a IA ler
        if image:
            temp_path = f"temp_{image.filename}"
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)

        # 2. Ir buscar o perfil do utilizador à BD para passar à Letty
        # (Aqui assumo que tens uma query para pegar nos dados do profile_id)
        user_profile = db.execute(
            text("SELECT goal, diet as diet_type, progress_status FROM profile WHERE id = :id"),
            {"id": profile_id}
        ).fetchone()

        if not user_profile:
            raise HTTPException(status_code=404, detail="Perfil não encontrado")

        # 3. CHAMAR A TUA IA (aquela função que criámos)
        letty_analysis = letty_nutrition_evaluator(
            user_profile=dict(user_profile._mapping),
            image_path=temp_path,
            user_text=user_text
        )

        # 4. Verificar se a IA devolveu erro (ex: não é comida)
        if "error" in letty_analysis:
            status = letty_analysis.get("status_code", 400)
            raise HTTPException(status_code=status, detail=letty_analysis["error"])

        # 5. GUARDAR NA BASE DE DADOS (SQLite)
        query = text("""
            INSERT INTO letty_historic (
                profile_id, meal, protein, fiber, hydration, 
                saturated_fat, energy, energy_boost, burn_rate_per_hour, mood, tip, focus_time
            )
            VALUES (
                :profile_id, :meal, :protein, :fiber, :hydration, 
                :saturated_fat, :energy, :energy_boost, :burn_rate_per_hour, :mood, :tip, :focus_time
            )
            RETURNING id_letty;
        """)
        
        # Mapear os dados da IA para as colunas da tua tabela
        db_values = {
            "profile_id": profile_id,
            "meal": letty_analysis["meal_name"],
            "protein": letty_analysis["nutritional_metrics"]["protein_grams"],
            "fiber": letty_analysis["nutritional_metrics"]["fiber_grams"],
            "hydration": letty_analysis["nutritional_metrics"]["hydration_ml"],
            "saturated_fat": letty_analysis["nutritional_metrics"]["saturated_fat_grams"],
            "energy": letty_analysis["nutritional_metrics"]["energy_kcal"],
            "energy_boost": letty_analysis["game_logic"]["energy_boost"],
            "burn_rate_per_hour": letty_analysis["game_logic"]["burn_rate_per_hour"],
            "mood": letty_analysis["letty_feedback"]["mood"],
            "tip": letty_analysis["letty_feedback"]["tip"],
            "focus_time": letty_analysis["game_logic"]["estimated_focus_time_hours"]
        }

        result = db.execute(query, db_values)
        id_letty = result.fetchone()[0]
        db.commit()

        return {"status": "success", "id_letty": id_letty, "analysis": letty_analysis}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Limpar o ficheiro temporário depois de usar
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

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

@router.get("{profile_id}/recent", response_model=schemas.LettyHistoricListResponse)
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

@router.get("/{profile_id}/all", response_model=schemas.LettyHistoricListResponse)
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