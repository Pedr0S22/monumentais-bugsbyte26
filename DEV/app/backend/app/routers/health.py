from datetime import datetime
from fastapi import APIRouter
from .. import schemas

router = APIRouter(prefix="/api/v1/health", tags=["health"])


@router.get("", response_model=schemas.HealthRead)
def healthcheck():
    return schemas.HealthRead(status="ok", timestamp=datetime.utcnow())
