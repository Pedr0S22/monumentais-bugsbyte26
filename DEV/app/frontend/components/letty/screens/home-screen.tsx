"use client"

import { LettyAdvisor, type MascotMood } from "../lettyadvisor"

interface Meal {
  id: string
  name: string
  protein: number
  saturated_fat: number
  hydration: number
  timestamp: string
}

interface HomeScreenProps {
  userData: {
    name: string
    username: string
    membership: string
  }
  meals?: Meal[] // Adicionamos a lista de refeições
}

export function HomeScreen({ userData, meals = [] }: HomeScreenProps) {
  
  // Função para determinar o humor da Letty baseado na saúde da refeição
  const getMealMood = (meal: Meal): MascotMood => {
    if (meal.saturated_fat > 10) return "sad";
    if (meal.protein > 15 && meal.hydration > 50) return "happy";
    return "meh";
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6 bg-slate-50">
      {/* Profile card */}
      <div className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm border border-slate-100 mt-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
          <span className="text-lg font-bold text-primary">
            {userData.name.charAt(0)}
          </span>
        </div>
        <div className="flex flex-1 flex-col">
          <span className="text-sm font-bold text-slate-800">{userData.name}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">{userData.membership}</span>
        </div>
      </div>

      {/* Histórico de Refeições */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Histórico de Refeições</h3>
        
        {meals.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400">Nenhuma refeição registada hoje.</p>
          </div>
        ) : (
          meals.map((meal) => {
            const mood = getMealMood(meal);
            return (
              <div key={meal.id} className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-sm border border-slate-100">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-slate-800">{meal.name}</span>
                  <div className="flex gap-2">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-slate-400 uppercase">Proteína</span>
                      <span className="text-xs font-semibold text-emerald-600">{meal.protein}g</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] text-slate-400 uppercase">Gord. Sat.</span>
                      <span className="text-xs font-semibold text-rose-500">{meal.saturated_fat}g</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] text-slate-400 uppercase">Hidra.</span>
                      <span className="text-xs font-semibold text-blue-500">{meal.hydration}%</span>
                    </div>
                  </div>
                </div>

                {/* Letty Icon por Mood */}
                <div className="flex items-center justify-center bg-slate-50 rounded-2xl p-2">
                  <LettyAdvisor mood={mood} size={40} />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Line chart de progresso */}
      <div className="rounded-3xl bg-white p-4 shadow-sm border border-slate-100">
        <h3 className="mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resumo de Progresso</h3>
        <svg viewBox="0 0 200 60" className="w-full h-20" aria-label="Progress chart">
          <polyline
            points="0,50 30,35 60,40 90,20 120,25 150,10 180,15 200,5"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}