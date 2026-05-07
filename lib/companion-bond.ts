import type { UserProfile } from '@/types'

export type BondTier = 'stranger' | 'awakening' | 'bonded' | 'close' | 'soulmate'

export interface BondLevel {
  level:    number   // 0–4
  tier:     BondTier
  label:    string
  xp:       number
  nextXP:   number   // XP needed for next level (0 if max)
  progress: number   // 0–1 within current tier
}

const TIERS: { tier: BondTier; label: string; threshold: number }[] = [
  { tier: 'stranger',   label: 'Stranger',   threshold: 0    },
  { tier: 'awakening',  label: 'Awakening',  threshold: 100  },
  { tier: 'bonded',     label: 'Bonded',     threshold: 350  },
  { tier: 'close',      label: 'Close',      threshold: 800  },
  { tier: 'soulmate',   label: 'Soulmate',   threshold: 1800 },
]

export function computeBondXP(profile: UserProfile & { seeds?: number; lastRitual?: string }): number {
  const ritualBonus = profile.lastRitual ? 50 : 0
  return (
    (profile.messageCount    ?? 0) * 2  +
    (profile.imageCount      ?? 0) * 5  +
    (profile.connectionCount ?? 0) * 15 +
    (profile.seeds           ?? 0) * 3  +
    ritualBonus
  )
}

export function getBondLevel(xp: number): BondLevel {
  let level = 0
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (xp >= TIERS[i].threshold) { level = i; break }
  }
  const current = TIERS[level]
  const next    = TIERS[level + 1]
  const start   = current.threshold
  const end     = next?.threshold ?? start + 1
  const progress = next ? Math.min(1, (xp - start) / (end - start)) : 1

  return {
    level,
    tier:     current.tier,
    label:    current.label,
    xp,
    nextXP:   next ? next.threshold : 0,
    progress,
  }
}

export const BOND_GLOW: Record<number, string> = {
  0: 'none',
  1: '#86efac',   // soft green
  2: '#fbbf24',   // gold
  3: '#c084fc',   // purple
  4: '#f472b6',   // rose — soulmate
}
