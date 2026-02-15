"use client"

import { LettyAdvisor, type MascotMood } from "./lettyadvisor"
import { BatteryIndicator } from "./battery-indicator"

interface AppHeaderProps {
  mood: MascotMood
  score: number
  battery: number
}

export function AppHeader({ mood, score, battery }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-6 bg-background">
      <div className="flex items-center gap-3">
        <LettyAdvisor mood={"happy"} size={48} />
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Letty
          </span>
          <span className="text-sm font-black text-primary">{score} XP</span>
        </div>
      </div>
      
      <BatteryIndicator batteryLevel={battery} />
    </header>
  )
}