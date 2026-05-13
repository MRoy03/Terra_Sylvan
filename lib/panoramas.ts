// lib/panoramas.ts
import type { BiomeType } from '@/types'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

const U = 'https://images.unsplash.com/photo-'

// Curated Unsplash landscape-only photos — biome × season
// Only pure nature: no buildings, no people, no roads
const PHOTOS: Record<string, string> = {
  // ── Temperate forest — four distinct seasons ───────────────────────────────
  'temperate-spring': `${U}1560969184-10fe8719e047?w=1920&q=85&fit=crop&crop=entropy`,
  'temperate-summer': `${U}1448375240586-882707db888b?w=1920&q=85&fit=crop&crop=entropy`,
  'temperate-autumn': `${U}1508739773434-c26b3d09e071?w=1920&q=85&fit=crop&crop=entropy`,
  'temperate-winter': `${U}1491002052546-bf38f186af56?w=1920&q=85&fit=crop&crop=entropy`,

  // ── Mountain — alpine peaks, valleys, glaciers ────────────────────────────
  'mountain-spring':  `${U}1464822759023-fed622ff2c3b?w=1920&q=85&fit=crop&crop=entropy`,
  'mountain-summer':  `${U}1506905925346-21bda4d32df4?w=1920&q=85&fit=crop&crop=entropy`,
  'mountain-autumn':  `${U}1476231682828-37e571bc172f?w=1920&q=85&fit=crop&crop=entropy`,
  'mountain-winter':  `${U}1551632811-561732d1e306?w=1920&q=85&fit=crop&crop=entropy`,

  // ── Tropical rainforest — lush green jungle canopy ────────────────────────
  'tropical-spring':  `${U}1516026672322-bc52d61a55d5?w=1920&q=85&fit=crop&crop=entropy`,
  'tropical-summer':  `${U}1511884042945-fc9aab6d0c72?w=1920&q=85&fit=crop&crop=entropy`,
  'tropical-autumn':  `${U}1516026672322-bc52d61a55d5?w=1920&q=85&fit=crop&crop=entropy`,
  'tropical-winter':  `${U}1441974231531-c6227db76b6e?w=1920&q=85&fit=crop&crop=entropy`,

  // ── Arid desert — sand dunes and rocky canyons ────────────────────────────
  'arid-spring':      `${U}1509316785289-025f5b846b35?w=1920&q=85&fit=crop&crop=entropy`,
  'arid-summer':      `${U}1518173946687-a4c8892bbd9f?w=1920&q=85&fit=crop&crop=entropy`,
  'arid-autumn':      `${U}1509316785289-025f5b846b35?w=1920&q=85&fit=crop&crop=entropy`,
  'arid-winter':      `${U}1509316785289-025f5b846b35?w=1920&q=85&fit=crop&crop=entropy`,

  // ── Mediterranean — wild scrubland, coastal cliffs, NO buildings ──────────
  'mediterranean-spring': `${U}1527489377706-5bf97e608852?w=1920&q=85&fit=crop&crop=entropy`,
  'mediterranean-summer': `${U}1469840030693-ecf91e3d3ab3?w=1920&q=85&fit=crop&crop=entropy`,
  'mediterranean-autumn': `${U}1506956822901-ff7db8795739?w=1920&q=85&fit=crop&crop=entropy`,
  'mediterranean-winter': `${U}1527489377706-5bf97e608852?w=1920&q=85&fit=crop&crop=entropy`,

  // ── Tundra — open arctic/subarctic plains, no structures ─────────────────
  'tundra-spring':    `${U}1454165205701-07181588f9c4?w=1920&q=85&fit=crop&crop=entropy`,
  'tundra-summer':    `${U}1574687784858-3a617c9df87a?w=1920&q=85&fit=crop&crop=entropy`,
  'tundra-autumn':    `${U}1487621031993-4c2da4e92f68?w=1920&q=85&fit=crop&crop=entropy`,
  'tundra-winter':    `${U}1517431994953-f40d44b3ac3e?w=1920&q=85&fit=crop&crop=entropy`,

  // ── Mangrove — coastal wetland, river deltas, aerial roots ───────────────
  'mangrove-spring':  `${U}1469474968028-56623f02e42e?w=1920&q=85&fit=crop&crop=entropy`,
  'mangrove-summer':  `${U}1469474968028-56623f02e42e?w=1920&q=85&fit=crop&crop=entropy`,
  'mangrove-autumn':  `${U}1469474968028-56623f02e42e?w=1920&q=85&fit=crop&crop=entropy`,
  'mangrove-winter':  `${U}1469474968028-56623f02e42e?w=1920&q=85&fit=crop&crop=entropy`,
}

// Fallback CSS gradient if photo fails to load
export const BIOME_FALLBACKS: Record<BiomeType, string> = {
  temperate:     'linear-gradient(180deg, #1a3a1a 0%, #060f07 100%)',
  mountain:      'linear-gradient(180deg, #1a2040 0%, #08101a 100%)',
  tropical:      'linear-gradient(180deg, #062010 0%, #020a05 100%)',
  arid:          'linear-gradient(180deg, #3a2408 0%, #1a1006 100%)',
  mediterranean: 'linear-gradient(180deg, #2a2212 0%, #121008 100%)',
  tundra:        'linear-gradient(180deg, #202838 0%, #0c1220 100%)',
  mangrove:      'linear-gradient(180deg, #082818 0%, #041210 100%)',
}

// Fog colors that match each biome's photo palette at the horizon
export const BIOME_FOG: Record<BiomeType, string> = {
  temperate:     '#0a1a08',
  mountain:      '#101828',
  tropical:      '#040e06',
  arid:          '#1e1206',
  mediterranean: '#181408',
  tundra:        '#141824',
  mangrove:      '#081014',
}

export function getPanoramaUrl(biome: BiomeType, season: Season): string {
  return PHOTOS[`${biome}-${season}`] ?? PHOTOS[`${biome}-summer`] ?? ''
}

// CSS rgba overlay applied over photo to tint for time-of-day atmosphere
export const TIME_OVERLAYS: Record<string, string> = {
  dawn:  'rgba(160,60,0,0.35)',
  day:   'rgba(8,20,8,0.15)',
  dusk:  'rgba(140,40,0,0.42)',
  night: 'rgba(0,6,28,0.82)',
}

export function getTimeKey(hour: number): string {
  if (hour >= 5  && hour < 7)  return 'dawn'
  if (hour >= 7  && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'dusk'
  return 'night'
}
