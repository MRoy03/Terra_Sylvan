'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/lib/auth-context'
import { TREE_BIOME_MAP } from '@/types'
import type { BiomeType } from '@/types'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth()
  const pathname    = usePathname()
  const isDashboard = pathname === '/dashboard'

  const biome = profile?.treeType
    ? TREE_BIOME_MAP[profile.treeType] as BiomeType
    : undefined
  const { theme } = useTheme(biome)
  const t = theme.tokens

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--th-bg',           t.bg)
    root.style.setProperty('--th-bg-card',      t.bgCard)
    root.style.setProperty('--th-bg-input',     t.bgInput)
    root.style.setProperty('--th-border',       t.border)
    root.style.setProperty('--th-accent',       t.accent)
    root.style.setProperty('--th-accent-muted', t.accentMuted)
    root.style.setProperty('--th-text',         t.text)
    root.style.setProperty('--th-text-muted',   t.textMuted)
    root.style.setProperty('--th-glow',         t.glow)
    root.style.setProperty('--th-header',       t.headerBg)
    root.style.setProperty('--th-msg-self',     t.msgSelf)
    root.style.setProperty('--th-msg-other',    t.msgOther)

    if (!isDashboard) {
      document.body.style.background = t.bg
    } else {
      document.body.style.background = ''
    }

    return () => { document.body.style.background = '' }
  }, [t, isDashboard])

  return <>{children}</>
}
