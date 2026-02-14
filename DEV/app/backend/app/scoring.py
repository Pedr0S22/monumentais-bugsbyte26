from dataclasses import dataclass
from typing import Optional


@dataclass
class ScoreComponents:
    stability: float
    satiety: float
    balance: float
    total_score: float


def clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


def compute_score(*, carbs: float, protein: float, fiber: float, fats: float, sat_fat: float = 0.0, gi: float = 50.0, hydration: float = 0.0) -> ScoreComponents:
    # Estabilidade glicêmica
    stability_raw = 100 - (gi * carbs / 100)
    stability = clamp(stability_raw)

    # Saciedade
    satiety_raw = (protein * 4) + (fiber * 6) + (hydration * 2) - (sat_fat * 2)
    satiety = clamp(satiety_raw)

    # Balance heurística
    balance = 100 if (15 <= protein <= 30 and fiber > 5 and 10 <= fats <= 25) else 60

    total = (stability * 0.6) + (satiety * 0.3) + (balance * 0.1)
    return ScoreComponents(
        stability=round(stability, 1),
        satiety=round(satiety, 1),
        balance=round(balance, 1),
        total_score=round(total, 1),
    )
