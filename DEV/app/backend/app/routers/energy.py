from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from datetime import datetime, timezone
from ..db import get_db

router = APIRouter(prefix="/api/v1/energy", tags=["energy"])

class EnergyUpdate(BaseModel):
    energy_level: float

class EnergyResponse(BaseModel):
    energy_level: float
    updated_at: str

@router.patch("")
def update_energy(payload: EnergyUpdate, db: Session = Depends(get_db)):
    # Raw SQL to update the single row
    query = text("""
        UPDATE energy_state 
        SET energy_level = :energy, updated_at = CURRENT_TIMESTAMP
    """)
    db.execute(query, {"energy": payload.energy_level})
    db.commit()
    return {"status": "Energy updated successfully"}

@router.get("", response_model=EnergyResponse)
def get_energy(db: Session = Depends(get_db)):
    # Fetching the single row
    query = text("SELECT energy_level, updated_at FROM energy_state LIMIT 1")
    result = db.execute(query).fetchone()
    
    if result:
        return EnergyResponse(energy_level=result[0], updated_at=str(result[1]))
    
    # Fallback if table is empty
    return EnergyResponse(energy_level=100.0, updated_at=str(datetime.now(timezone.utc)))