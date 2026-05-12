import type { BiomeType } from '@/types'

export interface ThemeTokens {
  bg:          string  // page / canvas background
  bgCard:      string  // sidebar, card panels
  bgInput:     string  // search / input fields
  border:      string  // divider / border lines
  accent:      string  // primary highlight (buttons, active items)
  accentMuted: string  // dimmed accent (inactive links)
  text:        string  // primary body text
  textMuted:   string  // secondary / placeholder text
  headerBg:    string  // sticky header glass background
  glow:        string  // glow ring / neon accent
  msgSelf:     string  // own message bubble
  msgOther:    string  // other person's message bubble
}

export interface Theme {
  id:     string
  label:  string
  emoji:  string
  tokens: ThemeTokens
}

export const MANUAL_THEMES: Theme[] = [
  // ── Forest Dark ─────────────────────────────────────────────────────────────
  {
    id: 'forest-dark', label: 'Forest Dark', emoji: '🌲',
    tokens: {
      bg:          '#020d04',
      bgCard:      '#071408',
      bgInput:     '#0d2210',
      border:      '#1d4422',
      accent:      '#4ade80',
      accentMuted: '#16a34a',
      text:        '#bbf7d0',
      textMuted:   '#4d7a57',
      headerBg:    'rgba(2,13,4,0.90)',
      glow:        '#22c55e',
      msgSelf:     '#0a2d10',
      msgOther:    '#051008',
    },
  },

  // ── Cherry Blossom ──────────────────────────────────────────────────────────
  {
    id: 'cherry-blossom', label: 'Cherry Blossom', emoji: '🌸',
    tokens: {
      bg:          '#0e050d',
      bgCard:      '#1e0a1a',
      bgInput:     '#2a0e24',
      border:      '#6d1e5e',
      accent:      '#f472b6',
      accentMuted: '#be185d',
      text:        '#fce7f3',
      textMuted:   '#d06898',
      headerBg:    'rgba(14,5,13,0.92)',
      glow:        '#f9a8d4',
      msgSelf:     '#3a1232',
      msgOther:    '#150810',
    },
  },

  // ── Midnight Indigo ─────────────────────────────────────────────────────────
  {
    id: 'midnight-indigo', label: 'Midnight Indigo', emoji: '🌌',
    tokens: {
      bg:          '#04020f',
      bgCard:      '#0c0820',
      bgInput:     '#16122e',
      border:      '#3730a3',
      accent:      '#a78bfa',
      accentMuted: '#4f46e5',
      text:        '#ede9fe',
      textMuted:   '#7c6eb0',
      headerBg:    'rgba(4,2,15,0.92)',
      glow:        '#c4b5fd',
      msgSelf:     '#1e1a40',
      msgOther:    '#080614',
    },
  },

  // ── Desert Dusk ─────────────────────────────────────────────────────────────
  {
    id: 'desert-dusk', label: 'Desert Dusk', emoji: '🌅',
    tokens: {
      bg:          '#0d0601',
      bgCard:      '#1c0e04',
      bgInput:     '#28160a',
      border:      '#7c3510',
      accent:      '#fb923c',
      accentMuted: '#c2410c',
      text:        '#ffedd5',
      textMuted:   '#c2724a',
      headerBg:    'rgba(13,6,1,0.92)',
      glow:        '#fdba74',
      msgSelf:     '#34180a',
      msgOther:    '#150900',
    },
  },

  // ── Arctic Frost ────────────────────────────────────────────────────────────
  {
    id: 'arctic-frost', label: 'Arctic Frost', emoji: '❄️',
    tokens: {
      bg:          '#03080f',
      bgCard:      '#08111e',
      bgInput:     '#0e1c2e',
      border:      '#164e63',
      accent:      '#38bdf8',
      accentMuted: '#0ea5e9',
      text:        '#e0f2fe',
      textMuted:   '#3d7a9a',
      headerBg:    'rgba(3,8,15,0.92)',
      glow:        '#7dd3fc',
      msgSelf:     '#0c2036',
      msgOther:    '#040c16',
    },
  },

  // ── Volcanic Night ──────────────────────────────────────────────────────────
  {
    id: 'volcanic-night', label: 'Volcanic Night', emoji: '🌋',
    tokens: {
      bg:          '#0a0100',
      bgCard:      '#1a0400',
      bgInput:     '#260600',
      border:      '#7f1d1d',
      accent:      '#f87171',
      accentMuted: '#b91c1c',
      text:        '#fee2e2',
      textMuted:   '#c05050',
      headerBg:    'rgba(10,1,0,0.92)',
      glow:        '#fca5a5',
      msgSelf:     '#320a08',
      msgOther:    '#180200',
    },
  },

  // ── Bamboo Garden ───────────────────────────────────────────────────────────
  {
    id: 'bamboo-garden', label: 'Bamboo Garden', emoji: '🎋',
    tokens: {
      bg:          '#020e04',
      bgCard:      '#071a0a',
      bgInput:     '#0d2812',
      border:      '#365314',
      accent:      '#a3e635',
      accentMuted: '#65a30d',
      text:        '#f7fee7',
      textMuted:   '#6a9e28',
      headerBg:    'rgba(2,14,4,0.92)',
      glow:        '#d9f99d',
      msgSelf:     '#122a06',
      msgOther:    '#040e02',
    },
  },

  // ── Ocean Deep ──────────────────────────────────────────────────────────────
  {
    id: 'ocean-deep', label: 'Ocean Deep', emoji: '🌊',
    tokens: {
      bg:          '#010a0f',
      bgCard:      '#051520',
      bgInput:     '#08202e',
      border:      '#155e75',
      accent:      '#22d3ee',
      accentMuted: '#0891b2',
      text:        '#cffafe',
      textMuted:   '#2e80a0',
      headerBg:    'rgba(1,10,15,0.92)',
      glow:        '#67e8f9',
      msgSelf:     '#082232',
      msgOther:    '#030c14',
    },
  },
]

const BIOME_THEME_MAP: Record<BiomeType, string> = {
  temperate:     'forest-dark',
  mountain:      'midnight-indigo',
  tropical:      'bamboo-garden',
  arid:          'desert-dusk',
  mediterranean: 'forest-dark',
  tundra:        'arctic-frost',
  mangrove:      'ocean-deep',
}

export const THEME_STORAGE_KEY = 'ts_theme'

export function getThemeById(id: string): Theme {
  return MANUAL_THEMES.find(t => t.id === id) ?? MANUAL_THEMES[0]
}

export function getThemeForBiome(biome?: BiomeType): Theme {
  const id = biome ? BIOME_THEME_MAP[biome] : 'forest-dark'
  return getThemeById(id)
}

export function getActiveTheme(biome?: BiomeType): Theme {
  if (typeof window === 'undefined') return getThemeForBiome(biome)
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored && MANUAL_THEMES.some(t => t.id === stored)) return getThemeById(stored)
  return getThemeForBiome(biome)
}
