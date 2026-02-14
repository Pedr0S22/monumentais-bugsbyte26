# LettyQuest Project Context

LettyQuest is a hackathon build (BugsByte 2026) aimed at gamifying nutrition for desk workers/students. The user keeps Letty, a lettuce mascot, energized by logging balanced meals. The app calculates an energy score based on glycemic impact, satiety, and hydration, drives a human energy bar with Letty moods (happy/neutral/wilted), and nudges users via friendly notifications and a RAG-powered chatbot.

## Project Details
- Project name: LettyQuest – Your Human Battery, Gamified
- Problem: desk-bound people suffer energy crashes and drop boring food logs.
- Solution: Letty the lettuce mascot, energy bar predictions (GI, satiety, hydration, biometrics), points/streaks, friendly notifications. Input via text or photo; energy and meal quality scoring; chatbot/RAG tips.
- Impact: turns meal logging into "keeping Letty alive" to boost retention.

## AI / Feature Notes
- Computer vision identifies foods/macros from photos, rule-based + LLM scoring converts to energy score, RAG chatbot uses curated nutrition guidelines.
- Key features: Letty moods (happy green, neutral yellow, wilted), energy bar %, text/photo input, points/levels, biometrics (weight/activity/schedule), Letty chatbot.
- Additional context: friendly notifications; recommendations to eat what's charging, avoid what's draining; notifications mention personalized biometrics.
- Advice from Ram: do not train LLM from scratch; build RAG over nutrition docs.

## Gameplay Loop
- Energy band formula: `Energy Score = (Stability*0.6)+(Satiety*0.3)+(Balance*0.1)`; score per meal 0–100; combine last 2–3 meals + decay.
- GI stability, satiety (protein *4 + fiber *6 + hydration *2 - sat fat*2), nutrient balance heuristics.
- Typical GI values: refined sugar/bread 70–100, fruit/veggies 30–50, pure protein ~0.
- Energy decay: start 100% at 8h, -3%/hour, meals add `score * mealFactor` (lunch+0.3, snack+0.2). Example timeline provided in notes.
- Visuals: color-coded energy states with emoji messages; small meals or long fasting adjust score; hydration adds +5–10%; personalized weighting for carb sensitivity.

## Stack
- Backend: FastAPI (Python 3.11) with SQLite (local) or Postgres (Docker). Includes endpoints for meals, scoring, energy, chat, and health plus scoring utilities and a local LLM adapter stub.
- Frontend: React + TypeScript + Vite + Tailwind, using React Query for data and Zustand reserved for state. Designer will deliver Figma; Builder.io is the planned bridge for importing screens.
- Chatbot/LLM: Local runtimes (Ollama or Hugging Face) targeted via `LLM_MODEL`, with guardrails enforced in `app/llm.py` and ARCH docs.
- DevOps: Docker compose runs backend + frontend, root requirements file, lint/format via Ruff/Black, logs viewable via `docker compose logs`.

## Key Features
- Meal logging (text/photo stub) produces a Letty mood update and energy score.
- Human energy bar tracks decay over time with crash/warning thresholds; notifies the user when to eat or hydrate.
- Points and streaks keep consistency. Biometrics/reminders personalize the experience.
- Chatbot uses RAG over curated nutrition docs, responds in-game style, and defers to professionals.

## Immediate Tasks
- Build out Docker experience and scripts (`docker compose up --build -d`, `down -v`).
- Flesh out frontend components (energy bar, meal list, chat). Align with upcoming design.
- Connect chat endpoint to local LLM/RAG, document prompts. Seed demo data for the UI.
- Keep docs (README, ARCH, DEV/app README, TODO) synchronized with the evolving stack.
