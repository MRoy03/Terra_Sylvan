'use client'

import { useState, useEffect, useCallback } from 'react'
import { getActiveTheme, getThemeById, MANUAL_THEMES, THEME_STORAGE_KEY, type Theme } from '@/lib/themes'
import type { BiomeType } from '@/types'

export function useTheme(biome?: BiomeType) {
  const [theme, setThemeState] = useState<Theme>(() => getActiveTheme(biome))

  // Re-read from localStorage when biome changes (e.g. after profile loads)
  useEffect(() => {
    setThemeState(getActiveTheme(biome))
  }, [biome])

  // React to theme changes across tabs / other components
  useEffect(() => {
    const handler = () => setThemeState(getActiveTheme(biome))
    window.addEventListener('storage', handler)
    window.addEventListener('ts-theme-change', handler)
    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener('ts-theme-change', handler)
    }
  }, [biome])

  const setTheme = useCallback((id: string) => {
    localStorage.setItem(THEME_STORAGE_KEY, id)
    setThemeState(getThemeById(id))
    // Broadcast to same-tab listeners (e.g. chat page open in same session)
    window.dispatchEvent(new Event('ts-theme-change'))
  }, [])

  return { theme, setTheme, themes: MANUAL_THEMES }
}
