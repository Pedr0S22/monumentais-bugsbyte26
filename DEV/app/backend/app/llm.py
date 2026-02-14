import base64
import json
import re
import os
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

# Configuration
load_dotenv()
HF_TOKEN = os.getenv("token")
client = InferenceClient(
    model="Qwen/Qwen2.5-VL-7B-Instruct",
    token=HF_TOKEN
)
def letty_nutrition_evaluator(user_profile, image_path=None, user_text=None):
    """
    Evaluates meals via image, text, or both.
    Returns error 400 if the input is not a meal.
    """
    if not image_path and not user_text:
        return {"error": "No input provided.", "status_code": 400}

    content_list = []
    
    # 1. Preparar a Imagem (se existir)
    if image_path:
        try:
            with open(image_path, "rb") as f:
                base64_image = base64.b64encode(f.read()).decode("utf-8")
            image_url = f"data:image/jpeg;base64,{base64_image}"
            content_list.append({"type": "image_url", "image_url": {"url": image_url}})
        except FileNotFoundError:
            return {"error": "Image file not found.", "status_code": 400}

def letty_nutrition_evaluator(image_path, user_profile):
    """
    Evaluates meals to provide game-engine values: Energy Boost and Burn Rate.
    """
    try:
        with open(image_path, "rb") as f:
            base64_image = base64.b64encode(f.read()).decode("utf-8")
    except FileNotFoundError:
        return {"error": "Image file not found."}

    image_url = f"data:image/jpeg;base64,{base64_image}"

    # Optimized Prompt for Game Mechanics
    prompt = f"""
    Act as Letty, a witty and supportive nutrition coach. If the user eats well, be their biggest cheerleader. If they eat junk, be playfully sarcastic but helpful.
    Analyze the food image considering the user's specific context.

    USER PROFILE:
    - Goal: {user_profile['goal']}
    - Diet Type: {user_profile['diet_type']}
    - Current Progress: {user_profile['progress_status']}

    MOTIVATION STRATEGY:
    - Use the user's 'progress_status' to adapt your empathy level.
    - Prioritize positive reinforcement to build momentum, especially if the user is struggling.
    - Avoid shaming; focus on small improvements and keeping the streak alive.

    LETTY'S MOOD CRITERIA:
    - 'Happy': Encouraging choice that aligns with the goal or helps stabilize their current progress.
    - 'Meh': A neutral step that could be optimized with a friendly nudge.
    - 'Sad': Only for significant setbacks where a firm but caring wake-up call is necessary.

    TASK:
    1. Identify dish/ingredients.
    2. Estimate: Protein (g), Fiber (g), Hydration (ml), Saturated Fat (g), and Energy (kcal).
    3. Calculate 'Energy Boost': How many points (0-50) this meal adds to a 100-point bar.
    4. Calculate 'Burn Rate': How many points are lost per hour after eating this.
    - Low Burn Rate (2-5 pts/h): Complex carbs, fiber, protein (Sustained energy).
    - High Burn Rate (15-20 pts/h): High sugar, processed food (Fast depletion).
    5. Provide a 'Letty Tip': A VERY SHORT (max 15 words) motivational tip in English.

    RETURN ONLY JSON:
    {{
    "meal_name": "string",
    "nutritional_metrics": {{
        "protein_grams": int,
        "fiber_grams": int,
        "hydration_ml": int,
        "saturated_fat_grams": int,
        "energy_kcal": int
    }},
    "game_logic": {{
        "energy_boost": int,
        "burn_rate_per_hour": int,
        "estimated_focus_time_hours": float
    }},
    "letty_feedback": {{
        "mood": "Happy | Meh | Sad",
        "tip": "string"
    }}
    }}
    """

    try:
        response = client.chat_completion(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ]
                }
            ],
            max_tokens=900
        )
        content = response.choices[0].message.content
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        return json.loads(json_match.group()) if json_match else {"error": "Invalid output"}
    except Exception as e:
        return {"error": str(e)}

def save_llm_output(data, output_dir, filename="temp_llm_output.json"):
    """
    Saves the raw LLM analysis to a SPECIFIC directory.
    Automatically creates the folder if it doesn't exist.
    """
    
    if not os.path.exists(output_dir):
        try:
            os.makedirs(output_dir)
            print(f"📁 Created new directory: {output_dir}")
        except OSError as e:
            print(f"❌ Error creating directory: {e}")
            return
    
    full_path = os.path.join(output_dir, filename)
    
    with open(full_path, "w") as f:
        json.dump(data, f, indent=4)
    print(f"✅ Data passed to Game Engine: {full_path}")

# ChatBot queries

def build_nutritionist_prompt(profile_id: int, user_question: str, rag_advice: str = "") -> str:
    """
    Constructs the prompt adhering to the new professional nutritionist persona and rules.
    """
    return f"""You are a professional nutritionist with general knowledge of every aspect of nutrition, dietetics, and wellness.

Consider the profile of the client (Profile ID: {profile_id}).

Consider the following retrieved RAG advice. If it is valid and relevant to the user's question, use it to inform your answer. If it is not relevant or does not exist, ignore it:
[RAG Advice Start]
{rag_advice if rag_advice else "No specific RAG advice retrieved."}
[RAG Advice End]

User Question:
"{user_question}"

Instructions:
Give a personalized answer based on the user's question and profile. Do not give a big or overly lengthy answer; provide exactly and strictly just what needs to be answered.
"""

def generate_reply(profile_id: int, message: str, rag_advice: str = "") -> str:
    # 1. Generate the exact prompt
    prompt = build_nutritionist_prompt(profile_id, message, rag_advice)
    
    # 2. Call the actual HuggingFace LLM client you initialized at the top of the file
    try:
        # Wrap the prompt in the standard messages format required by the client
        response = client.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500
        )
        # Extract and return the actual text generated by Qwen
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"Letty Generation Error: {e}")
        return "As your nutritionist, I want to give you the best advice, but my system is currently down. Let's chat again shortly!"

# --- HACKATHON DEMO ---
if __name__ == "__main__":
    test_user = {
        "name": "Francisca",
        "goal": "Weight loss and sustainable calorie deficit",
        "diet_type": "Omnivore / Balanced",
        "progress_status": "Emotional rollercoaster (inconsistent tracking this week)"
    }
    img_path = r"C:\Users\ramya\Desktop\mc donald food.avif"
    output_dir = "DEV/app/backend/app/llm_output"
    print("🥬 Letty is calculating your energy boost and burn rate...")
    result = letty_nutrition_evaluator(img_path, test_user)
    save_llm_output(result, output_dir)
    print(json.dumps(result, indent=4))