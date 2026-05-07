import type { WeatherCondition } from './weather'

export type MoodType = 'sunny' | 'breezy' | 'rainy' | 'stormy' | 'radiant'

export interface MoodOption {
  type:    MoodType
  emoji:   string
  label:   string
  hint:    string
  weather: WeatherCondition
  accent:  string
}

export const MOOD_OPTIONS: MoodOption[] = [
  { type: 'sunny',   emoji: '☀️',  label: 'Bright',  hint: 'Clear and light',       weather: 'clear',        accent: '#fbbf24' },
  { type: 'breezy',  emoji: '🌤',  label: 'Breezy',  hint: 'Easy and open',         weather: 'partly_cloudy', accent: '#93c5fd' },
  { type: 'rainy',   emoji: '🌧',  label: 'Rainy',   hint: 'Contemplative',         weather: 'rain',          accent: '#818cf8' },
  { type: 'stormy',  emoji: '⛈',  label: 'Stormy',  hint: 'Intense and alive',     weather: 'storm',         accent: '#a78bfa' },
  { type: 'radiant', emoji: '🌈',  label: 'Radiant', hint: 'After the storm, light', weather: 'clear',        accent: '#34d399' },
]

export function getMoodOption(type: MoodType): MoodOption {
  return MOOD_OPTIONS.find(m => m.type === type) ?? MOOD_OPTIONS[0]
}
