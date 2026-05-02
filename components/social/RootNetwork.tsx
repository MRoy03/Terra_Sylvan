'use client'

import { useEffect, useState, useRef } from 'react'
import { getUserProfile } from '@/lib/firestore'
import { useAuth } from '@/lib/auth-context'
import { Connection, UserProfile, TREE_CONFIGS } from '@/types'
import { subscribeConnections } from '@/lib/firestore'

interface Node {
  uid:         string
  displayName: string
  treeType:    string
  angle:       number
  radius:      number
}

function polar(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  }
}

function RootPath({ cx, cy, x, y, color }: { cx:number; cy:number; x:number; y:number; color:string }) {
  // Bezier curve that looks like a root
  const mx = (cx + x) / 2 + (Math.random() - 0.5) * 20
  const my = (cy + y) / 2 + (Math.random() - 0.5) * 20
  return (
    <path
      d={`M${cx},${cy} Q${mx},${my} ${x},${y}`}
      stroke={color}
      strokeWidth="1.5"
      fill="none"
      strokeOpacity="0.5"
      strokeDasharray="4 2"
    />
  )
}

export function RootNetwork() {
  const { user, profile } = useAuth()
  const [nodes, setNodes] = useState<Node[]>([])
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!user) return
    return subscribeConnections(user.uid, async (conns: Connection[]) => {
      const accepted = conns.filter(c => c.status === 'accepted').slice(0, 16)
      const profiles = await Promise.all(accepted.map(c => getUserProfile(c.uid)))
      const newNodes: Node[] = profiles
        .filter((p): p is UserProfile => p !== null)
        .map((p, i) => {
          const ring   = i < 6 ? 0 : i < 12 ? 1 : 2
          const rings  = [75, 130, 180]
          const count  = ring === 0 ? Math.min(6, accepted.length)
                       : ring === 1 ? Math.min(6, accepted.length - 6)
                       : accepted.length - 12
          const idx    = ring === 0 ? i : ring === 1 ? i - 6 : i - 12
          const angle  = (2 * Math.PI * idx) / Math.max(count, 1) - Math.PI / 2
          return { uid: p.uid, displayName: p.displayName, treeType: p.treeType, angle, radius: rings[ring] }
        })
      setNodes(newNodes)
    })
  }, [user])

  const W = 400, H = 400
  const cx = W / 2, cy = H / 2

  if (!profile) return null

  const centerConfig = TREE_CONFIGS[profile.treeType]

  return (
    <div className="w-full rounded-2xl border border-forest-800/40 bg-forest-950/60 p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🌿</span>
        <h3 className="text-white text-sm font-bold">Root Network</h3>
        <span className="text-forest-500 text-xs">{nodes.length} connections</span>
      </div>

      {nodes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-5xl mb-2">🌱</p>
          <p className="text-forest-500 text-sm">Your roots haven't spread yet.</p>
          <p className="text-forest-600 text-xs mt-1">Connect with others to build your network.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto" style={{ maxHeight: 300 }}>
            {/* Root paths */}
            {nodes.map(n => {
              const { x, y } = polar(cx, cy, n.radius, n.angle)
              return <RootPath key={n.uid} cx={cx} cy={cy} x={x} y={y} color="#4ade80" />
            })}

            {/* Friend nodes */}
            {nodes.map(n => {
              const cfg = TREE_CONFIGS[n.treeType as keyof typeof TREE_CONFIGS]
              const { x, y } = polar(cx, cy, n.radius, n.angle)
              return (
                <g key={n.uid}>
                  <circle cx={x} cy={y} r={18} fill={cfg?.canopyColors[0] ?? '#2d6a4f'} fillOpacity="0.3"
                    stroke={cfg?.canopyColors[1] ?? '#40916c'} strokeWidth="1.5" />
                  <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="14">
                    {cfg?.emoji ?? '🌳'}
                  </text>
                  <text x={x} y={y + 26} textAnchor="middle" fontSize="8" fill="#86efac" opacity="0.8">
                    {n.displayName.slice(0, 8)}
                  </text>
                </g>
              )
            })}

            {/* Centre (self) */}
            <circle cx={cx} cy={cy} r={26} fill={centerConfig.canopyColors[0]} fillOpacity="0.35"
              stroke={centerConfig.canopyColors[1]} strokeWidth="2" />
            <circle cx={cx} cy={cy} r={26} fill="none"
              stroke={centerConfig.canopyColors[1]} strokeWidth="1" strokeOpacity="0.4"
              strokeDasharray="4 4" />
            <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="20">
              {centerConfig.emoji}
            </text>
            <text x={cx} y={cy + 38} textAnchor="middle" fontSize="9" fill="#ffffff" opacity="0.7">
              {profile.displayName.slice(0, 10)}
            </text>
          </svg>
        </div>
      )}
    </div>
  )
}
