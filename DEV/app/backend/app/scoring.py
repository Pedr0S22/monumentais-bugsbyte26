import json
import os

# CONFIGURATION
INPUT_FILE = "temp_llm_output.json"
HISTORY_FILE = "user_game_history.json"

def load_llm_data():
    """Reads the raw data from the LLM."""
    if not os.path.exists(INPUT_FILE):
        return None
    with open(INPUT_FILE, "r") as f:
        return json.load(f)

def calculate_nuno_score(metrics, user_goal):
    """
    Applies the 'Nuno Principle':
    - Weight Loss = High Satiety / Low Energy (Volume)
    - Weight Gain = Low Satiety / High Energy (Density)
    """
    
    # 1. Extract Metrics (Safe Defaults)
    p = metrics.get("protein_grams", 0)
    f = metrics.get("fiber_grams", 0)
    w = metrics.get("hydration_ml", 0)
    kcal = metrics.get("energy_kcal", 1) # Avoid div/0
    sugar = metrics.get("sugar_grams", 0) # Make sure LLM extracts this if possible

    # 2. Calculate Satiety Index (SI)
    # This formula rewards Volume (Fiber/Water/Protein) relative to Calories
    satiety_index = ((p * 2.0) + (f * 3.0) + (w * 0.2)) / kcal * 100
    
    xp = 0
    feedback = ""
    bonus_tag = ""

    # --- RULE SET 1: WEIGHT LOSS ("The Volume Game") ---
    if "loss" in user_goal.lower():
        # Ideal: High Satiety (>10), Low Kcal (<600)
        if satiety_index > 10:
            xp = 100
            feedback = "🏆 Perfect Volume! You'll feel full for hours."
            bonus_tag = "Volume King"
        elif satiety_index > 5:
            xp = 75
            feedback = "Good meal, but add more veggies (fiber) next time."
        else:
            xp = 40
            feedback = "⚠️ Calorie Dense! Small portion, high energy. Watch out."
            
        # Penalty for Sugar in Weight Loss
        if sugar > 15:
            xp -= 10
            feedback += " (Sugar spike detected!)"

    # --- RULE SET 2: WEIGHT GAIN ("The Density Game") ---
    elif "gain" in user_goal.lower() or "muscle" in user_goal.lower():
        # Ideal: High Calories (>500), High Protein (>25g)
        # Nuno's Logic: "Little volume, lots of energy"
        
        density_score = kcal / (p + f + w + 1) # Simplified Density metric
        
        if kcal > 500 and p > 25:
            xp = 100
            feedback = "🦍 BEAST MODE! High energy & protein."
            bonus_tag = "Gains Secured"
        elif kcal < 300:
            xp = 30
            feedback = "❌ Too light! You need more fuel to grow."
        else:
            xp = 70
            feedback = "Good protein, but try to eat more carbs."

    # --- RULE SET 3: MAINTENANCE ("The Balance Game") ---
    else:
        # Ideal: Balanced Macros
        if p > 20 and f > 5:
            xp = 90
            feedback = "Perfectly balanced."
        else:
            xp = 50
            feedback = "A bit unbalanced. Missing protein or fiber."

    return {
        "xp": int(xp),
        "level_progress": int(xp) / 1000, # Example: 1000 XP to level up
        "satiety_index": round(satiety_index, 2),
        "feedback": feedback,
        "bonus": bonus_tag
    }

def update_history(score_data):
    """Saves the final score to the user's permanent history."""
    history = []
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            try:
                history = json.load(f)
            except:
                history = []
    
    history.append(score_data)
    
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=4)
    print("✅ Score saved to History!")

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    # 1. Load Raw Data
    raw_data = load_llm_data()
    
    if raw_data:
        # In a real app, you get this from the user's login session
        current_user_goal = "Weight loss"
        
        print(f"📊 Analyzing for Goal: {current_user_goal}...")
        
        # 2. Calculate Score
        score = calculate_nuno_score(raw_data["nutritional_metrics"], current_user_goal)
        
        # 3. Show Result
        print(json.dumps(score, indent=4))
        
        # 4. Save
        update_history(score)
    else:
        print("❌ No new meal data found. Run llm_analyzer.py first!")