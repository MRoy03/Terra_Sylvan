'use client'

import { useState, useEffect, ComponentType } from 'react'
import type { BiomeType, TreeType } from '@/types'

interface ForestMember {
  uid:         string
  displayName: string
  treeType:    TreeType
  isOnline:    boolean
  scale:       number
}

interface ForestSceneProps {
  members:       ForestMember[]
  biomeType:     BiomeType
  communityName: string
  highlightUid?: string
  onTreeClick?:  (uid: string) => void
}

// No top-level R3F imports — deferred to useEffect so React is fully
// mounted before react-reconciler / R3F is evaluated.
export default function ForestScene(props: ForestSceneProps) {
  const [Scene, setScene] = useState<ComponentType<ForestSceneProps> | null>(null)

  useEffect(() => {
    import('./ForestSceneCanvas').then((mod) => {
      setScene(() => mod.default as ComponentType<ForestSceneProps>)
    })
  }, [])

  if (!Scene) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-forest-950">
        <div className="flex flex-col items-center gap-4">
          <div className="text-7xl animate-float">🌲</div>
          <p className="text-forest-400 animate-pulse">Growing forest…</p>
        </div>
      </div>
    )
  }

  return <Scene {...props} />
}
