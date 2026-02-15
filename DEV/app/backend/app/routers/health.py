from datetime import datetime, timezone
from fastapi import APIRouter
from .. import schemas

router = APIRouter(prefix="/api/v1/health", tags=["health"])


@router.get("", response_model=schemas.HealthRead)
def healthcheck():
    return schemas.HealthRead(status=200, timestamp=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"))
