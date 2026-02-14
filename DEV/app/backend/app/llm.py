import base64
import json
import re
import os
from huggingface_hub import InferenceClient
from .config import get_settings
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

    # 2. Configurar o Prompt
    input_desc = f"User description: {user_text}" if user_text else "Analyze the provided image."
    
    prompt = f"""
    Act as Letty, a witty and supportive nutrition coach.
    
    CRITICAL RULE: If the user provides an image or text that is NOT related to food, you MUST return:
    {{ "error": "The provided input is not a meal.", "status_code": 400 }}

    USER PROFILE:
    - Goal: {user_profile['goal']}
    - Diet: {user_profile['diet_type']}
    - Status: {user_profile['progress_status']}

    TASK:
    1. Identify ingredients. 2. Estimate Metrics. 3. Game Logic (Energy Boost 0-50, Burn Rate 2-20). 
    4. Letty Tip (max 15 words).

    RETURN ONLY JSON:
    {{
    "meal_name": "string",
    "nutritional_metrics": {{ "protein_grams": int, "fiber_grams": int, "hydration_ml": int, "saturated_fat_grams": int, "energy_kcal": int }},
    "game_logic": {{ "energy_boost": int, "burn_rate_per_hour": int, "estimated_focus_time_hours": float }},
    "letty_feedback": {{ "mood": "Happy | Meh | Sad", "tip": "string" }}
    }}
    """
    
    content_list.insert(0, {"type": "text", "text": prompt})

    try:
        response = client.chat_completion(messages=[{"role": "user", "content": content_list}], max_tokens=900)
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
    settings = get_settings()
    _ = settings.llm_model  # reserved for future actual LLM model loading
    
    # 1. Generate the exact prompt
    prompt = build_nutritionist_prompt(profile_id, message, rag_advice)
    
    # 2. [FUTURE] Call your actual LLM here (e.g., passing 'prompt' to an Ollama or OpenAI client)
    # For now, we mock the execution:
    
    mock_llm_execution = (
        f"As a professional nutritionist, looking at Profile ID {profile_id} "
        f"and the question '{message}', here is your concise advice."
    )
    
    return mock_llm_execution

# --- HACKATHON DEMO ---
if __name__ == "__main__":
    test_user = {
        "name": "Francisca",
        "goal": "Weight loss and sustainable calorie deficit",
        "diet_type": "Omnivore / Balanced",
        "progress_status": "Emotional rollercoaster (inconsistent tracking this week)"
    }
    img_path = "/Users/francisca_mateus/Downloads/transferir.jpeg"
    output_dir = "DEV/app/backend/app/llm_output"
    print("🥬 Letty is calculating your energy boost and burn rate...")
    result = letty_nutrition_evaluator(test_user, image_path=img_path, user_text="This is my meal for today i ialso had a soup.")
    save_llm_output(result, output_dir)
    print(json.dumps(result, indent=4))