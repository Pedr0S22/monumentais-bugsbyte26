# Design

- [ ] Familiarize designer with Letty energy band rules (happy/neutral/wilted) and notification tone.
- [ ] Finalize LettyQuest design system in Figma and export tokens/components.
- [ ] Implement Figma/Builder.io assets in React + Tailwind layout (energy bar, notifications, chat frames).
- [ ] Document Letty transitions/animations for Dev (energy pulsing, notification badges).

# Development

- [ ] Set up FastAPI backend with defined endpoints and scoring logic (meals, scores, energy, chat, health).
- [ ] Add biometrics + reminders persistence; document schema + API in ARCH/README.
- [ ] Connect chat endpoint to local LLM adapter stub; note guardrail prompt (LLM_MODEL env + RAG context).
- [ ] Build React + Vite + Tailwind scaffold (layout, nav, energy section, meal log, chat panel).
- [ ] Integrate React Query hooks with API client; propagate Letty energy constants, copy, notifications.
- [ ] Add Letty notifications to frontend: energy decay warnings, hydration prompts, streak milestones.
- [ ] Containerize frontend + backend; keep docker-compose docs and health checks aligned.

# LLM / Data & CV

- [ ] Choose local LLM runtime (Ollama/Hugging Face) and pin model via `LLM_MODEL` env.
- [ ] Prepare nutrition guideline docs and CV macros mapping for RAG retrieval.
- [ ] Draft safe-system prompt and response filters for Letty chatbot; reference them in ARCH/README.
- [ ] Plan fallback messaging when the local LLM is unavailable (friendly Letty stub).
- [ ] Translate energy formula (stability, satiety, balance) into backend scoring + frontend constants.

# Testing / QA

- [ ] Script Docker quick start (`docker compose up --build -d` for first run, `docker compose up -d` for repeats).
- [ ] Seed SQLite with sample meals/biometrics for frontend demos (store under `DEV/app/backend/data`).
- [ ] Run backend lint/format (ruff/black) and ensure root `requirements.txt` matches dependencies.
- [ ] Smoke-test API docs + frontend UI via Docker (verify endpoints, Letty energy bar, notification copy, chat stub).
- [ ] Capture energy bar timeline samples (breakfast + lunch + snack) to validate formula/UX.