"use client"

import { LettyAdvisor, type MascotMood } from "../lettyadvisor"

// Updated to include the 'mood' property coming from the backend
interface Meal {
  meal: string
  nutrition_values: {
    energy: number
    protein: number
    saturated_fat?: number
    hydration?: number
    fiber?: number
  }
  mood?: string // <-- Added this
  timestamp: string
}

interface HomeScreenProps {
  userData: {
    name: string
    username: string
    membership: string
  }
  meals?: Meal[] 
}

export function HomeScreen({ userData, meals = [] }: HomeScreenProps) {
  
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

      {/* Histórico de Refeições (Last 3) */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Últimas Refeições</h3>
        
        {meals.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400">Nenhuma refeição registada hoje.</p>
          </div>
        ) : (
          meals.slice(0, 3).map((item, index) => {
            // Safely grab the backend mood (e.g. "Meh" -> "meh"). Fallback to "meh" if it's missing.
            const rawMood = item.mood?.toLowerCase() || "meh"
            const mood = (["happy", "sad", "meh"].includes(rawMood) ? rawMood : "meh") as MascotMood

            return (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-3xl bg-white p-4 shadow-sm border border-slate-100 gap-3">
                <div className="flex flex-col gap-1 w-full overflow-hidden">
                  <span className="text-sm font-bold text-slate-800 truncate" title={item.meal}>
                    {item.meal}
                  </span>
                  
                  {/* Shows Energy and Protein */}
                  <div className="flex flex-wrap gap-4 mt-1">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-slate-400 uppercase">Energia</span>
                      <span className="text-xs font-semibold text-orange-500">
                        {item.nutrition_values?.energy || 0} kcal
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] text-slate-400 uppercase">Proteína</span>
                      <span className="text-xs font-semibold text-emerald-600">
                        {item.nutrition_values?.protein || 0}g
                      </span>
                    </div>
                  </div>
                </div>

                {/* Letty Icon uses the Backend Mood now */}
                <div className="flex items-center justify-center bg-slate-50 rounded-2xl p-2 shrink-0 self-end sm:self-auto">
                  <LettyAdvisor mood={mood} size={40} />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Line chart de progresso */}
      <div className="rounded-3xl bg-white p-4 shadow-sm border border-slate-100 mt-2">
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