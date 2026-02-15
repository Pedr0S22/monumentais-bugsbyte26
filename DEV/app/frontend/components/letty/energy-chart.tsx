"use client"

import { useEffect, useState } from "react"
import { batteryApi } from "@/lib/api"
import { Zap, TrendingUp, TrendingDown } from "lucide-react"

interface BatteryHistoryItem {
  battery_level: number
  logged_at: string
  focus_time: number
  burn_rate_per_hour: number
}

interface EnergyChartProps {
  profileId: number
  currentBatteryLevel?: number // Pass from parent to ensure sync
}

export function EnergyChart({ profileId, currentBatteryLevel }: EnergyChartProps) {
  const [history, setHistory] = useState<BatteryHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable")
  const [latestBattery, setLatestBattery] = useState<number>(currentBatteryLevel || 50)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await batteryApi.getHistory(profileId)
        // Also fetch latest to ensure sync
        const latest = await batteryApi.getLast(profileId)
        setLatestBattery(latest.battery_level)
        
        // Sort by time ascending for chart
        const sorted = [...data.history].reverse()
        setHistory(sorted)
        
        // Calculate trend
        if (sorted.length >= 2) {
          const first = sorted[0].battery_level
          const last = sorted[sorted.length - 1].battery_level
          const diff = last - first
          setTrend(diff > 5 ? "up" : diff < -5 ? "down" : "stable")
        }
      } catch (error) {
        console.error("Error fetching energy history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
    
    // Auto-refresh every 10 seconds to match battery indicator
    const interval = setInterval(fetchHistory, 10000)
    return () => clearInterval(interval)
  }, [profileId])

  if (isLoading) {
    return (
      <div className="rounded-3xl bg-white p-4 shadow-sm border border-slate-100 mt-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Energia 24h
          </h3>
          <div className="w-16 h-3 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="w-full h-20 bg-slate-100 rounded animate-pulse" />
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-4 shadow-sm border border-slate-100 mt-2">
        <h3 className="mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Energia 24h
        </h3>
        <div className="flex flex-col items-center justify-center h-20 text-slate-400">
          <Zap size={24} className="mb-2 opacity-30" />
          <p className="text-xs">Regista a primeira refeição para ver o gráfico</p>
        </div>
      </div>
    )
  }

  // Generate SVG points from history data
  const width = 200
  const height = 60
  const padding = 5
  
  const points = history.map((item, index) => {
    const x = (index / (history.length - 1 || 1)) * (width - padding * 2) + padding
    const y = height - (item.battery_level / 100) * (height - padding * 2) - padding
    return `${x},${y}`
  }).join(" ")

  // Identify peaks (energy boosts from meals)
  const peaks = history.map((item, index) => {
    if (index === 0) return null
    const prevLevel = history[index - 1].battery_level
    const boost = item.battery_level - prevLevel
    
    // If boost is positive and significant (>10), mark as meal
    if (boost > 10) {
      const x = (index / (history.length - 1)) * (width - padding * 2) + padding
      const y = height - (item.battery_level / 100) * (height - padding * 2) - padding
      return { x, y, boost }
    }
    return null
  }).filter(Boolean)

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm border border-slate-100 mt-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Energia 24h
        </h3>
        <div className="flex items-center gap-1">
          {trend === "up" && (
            <>
              <TrendingUp size={14} className="text-green-500" />
              <span className="text-[10px] font-bold text-green-500">↑</span>
            </>
          )}
          {trend === "down" && (
            <>
              <TrendingDown size={14} className="text-red-500" />
              <span className="text-[10px] font-bold text-red-500">↓</span>
            </>
          )}
          {trend === "stable" && (
            <span className="text-[10px] font-bold text-slate-400">—</span>
          )}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20" aria-label="Energy chart over 24h">
        {/* Grid lines */}
        <line x1={padding} y1={height / 4} x2={width - padding} y2={height / 4} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1={padding} y1={(height * 3) / 4} x2={width - padding} y2={(height * 3) / 4} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2,2" />
        
        {/* Gradient fill under the line */}
        <defs>
          <linearGradient id="energyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Fill area */}
        <polygon
          points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
          fill="url(#energyGradient)"
        />
        
        {/* Main energy line */}
        <polyline
          points={points}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Meal indicators (peaks) */}
        {peaks.map((peak: any, index: number) => (
          <g key={index}>
            <circle
              cx={peak.x}
              cy={peak.y}
              r="3"
              fill="hsl(var(--primary))"
              stroke="white"
              strokeWidth="1.5"
            />
            {/* Upward arrow for meal boost */}
            <path
              d={`M ${peak.x - 2} ${peak.y - 8} L ${peak.x} ${peak.y - 11} L ${peak.x + 2} ${peak.y - 8}`}
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        ))}
        
        {/* Current level indicator (last point) */}
        {history.length > 0 && (
          <circle
            cx={(width - padding * 2) + padding}
            cy={height - (history[history.length - 1].battery_level / 100) * (height - padding * 2) - padding}
            r="4"
            fill="hsl(var(--primary))"
            stroke="white"
            strokeWidth="2"
          >
            <animate
              attributeName="r"
              values="4;6;4"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        )}
      </svg>

      {/* Stats footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <div className="flex flex-col">
          <span className="text-[8px] text-slate-400 uppercase">Nível Atual</span>
          <span className="text-sm font-bold text-slate-800">
            {latestBattery}%
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] text-slate-400 uppercase">Foco Estimado</span>
          <span className="text-sm font-bold text-emerald-600">
            {history[history.length - 1]?.focus_time?.toFixed(1) || 0}h
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] text-slate-400 uppercase">Refeições</span>
          <span className="text-sm font-bold text-primary">
            {peaks.length}
          </span>
        </div>
      </div>
    </div>
  )
}
