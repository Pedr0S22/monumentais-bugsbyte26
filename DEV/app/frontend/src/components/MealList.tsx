import { useQuery } from "@tanstack/react-query";
import { fetchMeals } from "../api/client";

export function MealList() {
  const { data, isLoading, isError, error } = useQuery({ queryKey: ["meals"], queryFn: fetchMeals });

  if (isLoading) return <div className="text-sm text-white/70">Loading meals…</div>;
  if (isError) return <div className="text-sm text-lettyRed">{(error as Error).message}</div>;
  if (!data || data.length === 0) return <div className="text-sm text-white/60">No meals yet.</div>;

  return (
    <div className="space-y-2">
      {data.map((meal) => (
        <div key={meal.id} className="border border-white/10 rounded-lg p-3 bg-white/5">
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>{new Date(meal.logged_at).toLocaleString()}</span>
            <span className="uppercase text-xs bg-white/10 px-2 py-1 rounded">{meal.source}</span>
          </div>
          {meal.note && <div className="mt-1 text-white">{meal.note}</div>}
          <div className="mt-2 text-sm text-white/70">
            Items: {meal.items.map((i) => i.name).join(", ") || "n/a"}
          </div>
          {meal.score && (
            <div className="mt-2 text-sm text-white/80">
              Score: {meal.score.total_score} (stab {meal.score.stability}, sat {meal.score.satiety}, bal {meal.score.balance})
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
