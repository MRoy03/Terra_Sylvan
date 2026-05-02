'use client'

import { useState, useEffect, ComponentType } from 'react'
import type { TreeStats, TreeType, BiomeType } from '@/types'
import type { AnimalType } from './AnimalCompanion'

interface TreeSceneProps {
  stats:       TreeStats
  displayName: string
  status:      string
  photoURL:    string | null
  treeType:    TreeType
  biomeType?:  BiomeType
  animal?:     AnimalType
}

export default function TreeScene(props: TreeSceneProps) {
  const [Scene, setScene] = useState<ComponentType<TreeSceneProps> | null>(null)

  useEffect(() => {
    import('./TreeSceneCanvas').then((mod) => {
      setScene(() => mod.default as ComponentType<TreeSceneProps>)
    })
  }, [])

  if (!Scene) {
    return (
      <div className="w-full h-full forest-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-7xl animate-float">🌱</div>
          <p className="text-forest-400 animate-pulse">Growing your tree…</p>
        </div>
      </div>
    )
  }

  return <Scene {...props} />
}
