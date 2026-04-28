'use client'

import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Loader } from '@react-three/drei'
import { Tree } from './Tree'
import { DynamicSky } from './DynamicSky'
import { Ground } from './Ground'
import { TreeStats, TreeType, BiomeType, TREE_BIOME_MAP } from '@/types'
import { useWeather, WEATHER_ICON, WeatherCondition } from '@/lib/weather'
import { getCurrentSeason, SEASON_LABEL } from '@/lib/seasons'

interface TreeSceneProps {
  stats:       TreeStats
  displayName: string
  status:      string
  photoURL:    string | null
  treeType:    TreeType
  biomeType?:  BiomeType
}

// ─── Weather HUD ──────────────────────────────────────────────────────────────
function WeatherHUD({ treeType }: { treeType: TreeType }) {
  const weather = useWeather()
  const season  = getCurrentSeason()
  const [tick, setTick]   = useState(0)

  // Re-render every minute to keep clock current
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const now     = new Date()
  const hour    = now.getHours()
  const min     = now.getMinutes()
  const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
  const ampm    = hour >= 12 ? 'PM' : 'AM'
  const hour12  = hour % 12 || 12

  const timePhase =
    hour >= 5  && hour < 8  ? { emoji: '🌅', label: 'Dawn',    color: 'text-orange-300' } :
    hour >= 8  && hour < 12 ? { emoji: '☀️',  label: 'Morning', color: 'text-yellow-200' } :
    hour >= 12 && hour < 17 ? { emoji: '🌤️', label: 'Afternoon',color: 'text-sky-200'   } :
    hour >= 17 && hour < 20 ? { emoji: '🌆', label: 'Dusk',    color: 'text-orange-400' } :
                              { emoji: '🌙', label: 'Night',   color: 'text-indigo-300' }

  const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

  const conditionLabel = weather.condition.replace(/_/g, ' ')

  // Comfort description
  const comfort =
    weather.temperature === null   ? '' :
    weather.temperature < 0        ? '🥶 Freezing'  :
    weather.temperature < 10       ? '🧥 Cold'       :
    weather.temperature < 18       ? '🌬️ Cool'       :
    weather.temperature < 26       ? '😊 Comfortable':
    weather.temperature < 32       ? '🌡️ Warm'       :
                                     '🔥 Hot'

  return (
    <div className="absolute top-16 right-3 z-30 flex flex-col gap-2 pointer-events-none select-none max-w-[180px]">
      {/* ── Time card ── */}
      <div className="hud-card">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl leading-none">{timePhase.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className={`font-mono font-bold text-xl leading-tight ${timePhase.color}`}>
              {String(hour12).padStart(2, '0')}:{String(min).padStart(2, '0')}
              <span className="text-xs font-normal ml-1 text-white/50">{ampm}</span>
            </div>
            <div className="text-[10px] text-white/45 leading-tight">{dateStr}</div>
          </div>
        </div>
        <div className="mt-1.5 pt-1.5 border-t border-white/8">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40">{timePhase.label}</span>
            <span className="text-[10px] text-white/60">{SEASON_LABEL[season]}</span>
          </div>
          {/* Daylight progress bar */}
          <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-400 transition-all"
              style={{ width: `${Math.max(2, Math.min(98, ((hour - 5) / 14) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Weather card ── */}
      {!weather.loading && (
        <div className="hud-card">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl leading-none">{WEATHER_ICON[weather.condition]}</span>
            <div className="flex-1 min-w-0">
              {weather.temperature !== null && (
                <div className="font-mono font-bold text-2xl leading-tight text-white">
                  {weather.temperature}
                  <span className="text-sm font-normal text-white/60">°C</span>
                </div>
              )}
              <div className="text-[11px] text-white/65 capitalize leading-tight">{conditionLabel}</div>
            </div>
          </div>
          {comfort && (
            <div className="mt-1.5 pt-1.5 border-t border-white/8 text-[10px] text-white/50">
              {comfort}
            </div>
          )}
        </div>
      )}

      {weather.loading && (
        <div className="hud-card flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border border-white/30 border-t-white/80 animate-spin" />
          <span className="text-[10px] text-white/40">Loading weather…</span>
        </div>
      )}
    </div>
  )
}

// ─── Canvas ───────────────────────────────────────────────────────────────────
export default function TreeSceneCanvas({ stats, displayName, status, photoURL, treeType, biomeType }: TreeSceneProps) {
  const biome = biomeType ?? TREE_BIOME_MAP[treeType] ?? 'temperate'
  const { condition } = useWeather()
  const camDistance   = 4 + stats.scale * 4

  return (
    <div className="w-full h-full relative">
      <Canvas shadows gl={{ antialias: true, alpha: false }} dpr={[1, 2]} style={{ background: '#040910' }}>
        <Suspense fallback={null}>
          <DynamicSky weatherCondition={condition} biomeType={biome} />
          <Ground biomeType={biome} />
          <Tree stats={stats} displayName={displayName} status={status} photoURL={photoURL} treeType={treeType} />

          <PerspectiveCamera makeDefault
            position={[camDistance * 0.7, stats.scale * 2.5, camDistance]}
            fov={55} near={0.1} far={500} />

          <OrbitControls enablePan={false}
            minPolarAngle={Math.PI / 8} maxPolarAngle={Math.PI / 2.1}
            minDistance={3} maxDistance={25}
            autoRotate autoRotateSpeed={0.4} enableDamping dampingFactor={0.08} />

          <fog attach="fog" args={['#0a1a08', 35, 120]} />
        </Suspense>
      </Canvas>

      <WeatherHUD treeType={treeType} />

      <Loader
        containerStyles={{ background: '#040d08' }}
        innerStyles={{ background: '#14532d' }}
        barStyles={{ background: '#4ade80' }}
        dataStyles={{ color: '#86efac', fontFamily: 'monospace' }}
        dataInterpolation={(p) => `Growing your forest… ${p.toFixed(0)}%`}
      />
    </div>
  )
}
