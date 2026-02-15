# LettyQuest - BugsByte Hackathon 2026

LettyQuest is a gamified nutrition companion built for the BugsByte 2026 hackathon. It turns meal logging into a game where you keep "Letty"—your lettuce mascot—alive and happy.

Instead of calorie counting, LettyQuest focuses on your **Human Energy Battery**, predicting focus vs. crashes based on calorie, satiety, and hydration.

## 🥬 Introduction

**The Problem:** Many people who want to take on the challange of following a diet suffer from energy crashes and abandon traditional, boring food logs based apps and platforms.
**The Solution:** A "Duolingo for diet adherence." Letty reacts to your choices (Happy/Neutral/Wilted), and the app provides an energy forecast driven by nutrition signals (Saturated fats, protein, fiber, hydration and kcal ).

## 🏗️ Tech Stack

### Frontend (Next.js)
* **Framework:** Next.js 16 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS 4 + Shadcn/UI
* **UI Components:**
    * **Primitives:** Radix UI (Dialog, Dropdown, Accordion, etc.)
    * **Icons:** Lucide React
    * **Drawer:** Vaul
    * **Carousel:** Embla Carousel
    * **Toasts:** Sonner
* **Visualization:** Recharts (for Energy Graph)
* **Forms & Validation:** React Hook Form + Zod
* **Theming:** Next-themes (Dark/Light mode)
* **Date Handling:** Date-fns

### Backend
* **Framework:** FastAPI (Python 3.11+)
* **Database:** SQLite (Relational data) + ChromaDB (Vector store for RAG)
* **AI:** RAG pipeline for nutrition advice (supports local LLMs like Qwen)

### DevOps
* **Containerization:** Docker & Docker Compose
* **Hot Reloading:** Enabled for both Frontend (Next.js Turbo) and Backend

## 🧠 AI & Game Logic

The application processes data through three distinct "nodes" to ensure accurate and gamified feedback:

### 1. The Vision Node (LLM)
We use **Qwen 2.5-VL-7B-Instruct** (via Hugging Face Inference) to "see" your food.
* **Input:** User photo or text description.
* **Task:** Identifies ingredients and estimates nutritional metrics (Protein, Fiber, Hydration, Saturated Fat, Kcal).
* **Output:** Returns raw JSON data to our game engine.

### 2. The Scoring Node (Deterministic Engine)
To prevent AI hallucinations in game mechanics, we use a deterministic scoring algorithm ("The Nuno Score") which we obtained by contacting a SME(subject matter expert) based on nutritional density.

* **Satiety Index Formula:**
    ```python
    ((Protein * 2.0) + (Fiber * 5.0) + (Water_ml * 0.2) - (SatFat * 2.0)) / Kcal
    ```
* **Adaptive Goals:**
    * **Weight Loss ("The Volume Game"):** Rewards high satiety (>15) and low calorie density.
    * **Weight Gain ("The Density Game"):** Rewards high protein (>30g) and calorie density (>500kcal) while penalizing "dirty bulk" fats.
    * **Maintenance ("Balance"):** Rewards stability and moderate portions (400-800kcal).

## ✨ Features

* **Meal Logging:** Log meals via text or camera to update Letty’s mood.
* **Energy Bar:** A dynamic "Human Battery" that decays over time and recharges based on the quality of your meals.
* **Letty Mascot:** * 🟢 **Happy:** High energy, balanced meals.
    * 🟡 **Neutral:** Average energy.
    * 🥀 **Wilted:** Energy crash or skipped meals.
* **Smart Advice (RAG):** Chat with Letty to get nutrition tips based on curated guidelines, not hallucinations.
* **Shop & Customization:** Earn currency to customize Letty (WIP).

## 📂 Project Structure

```text
.
├── DEV
│   ├── app
│   │   ├── backend    # FastAPI application, logic, and DB
│   │   └── frontend   # Next.js application (Pages, Components)
├── PM                 # Project Management & Profiles
├── ARCH               # Architecture diagrams and deep dives
├── docker-compose.yml # Orchestration for local dev
└── README.md          # You are here
## 🚀 Getting Started

### Prerequisites
* **Docker Desktop** (installed and running)
* **Git**

### Installation & Running
The entire application (Frontend + API + Database) is containerized. You do not need to install Python or Node.js locally to run it.

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd monumentais-bugsbyte26
    ```

2.  **Start the application**
    ```bash
    # Build and start services in detached mode
    docker compose up --build -d
    ```

3.  **Access the App**
    * **Frontend:** [http://localhost:3000](http://localhost:3000)
    * **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

4.  **Stopping the App**
    ```bash
    docker compose down
    ```

### Development Commands
* **View Logs:** `docker compose logs -f` (Follows logs for both services)
* **Rebuild specific service:** `docker compose up -d --build --no-deps frontend`
* **Reset Database:**
    ```bash
    docker compose down -v
    # Then delete the local SQLite file if it persists:
    # rm DEV/app/backend/data/app.sqlite3
    ```



