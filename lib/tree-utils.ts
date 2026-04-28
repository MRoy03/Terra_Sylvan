import { TreeStats, UserProfile } from '@/types'

export function computeTreeStats(profile: UserProfile): TreeStats {
  const ageInDays = Math.floor((Date.now() - profile.createdAt) / (1000 * 60 * 60 * 24))

  const stage =
    ageInDays < 7    ? 'seedling' :
    ageInDays < 30   ? 'sapling'  :
    ageInDays < 180  ? 'young'    :
    ageInDays < 730  ? 'mature'   : 'ancient'

  // Scale grows logarithmically with age: 0.35 at day 0 → ~2.0 at day 730+
  const scale = Math.min(2.0, 0.35 + Math.log10(Math.max(1, ageInDays) + 1) * 0.65)

  const leafCount   = Math.min(200, Math.floor(profile.messageCount * 2))
  const fruitCount  = Math.min(40,  profile.videoCount)
  const flowerCount = Math.min(60,  profile.imageCount)
  const rootCount   = Math.min(5,   profile.connectionCount)

  return { ageInDays, scale, leafCount, fruitCount, flowerCount, rootCount, stage }
}

export function getStageBadge(stage: TreeStats['stage']): { label: string; color: string } {
  const badges = {
    seedling: { label: '🌱 Seedling',    color: '#86efac' },
    sapling:  { label: '🌿 Sapling',     color: '#4ade80' },
    young:    { label: '🌳 Young Tree',  color: '#22c55e' },
    mature:   { label: '🌲 Mature Tree', color: '#16a34a' },
    ancient:  { label: '🏛️ Ancient Oak', color: '#15803d' },
  }
  return badges[stage]
}
