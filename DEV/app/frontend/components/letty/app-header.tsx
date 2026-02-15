"use client"

import { Mascot, type MascotMood } from "./mascot"
import { BatteryIndicator } from "./battery-indicator"

interface AppHeaderProps {
  mood?: MascotMood
  score: number
  userName?: string
}

export function AppHeader({ mood = "happy", score, userName }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between bg-background px-3 py-2">
      <div className="flex items-center gap-2">
        <Mascot mood={mood} size={40} />
        {userName && (
          <span className="text-sm font-semibold text-foreground">{userName}</span>
        )}
      </div>
      <BatteryIndicator score={score} />
    </header>
  )
}
