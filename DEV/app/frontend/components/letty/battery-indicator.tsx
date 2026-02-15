"use client"

interface BatteryIndicatorProps {
  score: number
  maxScore?: number
}

export function BatteryIndicator({ score, maxScore = 2000 }: BatteryIndicatorProps) {
  const percentage = Math.round(Math.min((score / maxScore) * 100, 100))

  return (
    <div className="flex items-center gap-2">
      {/* Percentagem em destaque ao lado */}
      <span className="text-sm font-black text-foreground tabular-nums">
        {percentage}%
      </span>

      {/* Ícone de Bateria */}
      <div className="relative flex items-center">
        <div className="h-5 w-10 rounded-[4px] border-[1.5px] border-foreground/80 p-[1.5px]">
          {/* Nível da Bateria */}
          <div
            className={`h-full rounded-[1px] transition-all duration-500 ${
              percentage > 20 ? "bg-primary" : "bg-red-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Pólo positivo da bateria (o "pipoco") */}
        <div className="h-2 w-[2px] rounded-r-full bg-foreground/80 ml-[1px]" />
      </div>
    </div>
  )
}