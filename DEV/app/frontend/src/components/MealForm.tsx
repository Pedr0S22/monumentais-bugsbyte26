import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMeal } from "../api/client";
import type { MealItem } from "../api/types";

const defaultItem: MealItem = {
  name: "Meal",
  quantity: 100,
  unit: "g",
  calories: 0,
  protein: 20,
  carbs: 30,
  fats: 10,
  fiber: 5,
  glycemic_load: 50,
};

export function MealForm() {
  const [note, setNote] = useState("");
  const [item, setItem] = useState<MealItem>(defaultItem);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => createMeal({ note, items: [item] }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meals"] });
      qc.invalidateQueries({ queryKey: ["energy"] });
      setNote("");
    },
  });

  const handleChange = (field: keyof MealItem, value: string) => {
    setItem((prev) => ({ ...prev, [field]: field === "name" || field === "unit" ? value : Number(value) }));
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Log a meal (stub)</h3>
        {mutation.isPending && <span className="text-xs text-white/60">Saving...</span>}
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        <label className="text-sm text-white/80 space-y-1">
          Name
          <input
            className="w-full rounded bg-white/10 px-3 py-2 text-white"
            value={item.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </label>
        <label className="text-sm text-white/80 space-y-1">
          Protein (g)
          <input
            type="number"
            className="w-full rounded bg-white/10 px-3 py-2 text-white"
            value={item.protein}
            onChange={(e) => handleChange("protein", e.target.value)}
          />
        </label>
        <label className="text-sm text-white/80 space-y-1">
          Carbs (g)
          <input
            type="number"
            className="w-full rounded bg-white/10 px-3 py-2 text-white"
            value={item.carbs}
            onChange={(e) => handleChange("carbs", e.target.value)}
          />
        </label>
        <label className="text-sm text-white/80 space-y-1">
          Fats (g)
          <input
            type="number"
            className="w-full rounded bg-white/10 px-3 py-2 text-white"
            value={item.fats}
            onChange={(e) => handleChange("fats", e.target.value)}
          />
        </label>
        <label className="text-sm text-white/80 space-y-1">
          Fiber (g)
          <input
            type="number"
            className="w-full rounded bg-white/10 px-3 py-2 text-white"
            value={item.fiber}
            onChange={(e) => handleChange("fiber", e.target.value)}
          />
        </label>
        <label className="text-sm text-white/80 space-y-1">
          GI (0-100)
          <input
            type="number"
            className="w-full rounded bg-white/10 px-3 py-2 text-white"
            value={item.glycemic_load}
            onChange={(e) => handleChange("glycemic_load", e.target.value)}
          />
        </label>
      </div>
      <label className="text-sm text-white/80 space-y-1 block">
        Note
        <textarea
          className="w-full rounded bg-white/10 px-3 py-2 text-white"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g., chicken + rice + veggies"
        />
      </label>
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="px-4 py-2 rounded bg-lettyGreen text-slate-900 font-semibold hover:brightness-110 disabled:opacity-60"
      >
        Save meal
      </button>
      {mutation.isError && (
        <div className="text-sm text-lettyRed">{(mutation.error as Error).message || "Error saving"}</div>
      )}
      {mutation.isSuccess && <div className="text-sm text-lettyGreen">Saved! Energy updated.</div>}
    </div>
  );
}
