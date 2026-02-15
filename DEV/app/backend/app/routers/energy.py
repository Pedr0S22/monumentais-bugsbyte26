from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from .. import schemas
from ..db import get_db

router = APIRouter(prefix="/api/v1/energy", tags=["energy"])

@router.post("")
def update_energy(payload: schemas.BatteryUpdate, db: Session = Depends(get_db)):
    try:
        query = text("""
            INSERT INTO battery (profile_id, battery_level, focus_time, burn_rate_per_hour, logged_at)
            VALUES (:profile_id, :battery_level, :focus_time, :burn_rate_per_hour, CURRENT_TIMESTAMP)
        """)
        db.execute(query, {
            "profile_id": payload.profile_id,
            "battery_level": payload.battery_level,
            "focus_time": payload.focus_time,
            "burn_rate_per_hour": payload.burn_rate_per_hour
        })
        db.commit()
        return {"status": "success", "message": "Battery logged successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{profile_id}/last", response_model=schemas.BatteryRead)
def get_energy(profile_id: int, db: Session = Depends(get_db)):
    query = text("""
        SELECT battery_level, logged_at, focus_time, burn_rate_per_hour
        FROM battery
        WHERE profile_id = :profile_id
        ORDER BY logged_at DESC
        LIMIT 1
    """)
    result = db.execute(query, {"profile_id": profile_id}).fetchone()
    
    if result:
        battery = result[0]
        logged_at = result[1]
        focus_time = result[2]
        burn_rate = result[3]

        if isinstance(logged_at, str):
            try:
                logged_at = datetime.fromisoformat(logged_at.replace(" ", "T"))
            except ValueError:
                logged_at = None

        crash_risk = battery < 40
        return schemas.BatteryRead(
            code_status = 200,
            battery_level=battery,
            crash_risk=crash_risk,
            logged_at=logged_at,
            focus_time=focus_time,
            burn_rate_per_hour=burn_rate,
            timestamp= datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        )
    
    # Fallback if no records exist yet
    return schemas.BatteryRead(
        code_status=200,
        battery_level=50,
        crash_risk=False,
        logged_at=datetime.now(timezone.utc),
        focus_time=0.0,
        burn_rate_per_hour=0.0,
        timestamp= datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    )

@router.get("/{profile_id}/history", response_model=schemas.BatteryHistoryResponse)
def get_energy_history(profile_id: int, db: Session = Depends(get_db)):
    query = text("""
        SELECT battery_level, logged_at, focus_time, burn_rate_per_hour
        FROM battery
        WHERE profile_id = :profile_id AND logged_at >= datetime('now', '-24 hours')
        ORDER BY logged_at DESC
    """)
    results = db.execute(query, {"profile_id": profile_id}).fetchall()
    
    history_list = []
    for row in results:
        logged_at = row[1]
        if isinstance(logged_at, str):
            try:
                logged_at = datetime.fromisoformat(logged_at.replace(" ", "T"))
            except ValueError:
                logged_at = None
                
        history_list.append({
            "battery_level": row[0],
            "logged_at": logged_at,
            "focus_time": row[2],
            "burn_rate_per_hour": row[3]
        })
        
    return schemas.BatteryHistoryResponse(
        status_code = 200,
        history=history_list,
        timestamp= datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        )