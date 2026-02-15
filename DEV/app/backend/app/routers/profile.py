from datetime import datetime,timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi import APIRouter
from .. import schemas
from sqlalchemy import text
from ..db import get_db

router = APIRouter(prefix="/api/v1/profile", tags=["health"])


@router.get("/{profile_id}", response_model=schemas.ProfileRead)
def get_profile(profile_id: int, db: Session = Depends(get_db)):
    # Fixed the WHERE clause to use 'id' instead of 'profile_id'
    query = text("""
        SELECT name, goal, diet, points, progress_status
        FROM profile
        WHERE id = :profile_id
    """)
    result = db.execute(query, {"profile_id": profile_id}).fetchone()
    
    # Handle the case where the profile doesn't exist
    if not result:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Directly map the single result to the schema (no for-loop needed!)
    return schemas.ProfileRead(
        status_code = 200,
        profile={
            "name":result[0],
            "goal":result[1],
            "diet":result[2],
            "points":result[3],
            "progress_status":result[4]
        },
        timestamp=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    )
