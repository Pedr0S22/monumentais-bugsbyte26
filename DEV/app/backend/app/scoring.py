from dataclasses import dataclass
from typing import Optional

from .config import get_settings


@dataclass
class ScoreComponents:
    stability: float
    satiety: float
    balance: float
    total_score: float


def clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


def _get_score_weights():
    settings = get_settings()
    return settings.stability_weight, settings.satiety_weight, settings.balance_weight


def compute_score(*, carbs: float, protein: float, fiber: float, fats: float, sat_fat: float = 0.0, gi: float = 50.0, hydration: float = 0.0) -> ScoreComponents:
    # Estabilidade glicêmica
    stability_raw = 100 - (gi * carbs / 100)
    stability = clamp(stability_raw)

    # Saciedade
    satiety_raw = (protein * 4) + (fiber * 6) + (hydration * 2) - (sat_fat * 2)
    satiety = clamp(satiety_raw)

    # Balance heurística
    balance = 100 if (15 <= protein <= 30 and fiber > 5 and 10 <= fats <= 25) else 60

    stability_weight, satiety_weight, balance_weight = _get_score_weights()
    total = (stability * stability_weight) + (satiety * satiety_weight) + (balance * balance_weight)
    return ScoreComponents(
        stability=round(stability, 1),
        satiety=round(satiety, 1),
        balance=round(balance, 1),
        total_score=round(total, 1),
    )
