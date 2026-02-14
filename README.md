# LettyQuest - BugsByte Hackathon 2026

LettyQuest is a gamified nutrition companion built for the BugsByte 2026 hackathon. Users log meals (text or photo), Letty the lettuce reacts with moods (happy/neutral/wilted), and a human energy bar predicts focus vs crash based on glycemic impact and satiety. The goal is to make meal logging fun, fast, and sticky—"Duolingo for diet adherence."

## Introduction

Problem: people at a desk all day suffer energy crashes and drop traditional food logs. Solution: Letty turns nutrition into a game with points, streaks, and friendly nudges, plus an energy forecast driven by simple nutrition signals (GI/GL, protein, fiber, hydration).

## Architecture

- Backend: FastAPI (Python) with scoring utilities and lightweight persistence (SQLite for local; Postgres optional via Docker).
- Frontend: Web-only — React + TypeScript (Vite) with Tailwind for rapid styling. Letty states and energy bar visualize scores; meal log and chat panels drive interactions. Designs come from Figma, implemented via Builder.io (no direct export).
- Optional: RAG chatbot over curated nutrition guidelines backed by a local LLM runtime (Ollama / Hugging Face); vector store (pgvector) if time allows.
- See [ARCH/README.md](ARCH/README.md) for deeper system notes and diagrams.
- Backend source is under DEV/app/backend.
- DevOps: docker-compose at repo root runs the API with SQLite persistence and a frontend (served on http://localhost:4173, pointed at the api service).
- Frontend scaffold lives under DEV/app/frontend (React + Vite + Tailwind).
- Consolidated Python requirements in [requirements.txt](requirements.txt); backend-specific files remain under DEV/app/backend.

## Functionalities

- Meal logging (text entry; photo stub/flow) that returns a meal quality score and updates Letty’s mood.
- Human energy bar with decay over time, boosted by recent balanced meals; crash warnings for high GI loads.
- Points, streaks, and objectives tied to meal quality and consistency.
- Notifications: friendly nudges from Letty (web push/ in-app) about current energy state and when to eat to avoid a crash.
- Chatbot (local LLM + RAG) for safe, guided tips; no medical diagnoses.
- Biometrics input (weight, activity level, schedule) to personalize scoring and reminders.

## Requirements

- Python 3.11+ (FastAPI, Pydantic, Uvicorn)
- Node.js 20+ with npm or pnpm (React, Vite, TypeScript)
- Docker and Docker Compose (optional) for local, single-machine deployment
- Optional local LLM runtime: Ollama or a lightweight Hugging Face model for the chatbot

## Execution Instructions

Prerequisites
- Docker and Docker Compose
- Open ports: 8000 (API), 4173 (Frontend)

Steps
1) First time or after code changes: `docker compose up --build -d`
2) Subsequent runs (no rebuild needed): `docker compose up -d`
2) Access:
   - API docs: http://localhost:8000/docs
   - Health: http://localhost:8000/api/v1/health
   - Frontend: http://localhost:4173
3) Stop: `docker compose down`
4) Clear volumes (remove SQLite DB): `docker compose down -v`

Useful commands
- API logs: `docker compose logs -f api`
- Frontend logs: `docker compose logs -f frontend`

Until code is committed, this repo holds the blueprint; check [DEV/app/README.md](DEV/app/README.md) for implementation details as they land.

## Further Information

- Team profiles and contacts live under [PM/profiles](PM/profiles).
- For design references, see the Figma link (once added) and product notes in [PROD](PROD).

## Authors

Team BugsByte 2026 — see individual profiles in [PM/profiles](PM/profiles).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.