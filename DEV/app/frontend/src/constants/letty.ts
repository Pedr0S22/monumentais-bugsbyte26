export const ENERGY_BANDS = {
  HAPPY: { min: 80, label: "happy", emoji: "😊", color: "bg-lettyGreen", message: "Full focus for a few hours." },
  NEUTRAL: { min: 40, label: "neutral", emoji: "😐", color: "bg-lettyYellow", message: "Okay—top up with protein/fiber soon." },
  SAD: { min: 0, label: "sad", emoji: "😢", color: "bg-lettyRed", message: "Crash risk—eat something balanced now." },
} as const;

export type Mood = typeof ENERGY_BANDS[keyof typeof ENERGY_BANDS]["label"];
