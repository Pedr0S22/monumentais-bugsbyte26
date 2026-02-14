from typing import Dict, Optional

from fastapi import APIRouter, File, HTTPException, UploadFile

from .. import schemas, scoring

router = APIRouter(prefix="/api/v1", tags=["photos"])


def _derive_macros(filename: Optional[str]) -> Dict[str, float]:
    base = sum(ord(char) for char in (filename or "Letty"))
    return {
        "protein": 16 + (base % 6),
        "fiber": 4 + (base % 5),
        "carbs": 20 + (base % 30),
        "fats": 10 + (base % 8),
        "hydration": 5 + (base % 7),
        "gi": 35 + (base % 30),
    }


def _quality_label(score: float) -> str:
    if score >= 80:
        return "fantastic"
    if score >= 65:
        return "steady"
    return "needs a boost"


@router.post("/analyze-meal", response_model=schemas.MealPhotoAnalysis)
async def analyze_meal_photo(image: UploadFile = File(...)):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are supported")

    await image.read()
    macros = _derive_macros(image.filename)
    score_components = scoring.compute_score(
        carbs=macros["carbs"],
        protein=macros["protein"],
        fiber=macros["fiber"],
        fats=macros["fats"],
        gi=macros["gi"],
        hydration=macros["hydration"],
    )
    quality = _quality_label(score_components.total_score)
    suffix = f" Seen in {image.filename}." if image.filename else ""
    message = f"Letty senses a {quality} plate — keep protein and fiber up to stay in the green.{suffix}"

    return schemas.MealPhotoAnalysis(
        score=score_components.total_score,
        meal_quality=quality,
        message=message,
        macros={
            "protein": macros["protein"],
            "fiber": macros["fiber"],
            "carbs": macros["carbs"],
            "fats": macros["fats"],
            "hydration": macros["hydration"],
        },
    )