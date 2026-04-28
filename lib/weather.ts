'use client'

import { useState, useEffect } from 'react'
import { getCurrentSeason } from './seasons'

export type WeatherCondition =
  | 'clear' | 'partly_cloudy' | 'cloudy' | 'fog'
  | 'drizzle' | 'rain' | 'heavy_rain' | 'snow' | 'heavy_snow' | 'storm'

export interface WeatherData {
  condition: WeatherCondition
  temperature: number | null
  windspeed: number | null
  loading: boolean
}

function wmoToCondition(code: number): WeatherCondition {
  if (code === 0) return 'clear'
  if (code <= 1) return 'partly_cloudy'
  if (code <= 3) return 'cloudy'
  if (code <= 49) return 'fog'
  if (code <= 55) return 'drizzle'
  if (code <= 65) return code <= 61 ? 'rain' : 'heavy_rain'
  if (code <= 77) return code <= 73 ? 'snow' : 'heavy_snow'
  if (code <= 82) return 'rain'
  if (code <= 86) return 'snow'
  return 'storm'
}

const SEASON_DEFAULTS: Record<string, WeatherCondition> = {
  spring: 'partly_cloudy',
  summer: 'clear',
  autumn: 'cloudy',
  winter: 'snow',
}

export function useWeather(): WeatherData {
  const [data, setData] = useState<WeatherData>({
    condition: SEASON_DEFAULTS[getCurrentSeason()] ?? 'clear',
    temperature: null,
    windspeed: null,
    loading: true,
  })

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setData(d => ({ ...d, loading: false }))
      return
    }

    const timeout = setTimeout(() => setData(d => ({ ...d, loading: false })), 8000)

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        clearTimeout(timeout)
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude.toFixed(4)}&longitude=${coords.longitude.toFixed(4)}&current_weather=true`
          const res  = await fetch(url)
          const json = await res.json()
          const cw   = json.current_weather
          setData({
            condition:   wmoToCondition(cw.weathercode),
            temperature: Math.round(cw.temperature),
            windspeed:   cw.windspeed,
            loading:     false,
          })
        } catch {
          setData(d => ({ ...d, loading: false }))
        }
      },
      () => { clearTimeout(timeout); setData(d => ({ ...d, loading: false })) },
      { timeout: 6000 },
    )

    return () => clearTimeout(timeout)
  }, [])

  return data
}

export const WEATHER_ICON: Record<WeatherCondition, string> = {
  clear:       '☀️',
  partly_cloudy:'⛅',
  cloudy:      '☁️',
  fog:         '🌫️',
  drizzle:     '🌦️',
  rain:        '🌧️',
  heavy_rain:  '⛈️',
  snow:        '🌨️',
  heavy_snow:  '❄️',
  storm:       '⛈️',
}
