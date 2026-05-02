'use client'

import { useState } from 'react'
import { ALL_BADGES, getBadge, Badge } from '@/lib/badges'

interface BadgeDisplayProps {
  badgeIds:  string[]
  compact?:  boolean
  maxShow?:  number
}

function BadgeTooltip({ badge }: { badge: Badge }) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-44 px-3 py-2 rounded-xl
                    bg-forest-950/95 border border-forest-700/50 shadow-2xl pointer-events-none text-center">
      <p className="text-white text-xs font-bold">{badge.emoji} {badge.label}</p>
      <p className="text-forest-400 text-[10px] mt-0.5 leading-snug">{badge.description}</p>
      <span className={`inline-block mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold
        ${badge.rarity === 'legendary' ? 'bg-yellow-900/60 text-yellow-300' :
          badge.rarity === 'rare'      ? 'bg-purple-900/60 text-purple-300' :
                                         'bg-forest-800/60 text-forest-300'}`}>
        {badge.rarity}
      </span>
    </div>
  )
}

export function BadgeDisplay({ badgeIds, compact, maxShow = 8 }: BadgeDisplayProps) {
  const [tooltip, setTooltip] = useState<string | null>(null)
  const badges = badgeIds.slice(0, maxShow).map(id => getBadge(id)).filter(Boolean) as Badge[]

  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map(badge => (
        <div
          key={badge.id}
          className="relative"
          onMouseEnter={() => setTooltip(badge.id)}
          onMouseLeave={() => setTooltip(null)}
        >
          <div className={`
            flex items-center justify-center rounded-full cursor-default select-none transition-transform hover:scale-110
            ${compact ? 'w-7 h-7 text-base' : 'w-9 h-9 text-xl'}
            ${badge.rarity === 'legendary'
              ? 'bg-gradient-to-br from-yellow-900/60 to-amber-800/40 border border-yellow-600/40 shadow-[0_0_8px_rgba(234,179,8,0.3)]'
              : badge.rarity === 'rare'
              ? 'bg-gradient-to-br from-purple-900/60 to-violet-800/40 border border-purple-600/40'
              : 'bg-forest-900/60 border border-forest-700/40'
            }`}
          >
            {badge.emoji}
          </div>
          {tooltip === badge.id && <BadgeTooltip badge={badge} />}
        </div>
      ))}
      {badgeIds.length > maxShow && (
        <div className={`flex items-center justify-center rounded-full bg-forest-900/60 border border-forest-800/40 text-forest-500 font-mono text-xs
          ${compact ? 'w-7 h-7' : 'w-9 h-9'}`}>
          +{badgeIds.length - maxShow}
        </div>
      )}
    </div>
  )
}
