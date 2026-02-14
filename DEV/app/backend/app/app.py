from flask import Flask, jsonify, request
import logging
import os
import json
import time
from datetime import datetime
from werkzeug.utils import secure_filename

# Import your modules
from llm import letty_nutrition_evaluator
from scoring import calculate_nuno_score

# Setup Flask
app = Flask(__name__)

# --- CONFIGURATION ---
UPLOAD_FOLDER = 'uploads'
HISTORY_FILE = 'user_game_history.json'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Setup Logger (Just like cloud_query.py)
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('nutriquest')


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/nutriquest/')
def hello():
    return "🥬 NutriQuest API is Online!"

@app.route('/nutriquest/scan_meal', methods=['POST'])
def scan_meal():
    """
    Main Endpoint:
    1. Receives Image + User Profile
    2. Runs LLM
    3. Runs Scoring
    4. Saves History
    5. Returns Combined JSON
    """
    logger.info("### POST /scan_meal ###")

    # 1. Check Image
    if 'image' not in request.files:
        return jsonify({'status': 400, 'error': 'No image file provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'status': 400, 'error': 'No selected file'}), 400

    # 2. Check User Data (sent as form-data strings)
    user_goal = request.form.get('goal', 'Weight loss')
    diet_type = request.form.get('diet_type', 'Balanced')
    progress = request.form.get('progress', 'Neutral')

    user_profile = {
        "goal": user_goal,
        "diet_type": diet_type,
        "progress_status": progress
    }

    if file and allowed_file(file.filename):
        # Save image temp
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        logger.info(f"Image saved to {filepath}")

        # --- STEP 1: AI ANALYSIS ---
        logger.info("🥬 Calling Letty LLM...")
        llm_result = letty_nutrition_evaluator(filepath, user_profile)

        if "error" in llm_result:
            return jsonify({'status': 500, 'error': llm_result["error"]}), 500

        # --- STEP 2: SCORING LOGIC ---
        logger.info("🎮 Calculating Nuno Score...")
        game_score = calculate_nuno_score(llm_result["nutritional_metrics"], user_goal)

        # --- STEP 3: COMBINE & SAVE ---
        full_response = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "meal_data": llm_result,
            "game_data": game_score
        }

        # Save to JSON history (simulating DB)
        history = []
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, "r") as f:
                try:
                    history = json.load(f)
                except: 
                    pass
        history.append(full_response)
        
        with open(HISTORY_FILE, "w") as f:
            json.dump(history, f, indent=4)

        # Cleanup temp image
        os.remove(filepath)

        return jsonify({'status': 200, 'result': full_response})

    return jsonify({'status': 400, 'error': 'Invalid file type'}), 400

@app.route('/nutriquest/history', methods=['GET'])
def get_history():
    """Returns the user's meal log"""
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            data = json.load(f)
        return jsonify({'status': 200, 'history': data})
    else:
        return jsonify({'status': 200, 'history': []})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)