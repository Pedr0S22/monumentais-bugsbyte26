export type MealItem = {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  glycemic_load: number;
};

export type Score = {
  stability: number;
  satiety: number;
  balance: number;
  total_score: number;
  computed_at: string;
};

export type Meal = {
  id: number;
  user_id?: string | null;
  source: string;
  note?: string | null;
  logged_at: string;
  items: MealItem[];
  score?: Score | null;
};

export type Energy = {
  energy_percent: number;
  crash_risk: boolean;
  last_meal_at?: string | null;
};

export type ChatResponse = {
  reply: string;
  source: string;
};

export type Health = {
  status: string;
  timestamp: string;
};
