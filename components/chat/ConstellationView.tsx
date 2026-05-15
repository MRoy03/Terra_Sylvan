'use client'

import { useRef, useState, useMemo } from 'react'
import type { Message } from '@/types'
import { formatTime } from '@/lib/utils'

interface ConstellationViewProps {
  messages: Message[]
  myUid:    string
}

// Place stars in a staggered grid that fits any width
function useStarPositions(count: number) {
  return useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const col   = i % 4
      const row   = Math.floor(i / 4)
      const staggerX = (row % 2) * 12
      return {
        xPct: 12 + col * 22 + staggerX,
        y:    54 + row * 90,
      }
    })
  }, [count])
}

export function ConstellationView({ messages, myUid }: ConstellationViewProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const positions = useStarPositions(messages.length)
  const svgH = Math.max(400, positions[positions.length - 1]?.y + 80 || 400)

  return (
    <div className="flex-1 overflow-y-auto relative select-none"
      style={{ background: 'radial-gradient(ellipse at center, #04081a 0%, #010306 100%)' }}>

      {/* Background star field */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 120 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-star-glow"
            style={{
              width:  `${0.8 + (i % 4) * 0.4}px`,
              height: `${0.8 + (i % 4) * 0.4}px`,
              left:   `${(i * 41) % 100}%`,
              top:    `${(i * 67) % 100}%`,
              opacity: 0.05 + (i % 7) * 0.04,
              animationDelay: `${(i % 5) * 0.7}s`,
              animationDuration: `${2 + (i % 4)}s`,
            }} />
        ))}
      </div>

      {/* Constellation SVG */}
      <svg
        width="100%"
        height={svgH}
        className="relative z-10 overflow-visible"
        style={{ display: 'block' }}
      >
        {/* Connecting lines */}
        {messages.slice(1).map((_, i) => {
          const a = positions[i], b = positions[i + 1]
          return (
            <line key={i}
              x1={`${a.xPct}%`} y1={a.y}
              x2={`${b.xPct}%`} y2={b.y}
              stroke="rgba(130,160,255,0.18)"
              strokeWidth="1"
              strokeDasharray="5 8"
            />
          )
        })}

        {/* Stars + labels */}
        {messages.map((msg, i) => {
          const pos    = positions[i]
          const isMine = msg.senderId === myUid
          const isHov  = hovered === msg.id
          const r      = isHov ? 10 : isMine ? 7 : 5.5
          const color  = isMine ? '#4ade80' : '#818cf8'
          const glow   = isMine ? '#4ade8044' : '#818cf844'
          const preview =
            msg.type !== 'text' ? `[${msg.type}]` : msg.content.slice(0, 40) + (msg.content.length > 40 ? '…' : '')

          return (
            <g key={msg.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(msg.id)}
              onMouseLeave={() => setHovered(null)}
              onTouchStart={() => setHovered(v => v === msg.id ? null : msg.id)}
            >
              {/* Outer glow ring */}
              <circle cx={`${pos.xPct}%`} cy={pos.y} r={isHov ? 22 : 15}
                fill={glow} style={{ transition: 'r 0.2s' }} />
              {/* Star */}
              <circle cx={`${pos.xPct}%`} cy={pos.y} r={r}
                fill={color} opacity={0.9}
                style={{ transition: 'r 0.2s, opacity 0.2s', filter: `drop-shadow(0 0 ${isHov ? 8 : 4}px ${color})` }}>
                <animate attributeName="opacity" values="0.9;0.65;0.9"
                  dur={`${2.5 + (i % 4) * 0.6}s`} repeatCount="indefinite" begin={`${(i * 0.38) % 3}s`} />
              </circle>

              {/* Time label */}
              <text x={`${pos.xPct}%`} y={pos.y - r - 5}
                textAnchor="middle" fill="rgba(200,220,255,0.3)" fontSize="8" fontFamily="monospace">
                {formatTime(msg.timestamp)}
              </text>

              {/* Message preview */}
              {isHov && (
                <foreignObject
                  x={`calc(${pos.xPct}% - 68px)`}
                  y={pos.y + r + 6}
                  width="136"
                  height="52"
                  style={{ overflow: 'visible' }}
                >
                  <div style={{
                    background: 'rgba(10,16,36,0.95)',
                    border: `1px solid ${color}40`,
                    borderRadius: '10px',
                    padding: '6px 8px',
                    fontSize: '10px',
                    color: '#c8d8ff',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                    boxShadow: `0 4px 16px rgba(0,0,0,0.5)`,
                  }}>
                    {preview}
                  </div>
                </foreignObject>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="sticky bottom-0 flex items-center justify-center gap-4 py-2 text-[10px] text-white/20"
        style={{ background: 'linear-gradient(to top, rgba(1,3,6,0.9) 0%, transparent 100%)' }}>
        <span className="flex items-center gap-1">
          <span style={{ color: '#4ade80' }}>●</span> You
        </span>
        <span className="flex items-center gap-1">
          <span style={{ color: '#818cf8' }}>●</span> Them
        </span>
        <span>Hover stars to read</span>
      </div>
    </div>
  )
}
