/**
 * Application constants
 */

// Default user profile ID (should come from auth in production)
export const DEFAULT_PROFILE_ID = 
  typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEFAULT_PROFILE_ID
    ? parseInt(process.env.NEXT_PUBLIC_DEFAULT_PROFILE_ID, 10)
    : 1

// Letty mood thresholds
export const BATTERY_THRESHOLDS = {
  HAPPY: 60,    // >= 60% = happy
  MEH: 30,      // >= 30% and < 60% = meh
  SAD: 0,       // < 30% = sad/wilted
} as const

// Letty moods
export type LettyMood = 'happy' | 'meh' | 'sad'

/**
 * Get Letty's mood based on battery level
 */
export function getLettyMood(batteryLevel: number): LettyMood {
  if (batteryLevel >= BATTERY_THRESHOLDS.HAPPY) return 'happy'
  if (batteryLevel >= BATTERY_THRESHOLDS.MEH) return 'meh'
  return 'sad'
}

// API polling intervals (in milliseconds)
export const POLL_INTERVALS = {
  BATTERY: 5000,       // 5 seconds - fast updates after meals
  MEALS: 300000,       // 5 minutes
  PROFILE: 600000,     // 10 minutes
} as const

// Toast/notification durations
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 4000,
} as const
