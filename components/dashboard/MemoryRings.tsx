'use client'

import { useMemo } from 'react'
import { X } from 'lucide-react'
import type { UserProfile, TreeStats } from '@/types'
import { TREE_CONFIGS } from '@/types'

interface MemoryRingsProps {
  profile: UserProfile & { seeds?: number; lastRitual?: string }
  stats:   TreeStats
  onClose: () => void
}

interface Ring {
  label:   string
  radius:  number
  color:   string
  opacity: number
  dash:    string
}

interface Milestone {
  angle:   number
  r:       number
  emoji:   string
  label:   string
  color:   string
}

function buildRings(stats: TreeStats): Ring[] {
  const rings: Ring[] = []
  const weeks = Math.max(1, Math.round(stats.ageInDays / 7))
  const maxR  = 140
  const colors = ['#52725a', '#4a6a52', '#42604a', '#3a5842', '#32503a']

  for (let i = 0; i < Math.min(weeks, 18); i++) {
    const t  = (i + 1) / Math.min(weeks, 18)
    rings.push({
      label:   `Week ${i + 1}`,
      radius:  12 + t * (maxR - 12),
      color:   colors[i % colors.length],
      opacity: 0.55 + (i / 18) * 0.35,
      dash:    i % 3 === 0 ? '4 2' : '0',
    })
  }
  return rings
}

function buildMilestones(profile: UserProfile, stats: TreeStats): Milestone[] {
  const ms: Milestone[] = []
  const cx = 160, cy = 160
  const maxR = 140

  const place = (ring: number, angleDeg: number, emoji: string, label: string, color: string) => {
    const r   = 12 + (ring / 18) * (maxR - 12)
    const rad = (angleDeg * Math.PI) / 180
    ms.push({ angle: rad, r, emoji, label, color })
  }

  if (stats.ageInDays >= 1)                                place(1,  0,   '🌱', 'First day',        '#86efac')
  if (profile.messageCount >= 1)                           place(2,  45,  '🍃', 'First message',     '#4ade80')
  if (profile.imageCount >= 1)                             place(3,  120, '🌸', 'First photo',       '#f9a8d4')
  if (profile.connectionCount >= 1)                        place(4,  200, '🌿', 'First connection',  '#6ee7b7')
  if (profile.videoCount >= 1)                             place(5,  280, '🍎', 'First video',       '#fca5a5')
  if (profile.messageCount >= 50)                          place(7,  30,  '🍀', '50 messages',       '#34d399')
  if (profile.messageCount >= 200)                         place(10, 90,  '🌳', '200 messages',      '#10b981')
  if (profile.connectionCount >= 5)                        place(8,  160, '🕸', '5 connections',     '#a78bfa')
  if ((profile as any).seeds >= 10)                        place(9,  240, '🌱', '10 seeds',          '#fbbf24')
  if ((profile as any).lastRitual)                         place(6,  330, '🌿', 'First ritual',      '#f0abfc')
  if (stats.stage === 'mature' || stats.stage === 'ancient') place(14, 60, '🌲', 'Matured',           '#059669')
  if (stats.stage === 'ancient')                           place(17, 180, '✨', 'Ancient',           '#f59e0b')

  return ms
}

export function MemoryRings({ profile, stats, onClose }: MemoryRingsProps) {
  const rings     = useMemo(() => buildRings(stats),                [stats])
  const milestones = useMemo(() => buildMilestones(profile, stats), [profile, stats])
  const cfg        = TREE_CONFIGS[profile.treeType]
  const cx = 160, cy = 160

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        <div className="ritual-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
            <div>
              <h2 className="text-base font-display font-semibold text-white/90">Memory Rings</h2>
              <p className="text-[11px] text-forest-600 mt-0.5">{stats.ageInDays} days · {stats.stage}</p>
            </div>
            <button onClick={onClose} className="text-forest-600 hover:text-forest-300 transition-colors p-1">
              <X size={16} />
            </button>
          </div>

          <div className="p-5 flex flex-col items-center gap-4">
            {/* SVG rings */}
            <svg viewBox="0 0 320 320" className="w-full max-w-[280px]">
              {/* Bark fill background */}
              <circle cx={cx} cy={cy} r={148} fill="#0a1a0c" />

              {/* Growth rings */}
              {rings.map((ring, i) => (
                <circle
                  key={i}
                  cx={cx} cy={cy}
                  r={ring.radius}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth={ring.radius > 80 ? 2.5 : 2}
                  strokeOpacity={ring.opacity}
                  strokeDasharray={ring.dash}
                />
              ))}

              {/* Sapwood lighter band */}
              {rings.length > 3 && (
                <circle cx={cx} cy={cy} r={rings[rings.length - 1].radius}
                  fill="none" stroke="#6b9c72" strokeWidth={4} strokeOpacity={0.18} />
              )}

              {/* Heartwood center */}
              <circle cx={cx} cy={cy} r={10} fill={cfg.trunkColor} fillOpacity={0.9} />
              <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="10">
                {cfg.emoji}
              </text>

              {/* Milestone dots */}
              {milestones.map((m, i) => {
                const x = cx + Math.cos(m.angle) * m.r
                const y = cy + Math.sin(m.angle) * m.r
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={11} fill="#0a1408" stroke={m.color} strokeWidth={1.5} strokeOpacity={0.7} />
                    <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="9">{m.emoji}</text>
                  </g>
                )
              })}
            </svg>

            {/* Legend */}
            {milestones.length > 0 && (
              <div className="w-full grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto scrollbar-hide">
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px]">
                    <span>{m.emoji}</span>
                    <span className="text-forest-500">{m.label}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[10px] text-forest-700 text-center italic">
              Each ring is one week of your tree's life.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
