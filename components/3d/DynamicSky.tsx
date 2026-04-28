'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky, Stars } from '@react-three/drei'
import * as THREE from 'three'
import type { WeatherCondition } from '@/lib/weather'
import type { BiomeType } from '@/types'

// ─── Sky phase config ─────────────────────────────────────────────────────────
function getSkyConfig(t: number) {
  if (t >= 5  && t < 7)  return { phase: 'dawn',  rayleigh: 6,   turbidity: 20, mieCoeff: 0.010, mieG: 0.9, azimuth: t / 24 }
  if (t >= 7  && t < 17) return { phase: 'day',   rayleigh: 1,   turbidity: 8,  mieCoeff: 0.004, mieG: 0.7, azimuth: t / 24 }
  if (t >= 17 && t < 20) return { phase: 'dusk',  rayleigh: 5,   turbidity: 20, mieCoeff: 0.010, mieG: 0.9, azimuth: t / 24 }
  return                         { phase: 'night', rayleigh: 0.5, turbidity: 2,  mieCoeff: 0.001, mieG: 0.5, azimuth: t / 24 }
}

// ─── Moon phase ───────────────────────────────────────────────────────────────
function getMoonPhase(): number {
  const KNOWN_NEW_MOON = new Date('2021-01-13T05:00:00Z').getTime()
  const LUNAR_MS = 29.53 * 24 * 60 * 60 * 1000
  return ((Date.now() - KNOWN_NEW_MOON) % LUNAR_MS) / LUNAR_MS
}

// ─── Visible Sun with glow corona ─────────────────────────────────────────────
function CelestialSun({ position, phase }: { position: [number, number, number]; phase: string }) {
  if (position[1] < 3) return null
  const isSunrise = phase === 'dawn'
  const isSunset  = phase === 'dusk'
  const coreColor  = isSunrise ? '#ffcc44' : isSunset ? '#ff7722' : '#fff8e0'
  const glowColor  = isSunrise ? '#ff9933' : isSunset ? '#ff4400' : '#ffee88'
  const r = (isSunrise || isSunset) ? 4.8 : 3.5

  return (
    <group position={position}>
      {/* Far outer atmosphere haze */}
      <mesh position={[0, 0, -0.4]}>
        <circleGeometry args={[r * 4.5, 32]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.04} depthWrite={false} />
      </mesh>
      {/* Outer glow ring */}
      <mesh position={[0, 0, -0.3]}>
        <circleGeometry args={[r * 2.8, 32]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.10} depthWrite={false} />
      </mesh>
      {/* Inner glow */}
      <mesh position={[0, 0, -0.2]}>
        <circleGeometry args={[r * 1.7, 32]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.22} depthWrite={false} />
      </mesh>
      {/* Core disc */}
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[r, 32]} />
        <meshBasicMaterial color={coreColor} transparent opacity={0.97} depthWrite={false} />
      </mesh>
      {/* Bright centre */}
      <mesh>
        <circleGeometry args={[r * 0.45, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ─── Moon with phase shadow + glow halo ───────────────────────────────────────
function Moon({ position }: { position: [number, number, number] }) {
  const phase   = getMoonPhase()
  const shadowX = Math.cos(phase * Math.PI * 2) * 3.6
  const opacity = phase < 0.05 || phase > 0.95 ? 0.1 : 1.0
  const moonR   = 3.8

  return (
    <group position={position}>
      {/* Outer atmospheric glow */}
      <mesh position={[0, 0, -0.3]}>
        <circleGeometry args={[moonR * 3.0, 32]} />
        <meshBasicMaterial color="#6878b0" transparent opacity={0.06} depthWrite={false} />
      </mesh>
      {/* Inner halo */}
      <mesh position={[0, 0, -0.2]}>
        <circleGeometry args={[moonR * 1.8, 32]} />
        <meshBasicMaterial color="#b0c0e0" transparent opacity={0.14} depthWrite={false} />
      </mesh>
      {/* Moon disc */}
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[moonR, 32]} />
        <meshBasicMaterial color="#e8e2d4" transparent opacity={opacity} depthWrite={false} />
      </mesh>
      {/* Crater texture suggestion — subtle darker circles */}
      {opacity > 0.3 && (
        <>
          <mesh position={[-1.2, 0.8, 0.01]}>
            <circleGeometry args={[0.55, 12]} />
            <meshBasicMaterial color="#ccc0b0" transparent opacity={opacity * 0.4} depthWrite={false} />
          </mesh>
          <mesh position={[0.9, -0.5, 0.01]}>
            <circleGeometry args={[0.35, 12]} />
            <meshBasicMaterial color="#ccc0b0" transparent opacity={opacity * 0.35} depthWrite={false} />
          </mesh>
          <mesh position={[0.1, 1.2, 0.01]}>
            <circleGeometry args={[0.25, 12]} />
            <meshBasicMaterial color="#ccc0b0" transparent opacity={opacity * 0.3} depthWrite={false} />
          </mesh>
        </>
      )}
      {/* Phase shadow overlay */}
      {opacity > 0.1 && phase < 0.95 && phase > 0.05 && (
        <mesh position={[shadowX, 0, 0.02]}>
          <circleGeometry args={[moonR * 1.03, 32]} />
          <meshBasicMaterial color="#070b18" transparent
            opacity={phase < 0.5 ? 0.92 - phase * 0.8 : 0.2 + (phase - 0.5) * 1.4}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}

// ─── Stylized illustrated cloud ───────────────────────────────────────────────
function StylizedCloud({ position, scale, opacity, isNight, speed = 1 }: {
  position: [number, number, number]
  scale:    number
  opacity:  number
  isNight:  boolean
  speed?:   number
}) {
  const ref = useRef<THREE.Group>(null!)

  // Fixed puff layout for illustrated look
  const puffs = useMemo(() => [
    { x: 0,            y: scale * 0.2,  r: scale * 1.25 },
    { x:  scale * 1.6, y: scale * 0.05, r: scale * 1.05 },
    { x: -scale * 1.4, y: 0,            r: scale * 0.95 },
    { x:  scale * 0.7, y: scale * 0.85, r: scale * 0.80 },
    { x: -scale * 0.6, y: scale * 0.75, r: scale * 0.70 },
    { x:  scale * 2.4, y: scale * 0.55, r: scale * 0.60 },
    { x: -scale * 2.2, y: scale * 0.45, r: scale * 0.55 },
  ], [scale])

  const topCol    = isNight ? '#4a526a' : '#f0f6ff'
  const shadowCol = isNight ? '#1e2438' : '#c8d8f0'

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.position.x += delta * 0.28 * speed
    if (ref.current.position.x > 100) ref.current.position.x = -100
  })

  return (
    <group ref={ref} position={position}>
      {/* Shadow layer (slightly below, darker) */}
      {puffs.map((p, i) => (
        <mesh key={`s${i}`} position={[p.x * 0.98, p.y - scale * 0.28, -0.08]}>
          <circleGeometry args={[p.r * 0.92, 14]} />
          <meshBasicMaterial color={shadowCol} transparent opacity={opacity * 0.42} depthWrite={false} />
        </mesh>
      ))}
      {/* Main body */}
      {puffs.map((p, i) => (
        <mesh key={`t${i}`} position={[p.x, p.y, 0]}>
          <circleGeometry args={[p.r, 14]} />
          <meshBasicMaterial color={topCol} transparent opacity={opacity} depthWrite={false} />
        </mesh>
      ))}
      {/* Highlight top — white sheen */}
      <mesh position={[0, scale * 0.55, 0.01]}>
        <circleGeometry args={[scale * 0.6, 12]} />
        <meshBasicMaterial color={isNight ? '#6070a0' : '#ffffff'} transparent opacity={opacity * 0.35} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Clouds({ condition, isNight }: { condition: WeatherCondition; isNight: boolean }) {
  const density = condition === 'clear' ? 0
    : condition === 'partly_cloudy' ? 4
    : condition === 'cloudy' || condition === 'fog' ? 11
    : 8
  const opacity = condition === 'fog' ? 0.90
    : condition === 'partly_cloudy' ? 0.78
    : 0.86

  const clouds = useMemo(() => Array.from({ length: Math.max(density, 0) }, (_, i) => ({
    x:     (i / Math.max(density, 1) - 0.5) * 180 + (Math.random() - 0.5) * 25,
    y:     20 + Math.random() * 20,
    z:     -25 + (Math.random() - 0.5) * 45,
    scale: 3.5 + Math.random() * 5.5,
    speed: 0.6 + Math.random() * 0.8,
  })), [density])

  if (density === 0) return null
  return (
    <>
      {clouds.map((c, i) => (
        <StylizedCloud key={i}
          position={[c.x, c.y, c.z]}
          scale={c.scale} opacity={opacity}
          isNight={isNight} speed={c.speed}
        />
      ))}
    </>
  )
}

// ─── Background silhouette scenery (2D illustrated style) ─────────────────────
const BIOME_SCENERY: Record<BiomeType, { layers: { color: string; peaks: { x: number; h: number; w: number }[] }[] }> = {
  temperate: { layers: [
    { color: '#0e1e10', peaks: [{ x:-100, h:55, w:50 },{ x:-30, h:68, w:55 },{ x:35, h:52, w:45 },{ x:100, h:62, w:52 },{ x:-160, h:40, w:38 },{ x:160, h:44, w:40 }] },
    { color: '#162814', peaks: [{ x:-65, h:38, w:38 },{ x:5, h:48, w:42 },{ x:70, h:34, w:32 },{ x:-130, h:28, w:30 },{ x:130, h:36, w:34 }] },
    { color: '#1a3a1c', peaks: [{ x:-40, h:22, w:30 },{ x:15, h:28, w:34 },{ x:65, h:20, w:26 },{ x:-90, h:16, w:24 },{ x:95, h:24, w:28 }] },
  ]},
  mountain: { layers: [
    { color: '#0c1420', peaks: [{ x:-90, h:72, w:55 },{ x:-20, h:88, w:65 },{ x:45, h:65, w:52 },{ x:110, h:78, w:60 },{ x:-160, h:50, w:44 }] },
    { color: '#1a2535', peaks: [{ x:-60, h:48, w:42 },{ x:15, h:58, w:48 },{ x:75, h:42, w:38 },{ x:-120, h:35, w:34 },{ x:135, h:44, w:38 }] },
    { color: '#2a3a48', peaks: [{ x:-40, h:28, w:32 },{ x:20, h:35, w:36 },{ x:70, h:24, w:28 },{ x:-85, h:20, w:26 },{ x:100, h:28, w:30 }] },
  ]},
  tropical: { layers: [
    { color: '#071508', peaks: [{ x:-95, h:60, w:58 },{ x:-15, h:75, w:62 },{ x:40, h:55, w:50 },{ x:105, h:68, w:56 },{ x:-155, h:45, w:42 }] },
    { color: '#0e2810', peaks: [{ x:-60, h:42, w:42 },{ x:10, h:52, w:46 },{ x:68, h:36, w:34 },{ x:-120, h:30, w:30 },{ x:128, h:38, w:36 }] },
    { color: '#143c16', peaks: [{ x:-38, h:26, w:32 },{ x:18, h:32, w:36 },{ x:62, h:22, w:28 },{ x:-88, h:18, w:24 },{ x:92, h:26, w:28 }] },
  ]},
  arid: { layers: [
    { color: '#1a100a', peaks: [{ x:-80, h:38, w:65 },{ x:10, h:50, w:75 },{ x:85, h:32, w:58 },{ x:-150, h:28, w:50 },{ x:155, h:34, w:55 }] },
    { color: '#2a1a0e', peaks: [{ x:-55, h:25, w:50 },{ x:20, h:32, w:60 },{ x:72, h:22, w:45 },{ x:-110, h:18, w:38 },{ x:118, h:24, w:44 }] },
    { color: '#3c2a18', peaks: [{ x:-38, h:15, w:38 },{ x:15, h:20, w:42 },{ x:60, h:14, w:32 },{ x:-80, h:12, w:28 },{ x:85, h:16, w:32 }] },
  ]},
  mediterranean: { layers: [
    { color: '#12100e', peaks: [{ x:-85, h:45, w:60 },{ x:5, h:58, w:68 },{ x:80, h:40, w:54 },{ x:-145, h:32, w:46 },{ x:148, h:38, w:50 }] },
    { color: '#1e1c18', peaks: [{ x:-58, h:30, w:45 },{ x:18, h:38, w:50 },{ x:70, h:26, w:40 },{ x:-112, h:22, w:36 },{ x:120, h:28, w:38 }] },
    { color: '#2e2820', peaks: [{ x:-40, h:18, w:34 },{ x:16, h:24, w:38 },{ x:64, h:16, w:30 },{ x:-84, h:14, w:26 },{ x:88, h:18, w:28 }] },
  ]},
  mangrove: { layers: [
    { color: '#050e10', peaks: [{ x:-88, h:42, w:55 },{ x:5, h:52, w:60 },{ x:82, h:36, w:50 },{ x:-148, h:30, w:44 },{ x:150, h:38, w:46 }] },
    { color: '#0a1a1e', peaks: [{ x:-58, h:28, w:40 },{ x:15, h:36, w:45 },{ x:68, h:24, w:36 },{ x:-112, h:20, w:32 },{ x:118, h:26, w:34 }] },
    { color: '#0e2828', peaks: [{ x:-38, h:16, w:30 },{ x:14, h:22, w:34 },{ x:60, h:14, w:26 },{ x:-82, h:12, w:22 },{ x:84, h:16, w:26 }] },
  ]},
  tundra: { layers: [
    { color: '#0c1218', peaks: [{ x:-90, h:35, w:62 },{ x:5, h:44, w:70 },{ x:85, h:30, w:55 },{ x:-148, h:25, w:48 },{ x:152, h:32, w:52 }] },
    { color: '#161e28', peaks: [{ x:-60, h:22, w:48 },{ x:18, h:28, w:54 },{ x:72, h:18, w:40 },{ x:-114, h:15, w:36 },{ x:120, h:20, w:38 }] },
    { color: '#202c38', peaks: [{ x:-40, h:12, w:36 },{ x:16, h:16, w:40 },{ x:62, h:10, w:28 },{ x:-84, h:8,  w:26 },{ x:86, h:12, w:30 }] },
  ]},
}

const LAYER_Z  = [-150, -100, -58]
const LAYER_Y  = [-10,  -6,   -3]

function BackgroundScenery({ biomeType = 'temperate' }: { biomeType: BiomeType }) {
  const scenery = BIOME_SCENERY[biomeType] ?? BIOME_SCENERY.temperate

  return (
    <group>
      {scenery.layers.map((layer, li) => (
        <group key={li} position={[0, LAYER_Y[li], LAYER_Z[li]]}>
          {layer.peaks.map((peak, pi) => (
            <mesh key={pi} position={[peak.x, peak.h / 2, 0]}>
              <coneGeometry args={[peak.w, peak.h, 5]} />
              <meshBasicMaterial color={layer.color} />
            </mesh>
          ))}
          {/* Ground fill so no gap at base of mountains */}
          <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[600, 30]} />
            <meshBasicMaterial color={layer.color} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── Rain ─────────────────────────────────────────────────────────────────────
function Rain({ heavy }: { heavy: boolean }) {
  const count = heavy ? 900 : 400
  const ref   = useRef<THREE.InstancedMesh>(null!)
  const data  = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 55,
    y: Math.random() * 38,
    z: (Math.random() - 0.5) * 55,
    speed: 0.28 + Math.random() * 0.22,
  })), [count])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((_, delta) => {
    if (!ref.current) return
    data.forEach((d, i) => {
      d.y -= d.speed * delta * 60
      if (d.y < -1) d.y = 38
      dummy.position.set(d.x, d.y, d.z)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[0.011, 0.011, 0.55, 3]} />
      <meshBasicMaterial color="#b0ccee" transparent opacity={0.52} />
    </instancedMesh>
  )
}

// ─── Snow ─────────────────────────────────────────────────────────────────────
function Snow({ heavy }: { heavy: boolean }) {
  const count = heavy ? 650 : 280
  const ref   = useRef<THREE.InstancedMesh>(null!)
  const data  = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 55,
    y: Math.random() * 38,
    z: (Math.random() - 0.5) * 55,
    speed: 0.025 + Math.random() * 0.045,
    drift: Math.random() * Math.PI * 2,
    driftSpeed: 0.25 + Math.random() * 0.5,
  })), [count])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state, delta) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    data.forEach((d, i) => {
      d.y -= d.speed * delta * 60
      d.x += Math.sin(t * d.driftSpeed + d.drift) * 0.013
      if (d.y < -1) { d.y = 38; d.x = (Math.random() - 0.5) * 55 }
      dummy.position.set(d.x, d.y, d.z)
      dummy.scale.setScalar(0.07 + Math.random() * 0.06)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshBasicMaterial color="#e8f4ff" transparent opacity={0.82} />
    </instancedMesh>
  )
}

// ─── Constellations ───────────────────────────────────────────────────────────
const ORION: { stars: [number,number,number][]; lines: [number,number][] } = {
  stars: [[-3,6,0],[3,6,0],[-1.5,4,0],[0,4,0],[1.5,4,0],[-3,2,0],[3,2,0]],
  lines: [[0,2],[1,2],[2,3],[3,4],[0,5],[1,6],[5,6]],
}
const URSA_MAJOR: { stars: [number,number,number][]; lines: [number,number][] } = {
  stars: [[0,0,0],[2,0.5,0],[4,0.8,0],[6,0.5,0],[6.8,2,0],[5,2.5,0],[4,4,0]],
  lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
}

function Constellation({ data, offset }: { data: typeof ORION; offset: [number,number,number] }) {
  const lineGeo = useMemo(() => {
    const positions: number[] = []
    data.lines.forEach(([a, b]) => {
      const sa = data.stars[a], sb = data.stars[b]
      positions.push(
        sa[0]+offset[0], sa[1]+offset[1], sa[2]+offset[2],
        sb[0]+offset[0], sb[1]+offset[1], sb[2]+offset[2],
      )
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [data, offset])

  return (
    <group>
      {data.stars.map((s, i) => (
        <mesh key={i} position={[s[0]+offset[0], s[1]+offset[1], s[2]+offset[2]]}>
          <sphereGeometry args={[0.20, 5, 5]} />
          <meshBasicMaterial color="#dce8ff" />
        </mesh>
      ))}
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color="#5868a0" transparent opacity={0.38} />
      </lineSegments>
    </group>
  )
}

// ─── Fireflies ────────────────────────────────────────────────────────────────
function Fireflies() {
  const positions = useMemo(() => Array.from({ length: 35 }, () => ({
    x: (Math.random() - 0.5) * 22, y: 0.4 + Math.random() * 4.5,
    z: (Math.random() - 0.5) * 22, phase: Math.random() * Math.PI * 2,
  })), [])
  const ref = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    ref.current.children.forEach((mesh, i) => {
      const p = positions[i]
      ;(mesh as THREE.Mesh).visible = Math.sin(t * 1.8 + p.phase) > 0.25
    })
  })

  return (
    <group ref={ref}>
      {positions.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.045, 5, 5]} />
          <meshBasicMaterial color="#c8ff55" />
        </mesh>
      ))}
    </group>
  )
}

// ─── Main DynamicSky ─────────────────────────────────────────────────────────
interface DynamicSkyProps {
  weatherCondition?: WeatherCondition
  biomeType?:        BiomeType
}

export function DynamicSky({ weatherCondition = 'clear', biomeType = 'temperate' }: DynamicSkyProps) {
  const now     = new Date()
  const t       = now.getHours() + now.getMinutes() / 60
  const cfg     = getSkyConfig(t)
  const isNight = cfg.phase === 'night'

  const elevation = Math.sin(((t - 6) / 12) * Math.PI) * 90
  const sunPos = useMemo((): [number, number, number] => {
    const rad = (elevation * Math.PI) / 180
    const az  = cfg.azimuth * Math.PI * 2
    return [Math.cos(rad) * Math.cos(az) * 100, Math.sin(rad) * 100, Math.cos(rad) * Math.sin(az) * 100]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elevation, cfg.azimuth])

  const sunIntensity     = Math.max(0.05, Math.sin(((t - 6) / 12) * Math.PI))
  const ambientIntensity = isNight ? 0.08 : cfg.phase === 'dawn' || cfg.phase === 'dusk' ? 0.25 : 0.42
  const isRainy  = weatherCondition === 'rain' || weatherCondition === 'heavy_rain' || weatherCondition === 'drizzle' || weatherCondition === 'storm'
  const isSnowy  = weatherCondition === 'snow' || weatherCondition === 'heavy_snow'
  const season   = getCurrentSeason_local()
  const showConstellations = isNight && (season === 'winter' || season === 'autumn')

  return (
    <>
      {isNight && <color attach="background" args={['#040910']} />}

      {!isNight && (
        <Sky distance={450000} sunPosition={sunPos}
          rayleigh={cfg.rayleigh}
          turbidity={isRainy ? 22 : cfg.turbidity}
          mieCoefficient={cfg.mieCoeff}
          mieDirectionalG={cfg.mieG}
        />
      )}

      {/* Layered 2D illustrated background scenery */}
      <BackgroundScenery biomeType={biomeType} />

      {/* Celestial bodies */}
      {!isNight && !isRainy && <CelestialSun position={sunPos} phase={cfg.phase} />}
      {isNight && <Moon position={[-28, 42, -85]} />}

      {(isNight || cfg.phase === 'dawn' || cfg.phase === 'dusk') && (
        <Stars radius={125} depth={65} count={isNight ? 7000 : 1800} factor={4.2} saturation={0} fade speed={0.35} />
      )}

      {showConstellations && (
        <group position={[0, 0, -155]}>
          <Constellation data={ORION}      offset={[-22, 28, 0]} />
          <Constellation data={URSA_MAJOR} offset={[26,  36, 0]} />
        </group>
      )}

      {/* Stylized illustrated clouds */}
      <Clouds condition={weatherCondition} isNight={isNight} />

      {isRainy && <Rain heavy={weatherCondition === 'heavy_rain' || weatherCondition === 'storm'} />}
      {isSnowy && <Snow heavy={weatherCondition === 'heavy_snow'} />}

      {/* Lighting */}
      <directionalLight
        position={isNight ? [-28, 42, -85] : sunPos}
        intensity={isNight ? 0.18 : isRainy ? sunIntensity * 0.55 : sunIntensity * 1.55}
        color={cfg.phase === 'dawn' ? '#ffb855' : cfg.phase === 'dusk' ? '#ff6a30' : isNight ? '#c0d0ff' : '#fffde8'}
        castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-far={85} shadow-camera-left={-22}
        shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-22}
      />
      <ambientLight
        intensity={isRainy ? ambientIntensity * 0.55 : ambientIntensity}
        color={isNight ? '#1a2045' : isRainy ? '#8895a8' : '#ffffff'}
      />
      <hemisphereLight
        args={[isNight ? '#0a1032' : '#87CEEB', isNight ? '#050810' : '#3d2c20', isNight ? 0.1 : 0.32]}
      />

      {isNight && !isRainy && !isSnowy && <Fireflies />}
    </>
  )
}

function getCurrentSeason_local() {
  const m = new Date().getMonth()
  if (m >= 2 && m <= 4) return 'spring'
  if (m >= 5 && m <= 7) return 'summer'
  if (m >= 8 && m <= 10) return 'autumn'
  return 'winter'
}
