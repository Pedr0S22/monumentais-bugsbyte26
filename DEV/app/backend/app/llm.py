import base64
import json
import re
import os
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

# Load env variables
load_dotenv()
HF_TOKEN = os.getenv("token")

# Initialize Client
client = InferenceClient(
    model="Qwen/Qwen2.5-VL-7B-Instruct",
    token=HF_TOKEN
)

def letty_nutrition_evaluator(image_path, user_profile):
    """
    Takes an image path and user profile dict.
    Returns the analysis JSON directly.
    """
    try:
        with open(image_path, "rb") as f:
            base64_image = base64.b64encode(f.read()).decode("utf-8")
    except FileNotFoundError:
        return {"error": "Image file not found."}

    image_url = f"data:image/jpeg;base64,{base64_image}"

    prompt = f"""
    Act as Letty, a witty nutrition coach.
    USER PROFILE: Goal: {user_profile.get('goal', 'General Health')}, Diet: {user_profile.get('diet_type', 'Balanced')}.
    
    TASK:
    1. Identify dish.
    2. Estimate: Protein, Fiber, Hydration, Fat, Energy.
    3. Calculate Energy Boost & Burn Rate.
    4. Provide a 'Letty Tip' (max 15 words).

    RETURN ONLY JSON:
    {{
    "meal_name": "string",
    "nutritional_metrics": {{
        "protein_grams": int, "fiber_grams": int, "hydration_ml": int, "saturated_fat_grams": int, "energy_kcal": int, "sugar_grams": int
    }},
    "game_logic": {{
        "energy_boost": int, "burn_rate_per_hour": int, "estimated_focus_time_hours": float
    }},
    "letty_feedback": {{
        "mood": "Happy | Meh | Sad", "tip": "string"
    }}
    }}
    """

    try:
        response = client.chat_completion(
            messages=[
                {"role": "user", "content": [{"type": "text", "text": prompt}, {"type": "image_url", "image_url": {"url": image_url}}]}
            ],
            max_tokens=900
        )
        content = response.choices[0].message.content
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        return json.loads(json_match.group()) if json_match else {"error": "Invalid LLM output"}

    except Exception as e:
        return {"error": str(e)}