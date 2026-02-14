import json
import os
from datetime import datetime

# --- CONFIGURATION---
TARGET_DIRECTORY = r"DEV\app\backend\app\llm_output"
INPUT_FILENAME = "temp_llm_output.json"
OUTPUT_HISTORY_FILE = "user_game_history.json"

def load_llm_data():
    """Reads the raw data from the specific directory."""
    file_path = os.path.join(TARGET_DIRECTORY, INPUT_FILENAME)
    if not os.path.exists(file_path):
        print(f"❌ Error: Could not find file at {file_path}")
        print("   -> Did you run the LLM script first?")
        return None
        
    with open(file_path, "r") as f:
        print(f"📂 Loading data from: {file_path}")
        return json.load(f)

def calculate_nuno_score(metrics, user_goal):
    """
    - Weight Loss = High Satiety / Low Energy (Volume)
    - Weight Gain = Low Satiety / High Energy (Density)
    """
    
    # 1. Extract Metrics (Safe Defaults)
    p = metrics.get("protein_grams", 0)
    f = metrics.get("fiber_grams", 0)
    w = metrics.get("hydration_ml", 0)
    kcal = metrics.get("energy_kcal", 1)
    sf = metrics.get("saturated_fat_grams", 0)
    

    # 2. Calculate Satiety Index (SI)
    # This formula rewards Volume (Fiber/Water/Protein) relative to Calories
    numerator=(p * 2.0) + (f * 5.0) + (w * 0.2)-(sf* 2.0)
    satiety_index = (numerator / kcal * 100) if kcal > 0 else 0
    xp = 0
    feedback = ""
    bonus_tag = ""

    # --- RULE SET 1: WEIGHT LOSS ("The Volume Game") ---
    if "loss" in user_goal.lower():
        # Ideal: High Satiety (>10), Low Kcal (<600)
        if satiety_index > 15:
            xp = 100
            feedback = "🏆 Perfect Volume! You'll feel full for hours."
            bonus_tag = "Volume King"
        elif satiety_index > 8:
            xp = 75
            feedback = "Good meal, but add more veggies (fiber) next time."
        else:
            xp = 40
            feedback = "⚠️ Calorie Dense! Small portion, high energy. Watch out."

    # --- RULE SET 2: WEIGHT GAIN ("The Density Game") ---
    elif "gain" in user_goal.lower() or "muscle" in user_goal.lower():
        # Ideal: High Calories (>500), High Protein (>25g)
        # Logic: "Little volume, lots of energy"
        # 1. Clean Bulk (Perfect)
        if kcal > 500 and p > 30 and sf < 10:
            xp = 100
            feedback = "🦍 BEAST MODE! High energy & protein."
            bonus_tag = "Gains Secured"
        # 2. Dirty Bulk (Good stats, bad fat) - FIX: Changed OR to AND logic
        elif kcal > 500 and p > 25:
            xp = 75
            feedback = "💪 Gains Secured. Warning: High saturated fat detected."
            bonus_tag = "Dirty Bulk"
        # 3. Under-eating (Failure)
        elif kcal < 300:
            xp = 30
            feedback = "❌ Too light! You need more fuel to grow."
            bonus_tag = "Catabolic"
        # 4. Average
        else:
            xp = 60
            feedback = "Decent protein, but try to increase calorie density."
    # --- RULE SET 3: MAINTENANCE ---
    else:
        # 1. PERFECT BALANCE
        # Calories in range (400-800), Good Protein, Low Sat Fat
        if 400 <= kcal <= 800 and p > 20 and f > 5 and sf < 8:
            xp = 100
            feedback = "⚖️ Perfect Balance. Stable energy, zero crash."
            bonus_tag = "Zen Mode"
            
        # 2. GOOD BUT HEAVY (The "Cheat Meal" trap)
        # Good macros but calories are blowing the budget (> 800)
        elif kcal > 800:
            xp = 60
            feedback = "⚠️ Overshoot! Good nutrients, but watch the calorie surplus."
            bonus_tag = "Heavy"
            
        # 3. STANDARD OKAY MEAL
        elif p > 15 and f > 3:
            xp = 80
            feedback = "Solid choice. Keeps the engine running."
            
        # 4. POOR BALANCE
        else:
            xp = 40
            feedback = "Unbalanced. Missing protein or fiber to sustain energy."
    return {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "xp_earned": int(xp),
        "satiety_index": round(satiety_index, 2),
        "feedback": feedback,
        "bonus_tag": bonus_tag
    }

def update_history(score_data, meal_name):
    """Saves the final score to the user's history file in the directory."""
    history_path = os.path.join(TARGET_DIRECTORY, OUTPUT_HISTORY_FILE)
    # Add meal name to the record
    score_data["meal_name"] = meal_name
    history = []
    if os.path.exists(history_path):
        with open(history_path, "r") as f:
            try:
                history = json.load(f)
            except:
                history = []
    
    history.append(score_data)
    with open(history_path, "w") as f:
        json.dump(history, f, indent=4)
    print(f"✅ Score saved to History: {history_path}")

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    print("🎮 Starting Game Engine...")
    
    # 1. Load Raw Data
    raw_data = load_llm_data()
    if raw_data:
        # Change this manually to test logic: "Weight gain", "Maintenance"
        current_user_goal = "Weight loss"
        print(f"📊 Analyzing '{raw_data['meal_name']}' for Goal: {current_user_goal}...")
        # 2. Calculate Score
        score = calculate_nuno_score(raw_data["nutritional_metrics"], current_user_goal)
        # 3. Show Results
        print("\n" + "="*30)
        print(f"  XP EARNED: {score['xp_earned']}")
        print(f"  FEEDBACK:  {score['feedback']}")
        print("="*30 + "\n")
        # 4. Save to History
        update_history(score, raw_data["meal_name"])