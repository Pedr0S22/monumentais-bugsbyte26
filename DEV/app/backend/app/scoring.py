import json
import os
from datetime import datetime

# We will handle file saving in the main app.py,
# but we keep the logic here pure.

def calculate_nuno_score(metrics, user_goal):
    """
    Applies the 'Nuno Principle' to calculate XP.
    """
    p = metrics.get("protein_grams", 0)
    f = metrics.get("fiber_grams", 0)
    w = metrics.get("hydration_ml", 0)
    kcal = metrics.get("energy_kcal", 1)
    sugar = metrics.get("sugar_grams", 0)

    # Satiety Index (Volume / Energy)
    satiety_index = ((p * 2.0) + (f * 3.0) + (w * 0.2)) / kcal * 100
    
    xp = 0
    feedback = ""
    bonus_tag = ""

    # RULE 1: Weight Loss
    if "loss" in user_goal.lower():
        if satiety_index > 10:
            xp = 100
            feedback = "🏆 Perfect Volume! You'll feel full for hours."
            bonus_tag = "Volume King"
        elif satiety_index > 5:
            xp = 75
            feedback = "Good, but add more veggies."
        else:
            xp = 40
            feedback = "⚠️ Calorie Dense! Watch out."
        if sugar > 15:
            xp -= 10

    # RULE 2: Muscle/Gain
    elif "gain" in user_goal.lower() or "muscle" in user_goal.lower():
        if kcal > 500 and p > 25:
            xp = 100
            feedback = "🦍 BEAST MODE! High energy & protein."
            bonus_tag = "Gains Secured"
        elif kcal < 300:
            xp = 30
            feedback = "❌ Too light! You need fuel."
        else:
            xp = 70
            feedback = "Good protein, try more carbs."

    # RULE 3: Maintenance
    else:
        if p > 20 and f > 5:
            xp = 90
            feedback = "Perfectly balanced."
        else:
            xp = 50
            feedback = "A bit unbalanced."

    return {
        "xp_earned": int(xp),
        "satiety_index": round(satiety_index, 2),
        "feedback": feedback,
        "bonus_tag": bonus_tag
    }