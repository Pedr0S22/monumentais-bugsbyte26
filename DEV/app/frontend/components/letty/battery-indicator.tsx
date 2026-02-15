"use client"

import { useEffect, useState } from "react"
import { batteryApi } from "@/lib/api"
import { DEFAULT_PROFILE_ID, POLL_INTERVALS } from "@/lib/constants"

interface BatteryIndicatorProps {
  profileId?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

export function BatteryIndicator({ 
  profileId = DEFAULT_PROFILE_ID,
  autoRefresh = true,
  refreshInterval = POLL_INTERVALS.BATTERY
}: BatteryIndicatorProps) {
  const [batteryLevel, setBatteryLevel] = useState<number>(50)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBattery() {
      try {
        setError(null)
        const data = await batteryApi.getLast(profileId)
        setBatteryLevel(data.battery_level)
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching battery:", err)
        setError("Failed to load battery")
        setIsLoading(false)
      }
    }

    fetchBattery()

    if (autoRefresh) {
      const interval = setInterval(fetchBattery, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [profileId, autoRefresh, refreshInterval])

  // Show error state only on first load
  if (isLoading && error === null) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-black text-foreground/50 tabular-nums">---%</span>
        <div className="relative flex items-center">
          <div className="h-5 w-10 rounded-[4px] border-[1.5px] border-foreground/30 p-[1.5px]">
            <div className="h-full w-0 rounded-[1px] bg-foreground/20" />
          </div>
          <div className="h-2 w-[2px] rounded-r-full bg-foreground/30 ml-[1px]" />
        </div>
      </div>
    )
  }

  // If error but we have a cached battery level, show it (graceful degradation)
  // Otherwise show the current battery level
  return (
    <div className="flex items-center gap-2">
      {/* Percentagem em destaque ao lado */}
      <span className="text-sm font-black text-foreground tabular-nums">
        {batteryLevel}%
      </span>

      {/* Ícone de Bateria */}
      <div className="relative flex items-center">
        <div className="h-5 w-10 rounded-[4px] border-[1.5px] border-foreground/80 p-[1.5px]">
          {/* Nível da Bateria */}
          <div
            className={`h-full rounded-[1px] transition-all duration-500 ${
              batteryLevel > 20 ? "bg-primary" : "bg-red-500"
            }`}
            style={{ width: `${batteryLevel}%` }}
          />
        </div>
        
        {/* Pólo positivo da bateria (o "pipoco") */}
        <div className="h-2 w-[2px] rounded-r-full bg-foreground/80 ml-[1px]" />
      </div>
    </div>
  )
}