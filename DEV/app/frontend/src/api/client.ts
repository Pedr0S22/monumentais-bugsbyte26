import { Meal, MealItem, Score, Energy, ChatResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export async function fetchEnergy(): Promise<Energy> {
  const res = await fetch(`${API_BASE}/energy`);
  return handle<Energy>(res);
}

export async function fetchMeals(): Promise<Meal[]> {
  const res = await fetch(`${API_BASE}/meals`);
  return handle<Meal[]>(res);
}

export async function createMeal(meal: { note?: string; items: MealItem[] }): Promise<Meal> {
  const res = await fetch(`${API_BASE}/meals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(meal),
  });
  return handle<Meal>(res);
}

export async function computeScore(payload: {
  carbs: number;
  protein: number;
  fiber: number;
  fats: number;
  sat_fat?: number;
  gi?: number;
  hydration?: number;
}): Promise<Score> {
  const res = await fetch(`${API_BASE}/scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<Score>(res);
}

export async function chat(message: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return handle<ChatResponse>(res);
}
