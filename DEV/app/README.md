# Product Development - LettyQuest

This folder contains the app source for the hackathon build.

Planned structure:
- `backend/` — FastAPI service (Python 3.11+), routers for meals, scores, energy, chat, health; scoring utils; persistence (SQLite local, Postgres optional via Docker); optional chat integration with a local LLM runtime (Ollama / Hugging Face) plus RAG. Start with `uvicorn app.main:app --reload` from the backend directory. Config via `.env` (see `.env.example`).
- `frontend/` — Web-only React + TypeScript (Vite). Screens: dashboard (energy bar + Letty state), meal log (text/photo stub), recent meals, chat panel.
- `docker-compose.yml` (root) will run API + DB; optionally an LLM container (Ollama/HF) and vector store; frontend can run via `npm run dev` or a static build container.

Development notes:
- Keep endpoints and schemas in sync with the contracts in ARCH.
- Scoring logic lives in a small shared module; frontend consumes the API responses, not the raw formulas.
- Aim for hot-reload: bind-mount code in Docker during the hackathon to iterate quickly.
- Current backend endpoints: `/api/v1/health`, `/api/v1/meals` (create/list), `/api/v1/scores` (ad-hoc scoring), `/api/v1/energy` (energy bar snapshot), `/api/v1/chat` (stub wired to local LLM adapter placeholder in `llm.py`).
- Docker: build/run API with `docker compose up --build api` from repo root. SQLite data persists in `DEV/app/backend/data`. A frontend container is available via `docker compose up --build frontend` (served on http://localhost:4173 and wired to the api service).
- Lint/format (backend): `ruff check app` and `black app` (dev deps in `requirements-dev.txt`).
- Frontend: run `npm install` and `npm run dev` inside `frontend/`; copy `.env.example` to `.env` and set `VITE_API_BASE_URL` (defaults to http://localhost:8000/api/v1). Tailwind configured; React Query handles API calls; components are stubbed for energy, meals, chat.