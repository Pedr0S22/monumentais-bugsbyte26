import json
import os
from datetime import datetime

# --- FILE SYSTEM (No Database Needed) ---
HISTORY_FILE = "user_meal_history.json"

def save_meal_data(user_profile, ai_result, game_points):
    """Saves the meal to a local JSON file."""
    
    # Create the data structure
    entry = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "user": user_profile["name"],
        "meal": ai_result["meal_name"],
        "metrics": ai_result["nutritional_metrics"],
        "scores": game_points
    }

    # Load existing history or create new
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            try:
                history = json.load(f)
            except json.JSONDecodeError:
                history = []
    else:
        history = []

    history.append(entry)

    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=4)
    
    return "Saved successfully!"

# --- THE NUNO PRINCIPLE LOGIC ---
def calculate_game_xp(ai_result, user_goal):
    """
    Calculates XP based on 3 Rules: Loss, Gain, Maintain.
    Uses 'Satiety Index' and 'Balance'.
    """
    metrics = ai_result["nutritional_metrics"]
    
    # Extract values (prevent division by zero)
    protein = metrics.get("protein_grams", 0)
    fiber = metrics.get("fiber_grams", 0)
    water = metrics.get("hydration_ml", 0)
    cals = metrics.get("energy_kcal", 1) # avoid div by 0
    
    # 1. CALCULATE SATIETY INDEX (SI)
    # Formula: (Volume Drivers) / Energy
    # Weighted: Protein is x2 important, Fiber x3 (expands in stomach)
    satiety_score = ((protein * 2) + (fiber * 3) + (water * 0.5)) / cals * 100
    
    # 2. CALCULATE BALANCE SCORE (0 to 100)
    # A balanced meal has significant Protein AND Fiber
    balance_points = 0
    if protein > 20: balance_points += 40
    elif protein > 10: balance_points += 20
    
    if fiber > 5: balance_points += 30
    elif fiber > 2: balance_points += 10
    
    if metrics.get("saturated_fat_grams", 0) < 10: balance_points += 30
    
    # --- APPLY THE 3 RULES ---
    
    final_xp = 0
    feedback = ""

    # RULE 1: WEIGHT LOSS (The "Volume" Game)
    # Goal: High Satiety, Moderate Calories
    if "loss" in user_goal.lower():
        if satiety_score > 15: # Very filling, low cal
            final_xp = 80 + (balance_points * 0.2)
            feedback = "🔥 Perfect! High volume, low energy."
        elif satiety_score > 8:
            final_xp = 60 + (balance_points * 0.2)
            feedback = "Good, but add more veggies (fiber) next time."
        else:
            final_xp = 30
            feedback = "⚠️ Warning: Calorie dense but low satiety. You will feel hungry soon."

    # RULE 2: WEIGHT GAIN (The "Density" Game)
    # Goal: High Calories, Moderate Satiety (Don't get too full)
    # As Nuno said: "Pouco volume e muita energia"
    elif "gain" in user_goal.lower() or "muscle" in user_goal.lower():
        if cals > 500 and protein > 25:
            final_xp = 90
            feedback = "💪 Beast Mode! High energy and protein."
        elif cals < 300:
            final_xp = 40
            feedback = "Not enough fuel for growth. Eat more!"
        else:
            final_xp = 60
            feedback = "Decent, but try to increase calorie density."

    # RULE 3: MAINTENANCE (The "Balance" Game)
    else:
        final_xp = balance_points
        feedback = "Balanced and steady."

    return {
        "xp_awarded": int(final_xp),
        "satiety_index": round(satiety_score, 2),
        "balance_score": balance_points,
        "coach_logic": feedback
    }

# --- TEST IT ---
if __name__ == "__main__":
    # Fake AI Result (Simulating your output)
    fake_ai_output = {
        "meal_name": "Chicken Salad",
        "nutritional_metrics": {
            "protein_grams": 30,
            "fiber_grams": 8,
            "hydration_ml": 150,
            "saturated_fat_grams": 2,
            "energy_kcal": 350
        }
    }
    
    # Test for Weight Loss User
    print("--- User Goal: Weight Loss ---")
    xp_result = calculate_game_xp(fake_ai_output, "Weight loss")
    print(json.dumps(xp_result, indent=4))
    
    # Save it
    save_meal_data({"name": "Francisca"}, fake_ai_output, xp_result)