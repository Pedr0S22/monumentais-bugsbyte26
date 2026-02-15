from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from .. import schemas
from ..db import get_db
from datetime import datetime, timezone


import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..llm import letty_nutrition_evaluator
from ..scoring import calculate_nuno_score

router = APIRouter(prefix="/api/v1/meals", tags=["meals"])
@router.post("")
async def create_meal(
    profile_id: int = Form(...),
    image: Optional[UploadFile] = File(None),
    user_text: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    temp_path = None
    try:
        # Gestão de Imagem Temporária
        if image:
            temp_path = f"temp_{image.filename}"
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)

        # Obter Perfil do Utilizador
        user_row = db.execute(
            text("SELECT * FROM profile WHERE id = :id"),
            {"id": profile_id}
        ).fetchone()

        if not user_row:
            raise HTTPException(status_code=404, detail="Profile not found")

        user_profile = dict(user_row._mapping)

        user_profile["diet_type"] = user_profile["diet"]

        letty_analysis = letty_nutrition_evaluator(
            user_profile=user_profile,
            image_path=temp_path,
            user_text=user_text
        )


        # Análise da IA Letty
        letty_analysis = letty_nutrition_evaluator(
            user_profile=user_profile,
            image_path=temp_path,
            user_text=user_text
        )

        if "error" in letty_analysis:
            raise HTTPException(status_code=400, detail=letty_analysis["error"])

        # Motor de Jogo: Calcular XP e Satiety
        game_results = calculate_nuno_score(
            metrics=letty_analysis["nutritional_metrics"], 
            user_goal=user_profile["goal"]
        )
        
        xp_earned = game_results["xp_earned"]

        # LÓGICA DE BATERIA (DRENAGEM E RECARGA)

        # Recuperar estado anterior da bateria
        last_battery = db.execute(
            text("""
                SELECT battery_level, burn_rate_per_hour, logged_at
                FROM battery
                WHERE profile_id = :pid
                ORDER BY logged_at DESC LIMIT 1
            """),
            {"pid": profile_id}
        ).fetchone()

        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

        if not last_battery:
            # Primeiro registo: Começa a 100%
            new_level = 100
        else:
            # Calcular quanto a bateria desceu desde o último log
            last_time = datetime.strptime(last_battery.logged_at, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
            diff_hours = (datetime.now(timezone.utc) - last_time).total_seconds() / 3600
            
            # Drenagem = tempo * taxa de queima anterior
            drain = diff_hours * last_battery.burn_rate_per_hour
            
            # Recarga = boost da nova refeição
            boost = letty_analysis["game_logic"].get("energy_boost", 0)
            
            # Cálculo final com limites [0, 100]
            current_calc = last_battery.battery_level - drain + boost
            new_level = min(100, max(0, int(current_calc)))

        # PERSISTÊNCIA NA BASE DE DADOs

        # Registar no Histórico de Refeições
        db.execute(
            text("""
                INSERT INTO letty_historic (
                    profile_id, meal, protein, fiber, hydration, 
                    saturated_fat, energy, energy_boost, mood, tip
                )
                VALUES (
                    :profile_id, :meal, :protein, :fiber, :hydration, 
                    :saturated_fat, :energy, :energy_boost, :mood, :tip
                )
            """),
            {
                "profile_id": profile_id,
                "meal": letty_analysis["meal_name"],
                "protein": letty_analysis["nutritional_metrics"]["protein_grams"],
                "fiber": letty_analysis["nutritional_metrics"]["fiber_grams"],
                "hydration": letty_analysis["nutritional_metrics"]["hydration_ml"],
                "saturated_fat": letty_analysis["nutritional_metrics"]["saturated_fat_grams"],
                "energy": letty_analysis["nutritional_metrics"]["energy_kcal"],
                "energy_boost": letty_analysis["game_logic"]["energy_boost"],
                "mood": letty_analysis["letty_feedback"]["mood"],
                "tip": letty_analysis["letty_feedback"]["tip"]
            }
        )

        # Criar novo estado de Bateria
        db.execute(
            text("""
                INSERT INTO battery (profile_id, battery_level, focus_time, burn_rate_per_hour, logged_at)
                VALUES (:pid, :level, :focus, :burn, :now)
            """),
            {
                "pid": profile_id,
                "level": new_level,
                "focus": letty_analysis["game_logic"]["estimated_focus_time_hours"],
                "burn": letty_analysis["game_logic"]["burn_rate_per_hour"],
                "now": now_str
            }
        )

        # Atualizar XP do Perfil
        db.execute(
            text("UPDATE profile SET points = points + :xp WHERE id = :id"),
            {"xp": xp_earned, "id": profile_id}
        )

        db.commit()

        return {
            "status_code": 200,
            "xp_earned": xp_earned,
            "new_battery_level": new_level,
            "meal_name": letty_analysis["meal_name"],
            "nutrition_values":{
                "protein": letty_analysis["nutritional_metrics"]["protein_grams"],
                "fiber": letty_analysis["nutritional_metrics"]["fiber_grams"],
                "hydration": letty_analysis["nutritional_metrics"]["hydration_ml"],
                "saturated_fat": letty_analysis["nutritional_metrics"]["saturated_fat_grams"],
                "energy": letty_analysis["nutritional_metrics"]["energy_kcal"],
            },
            "mood": letty_analysis["letty_feedback"]["mood"],
            "tip": letty_analysis["letty_feedback"]["tip"],
            "feedback": game_results["feedback"],
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

        }

    except Exception as e:
        db.rollback()
        print(f"ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing meal log")
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
@router.get("/{profile_id}/recent")
def get_recent_meals(profile_id: int, db: Session = Depends(get_db)):
    query = text("""
        SELECT meal, energy, hydration, fiber, saturated_fat, protein, mood
        FROM letty_historic
        WHERE profile_id = :profile_id
        ORDER BY logged_at DESC
        LIMIT 3
    """)
    results = db.execute(query, {"profile_id": profile_id}).fetchall()
    
    # Construção manual do dicionário sem usar ._mapping
    meals = []
    for row in results:
        meals.append({
            "status_code": 200,
            "meal": row.meal,
            "nutrition_values":{
                "energy": row.energy,
                "hydration": row.hydration,
                "fiber": row.fiber,
                "saturated_fat": row.saturated_fat,
                "protein": row.protein,
            },
            "mood": row.mood,
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        })
    
    return {"meals": meals}

@router.get("/{profile_id}/all")
def get_all_meals(profile_id: int, db: Session = Depends(get_db)):
    query = text("""
        SELECT meal, energy, hydration, fiber, saturated_fat, protein
        FROM letty_historic
        WHERE profile_id = :profile_id
        ORDER BY logged_at DESC
    """)
    results = db.execute(query, {"profile_id": profile_id}).fetchall()
    
    meals = []
    for row in results:
        meals.append({
            "status_code": 200,
            "meal": row.meal,
            "nutrition_values":{
                "energy": row.energy,
                "hydration": row.hydration,
                "fiber": row.fiber,
                "saturated_fat": row.saturated_fat,
                "protein": row.protein,
            },
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        })
    
    return {"meals": meals}