# Frontend - LettyQuest

Stack: React + TypeScript + Vite + Tailwind, React Query for data, Zustand reserved for local state if needed. Shared Letty energy bands/copy in `src/constants/letty.ts`.

## Getting started
- Install: `npm install`
- Env: copy `.env.example` to `.env` and set `VITE_API_BASE_URL` (default: http://localhost:8000/api/v1)
- Run dev server: `npm run dev`
- Build: `npm run build`

## Structure
- `src/api/` — API client and types
- `src/components/` — layout shell, energy bar, meal form stub, meal list, chat panel
- `src/App.tsx` — page composition
- Styling: Tailwind (configured in `tailwind.config.cjs`), base styles in `src/index.css`

## Notes
- Chat is stubbed; wire to local LLM adapter when available.
- Meal form posts a single item; adjust fields as needed when integrating CV/photo flow.
- Energy auto-refreshes every 60s.
