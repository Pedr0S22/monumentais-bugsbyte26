import clsx from "clsx";
import { ENERGY_BANDS } from "../constants/letty";

type Band = (typeof ENERGY_BANDS)[keyof typeof ENERGY_BANDS];

function pickBand(percent: number): Band {
  if (percent >= ENERGY_BANDS.HAPPY.min) return ENERGY_BANDS.HAPPY;
  if (percent >= ENERGY_BANDS.NEUTRAL.min) return ENERGY_BANDS.NEUTRAL;
  return ENERGY_BANDS.SAD;
}

export function EnergyBar({ percent, crash }: { percent: number; crash: boolean }) {
  const band = pickBand(percent);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-white/70">
        <span>Energy bar</span>
        <span className="flex items-center gap-2">
          <span>{band.emoji}</span>
          <span>{crash ? "Crash risk" : "Stable"}</span>
        </span>
      </div>
      <div className="h-4 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className={clsx("h-full transition-all duration-500", band.color)}
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
      <div className="text-sm text-white/80">{percent.toFixed(1)}% • {band.message}</div>
    </div>
  );
}
