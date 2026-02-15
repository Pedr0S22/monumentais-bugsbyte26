"use client"

interface StatusBarProps {
  score: number
}

export function StatusBar({ score }: StatusBarProps) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-secondary px-3 py-1.5 shadow-sm">
      <span className="text-sm font-semibold text-card-foreground">{score}</span>
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent">
        <div className="h-4 w-4 rounded-full bg-accent-foreground/30" />
      </div>
    </div>
  )
}
