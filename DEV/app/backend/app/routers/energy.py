from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from .. import schemas
from ..db import get_db

router = APIRouter(prefix="/api/v1/energy", tags=["energy"])

@router.patch("")
def update_energy(payload: schemas.EnergyUpdate, db: Session = Depends(get_db)):
    try:
        # CHANGED: We now INSERT instead of UPDATE to keep a history log
        query = text("""
            INSERT INTO energy_state (energy_percent, updated_at) 
            VALUES (:energy, CURRENT_TIMESTAMP)
        """)
        db.execute(query, {"energy": payload.energy_percent})
        db.commit()
        return {"status": "success", "message": "Energy logged successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=schemas.EnergyRead)
def get_energy(db: Session = Depends(get_db)):
    # CHANGED: We now order by DESC and get the newest row
    query = text("""
        SELECT energy_percent, updated_at 
        FROM energy_state 
        ORDER BY updated_at DESC 
        LIMIT 1
    """)
    result = db.execute(query).fetchone()
    
    if result:
        energy = result[0]
        updated_at = result[1] 
        if isinstance(updated_at, str):
            try:
                updated_at = datetime.fromisoformat(updated_at.replace(" ", "T"))
            except ValueError:
                updated_at = None

        crash_risk = energy < 40.0
        return schemas.EnergyRead(
            energy_percent=round(energy, 1),
            crash_risk=crash_risk,
            last_meal_at=updated_at
        )
    
    # Fallback if no records exist
    return schemas.EnergyRead(
        energy_percent=100.0, 
        crash_risk=False, 
        last_meal_at=datetime.now(timezone.utc)
    )


# NEW ENDPOINT: Fetch the last 24 hours of energy history
@router.get("/history", response_model=schemas.EnergyHistoryResponse)
def get_energy_history(db: Session = Depends(get_db)):
    # Fetch records where the updated_at timestamp is within the last 24 hours
    # 'datetime('now', '-24 hours')' is the SQLite syntax to do this.
    query = text("""
        SELECT energy_percent, updated_at 
        FROM energy_state 
        WHERE updated_at >= datetime('now', '-24 hours')
        ORDER BY updated_at ASC
    """)
    results = db.execute(query).fetchall()
    
    history_list = []
    for row in results:
        updated_at = row[1]
        if isinstance(updated_at, str):
            try:
                updated_at = datetime.fromisoformat(updated_at.replace(" ", "T"))
            except ValueError:
                updated_at = None
                
        history_list.append({
            "energy_percent": row[0],
            "updated_at": updated_at
        })
        
    return schemas.EnergyHistoryResponse(history=history_list)