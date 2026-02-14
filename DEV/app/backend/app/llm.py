from .config import get_settings

SYSTEM_PROMPT = (
    "You are Letty, a friendly lettuce mascot."
    " Be concise, encouraging, and avoid medical diagnoses or prescriptive treatment."
    " Suggest balanced meals (protein + fiber + healthy fats) and hydration."
    " Remind users to consult professionals for medical concerns."
)


def generate_reply(message: str) -> str:
    # Placeholder for a local LLM adapter (e.g., Ollama/HF). In production, call the model here.
    settings = get_settings()
    _ = settings.llm_model  # reserved for future adapter use
    return f"Letty here! I got your message: '{message}'. Try adding protein and fiber to keep energy steady."
