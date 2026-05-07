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
      {/* Crater texture suggestion */}
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

// ─── Background Clouds (painted into sky at z=-130) ───────────────────────────
function BackgroundClouds({ condition, isNight }: { condition: WeatherCondition; isNight: boolean }) {
  const count = condition === 'clear' ? 0 : condition === 'partly_cloudy' ? 7 : 14

  const clouds = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: (i / Math.max(count, 1) - 0.5) * 300 + (Math.random() - 0.5) * 40,
    y: 30 + Math.random() * 28,
    scale: 8 + Math.random() * 14,
    opacity: 0.55 + Math.random() * 0.3,
  })), [count])

  if (count === 0) return null
  const topCol    = isNight ? '#3a4460' : '#e8f0ff'
  const shadowCol = isNight ? '#1a2035' : '#b8c8e0'

  return (
    <group position={[0, 0, -130]}>
      {clouds.map((c, ci) => {
        const puffs = [
          { dx: 0,             dy: c.scale * 0.2,  r: c.scale * 1.3 },
          { dx: c.scale * 1.7, dy: 0,              r: c.scale * 1.0 },
          { dx: -c.scale * 1.5, dy: 0,             r: c.scale * 0.9 },
          { dx: c.scale * 0.8, dy: c.scale * 0.9,  r: c.scale * 0.7 },
          { dx: -c.scale * 0.7, dy: c.scale * 0.8, r: c.scale * 0.6 },
        ]
        return (
          <group key={ci} position={[c.x, c.y, 0]}>
            {puffs.map((p, pi) => (
              <mesh key={`s${pi}`} position={[p.dx, p.dy - c.scale * 0.25, -0.1]}>
                <circleGeometry args={[p.r * 0.9, 12]} />
                <meshBasicMaterial color={shadowCol} transparent opacity={c.opacity * 0.35} depthWrite={false} />
              </mesh>
            ))}
            {puffs.map((p, pi) => (
              <mesh key={`t${pi}`} position={[p.dx, p.dy, 0]}>
                <circleGeometry args={[p.r, 14]} />
                <meshBasicMaterial color={topCol} transparent opacity={c.opacity} depthWrite={false} />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}

// ─── Smooth mountain ridge geometry helper ────────────────────────────────────
function useMountainGeo(ridgePoints: [number, number][], baseY = -15, width = 380) {
  return useMemo(() => {
    const sorted = [...ridgePoints].sort((a, b) => a[0] - b[0])
    const shape  = new THREE.Shape()
    shape.moveTo(-width / 2, baseY)
    shape.lineTo(sorted[0][0], sorted[0][1])
    for (let i = 0; i < sorted.length - 1; i++) {
      const p0  = i > 0 ? sorted[i - 1] : sorted[i]
      const p1  = sorted[i]
      const p2  = sorted[i + 1]
      const p3  = i < sorted.length - 2 ? sorted[i + 2] : p2
      const cp1x = p1[0] + (p2[0] - p0[0]) / 5
      const cp1y = p1[1] + (p2[1] - p0[1]) / 5
      const cp2x = p2[0] - (p3[0] - p1[0]) / 5
      const cp2y = p2[1] - (p3[1] - p1[1]) / 5
      shape.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1])
    }
    shape.lineTo(width / 2, baseY)
    shape.lineTo(width / 2, baseY - 60)
    shape.lineTo(-width / 2, baseY - 60)
    return new THREE.ShapeGeometry(shape, 40)
  }, [ridgePoints, baseY, width])
}

// ─── Per-biome ridge layer data ───────────────────────────────────────────────
type RidgeLayer = {
  z: number
  y: number
  color: string
  points: [number, number][]
  hazeColor?: string
}

const BIOME_LAYERS: Record<BiomeType, RidgeLayer[]> = {
  temperate: [
    {
      z: -160, y: 2, color: '#0a1a0c', hazeColor: '#1a2a1a',
      points: [[-180,0],[-120,42],[-70,55],[-20,38],[30,60],[80,45],[140,52],[180,38]],
    },
    {
      z: -110, y: 0, color: '#0e2410', hazeColor: '#182818',
      points: [[-180,0],[-130,30],[-75,42],[-25,28],[20,45],[75,32],[135,38],[180,25]],
    },
    {
      z: -65, y: -1, color: '#122c14', hazeColor: '#1e3020',
      points: [[-180,0],[-120,18],[-65,28],[-15,16],[25,32],[80,20],[130,24],[180,14]],
    },
    {
      z: -30, y: -2, color: '#162e16',
      points: [[-180,0],[-110,10],[-55,16],[-10,8],[30,18],[85,12],[140,14],[180,8]],
    },
  ],
  mountain: [
    {
      z: -160, y: 4, color: '#0a0f18', hazeColor: '#10182a',
      points: [[-180,0],[-110,60],[-70,82],[-30,55],[15,72],[60,88],[110,65],[160,70],[180,50]],
    },
    {
      z: -110, y: 2, color: '#141e30', hazeColor: '#182234',
      points: [[-180,0],[-115,40],[-75,58],[-35,35],[10,50],[65,62],[115,45],[165,48],[180,32]],
    },
    {
      z: -65, y: 0, color: '#1a2838', hazeColor: '#1e2c3c',
      points: [[-180,0],[-120,22],[-80,35],[-40,18],[5,28],[70,38],[120,26],[165,28],[180,18]],
    },
    {
      z: -30, y: -1, color: '#0e1a14',
      points: [[-180,0],[-110,10],[-60,16],[-20,8],[30,20],[90,13],[145,16],[180,8]],
    },
  ],
  tropical: [
    {
      z: -160, y: 2, color: '#040e06', hazeColor: '#0a180a',
      points: [[-180,0],[-120,50],[-65,65],[-15,42],[30,58],[85,50],[140,60],[180,45]],
    },
    {
      z: -110, y: 0, color: '#081408', hazeColor: '#101c10',
      points: [[-180,0],[-125,35],[-70,48],[-18,28],[25,42],[80,36],[138,44],[180,30]],
    },
    {
      z: -65, y: -1, color: '#0c1e0c', hazeColor: '#162416',
      points: [[-180,0],[-115,20],[-60,30],[-10,16],[28,28],[85,22],[140,26],[180,16]],
    },
    {
      z: -30, y: -2, color: '#102414',
      points: [[-180,0],[-108,10],[-50,16],[-5,8],[32,16],[88,12],[145,14],[180,8]],
    },
  ],
  arid: [
    {
      z: -160, y: 2, color: '#150a05', hazeColor: '#201208',
      points: [[-180,0],[-140,30],[-120,30],[-100,0],[-50,38],[-20,38],[10,0],[50,28],[80,28],[120,0],[155,22],[180,22]],
    },
    {
      z: -110, y: 0, color: '#1e1008', hazeColor: '#28180c',
      points: [[-180,0],[-145,20],[-125,20],[-105,0],[-55,26],[-25,26],[5,0],[45,18],[85,18],[125,0],[160,15],[180,15]],
    },
    {
      z: -65, y: -1, color: '#28180c', hazeColor: '#301e10',
      points: [[-180,0],[-120,10],[-60,14],[-10,8],[30,12],[85,9],[140,11],[180,6]],
    },
    {
      z: -30, y: -2, color: '#1e1208',
      points: [[-180,0],[-110,5],[-55,8],[-8,4],[32,6],[88,5],[145,7],[180,4]],
    },
  ],
  mediterranean: [
    {
      z: -160, y: 1, color: '#100e08', hazeColor: '#1a1810',
      points: [[-180,0],[-115,38],[-65,48],[-15,30],[25,42],[80,36],[140,44],[180,28]],
    },
    {
      z: -110, y: 0, color: '#1a1810', hazeColor: '#221e14',
      points: [[-180,0],[-120,25],[-68,32],[-18,18],[20,28],[78,24],[138,28],[180,16]],
    },
    {
      z: -65, y: -1, color: '#221e14', hazeColor: '#282418',
      points: [[-180,0],[-115,12],[-60,16],[-12,8],[25,14],[82,10],[140,12],[180,7]],
    },
    {
      z: -30, y: -2, color: '#1c1a10',
      points: [[-180,0],[-108,6],[-52,8],[-8,4],[30,6],[88,5],[145,6],[180,3]],
    },
  ],
  tundra: [
    {
      z: -160, y: 1, color: '#0c1018', hazeColor: '#141820',
      points: [[-180,0],[-120,18],[-65,22],[-15,14],[25,20],[80,16],[140,18],[180,12]],
    },
    {
      z: -110, y: 0, color: '#141824', hazeColor: '#1c2030',
      points: [[-180,0],[-120,10],[-65,13],[-15,8],[25,11],[80,9],[140,11],[180,7]],
    },
    {
      z: -65, y: -1, color: '#1c2030', hazeColor: '#202438',
      points: [[-180,0],[-115,5],[-58,7],[-10,4],[28,6],[85,4],[142,6],[180,3]],
    },
    {
      z: -30, y: -2, color: '#202838',
      points: [[-180,0],[-110,3],[-55,4],[-8,2],[30,3],[88,2],[145,3],[180,2]],
    },
  ],
  mangrove: [
    {
      z: -160, y: 1, color: '#040a10', hazeColor: '#0c1418',
      points: [[-180,0],[-120,30],[-65,38],[-15,24],[25,34],[80,28],[140,32],[180,22]],
    },
    {
      z: -110, y: 0, color: '#081418', hazeColor: '#101e20',
      points: [[-180,0],[-120,18],[-65,24],[-15,14],[25,20],[80,16],[140,20],[180,12]],
    },
    {
      z: -65, y: -1, color: '#0c1e1e', hazeColor: '#142828',
      points: [[-180,0],[-115,8],[-58,12],[-10,6],[28,10],[85,7],[142,9],[180,5]],
    },
    {
      z: -30, y: -2, color: '#102828',
      points: [[-180,0],[-110,4],[-55,6],[-8,3],[30,5],[88,3],[145,5],[180,3]],
    },
  ],
}

// ─── Individual ridge layer rendered as ShapeGeometry ─────────────────────────
function RidgeLayer({ layer }: { layer: RidgeLayer }) {
  const geo = useMountainGeo(layer.points, -15, 380)
  return (
    <group position={[0, layer.y, layer.z]}>
      <mesh geometry={geo}>
        <meshBasicMaterial color={layer.color} side={THREE.DoubleSide} depthWrite={true} />
      </mesh>
      {/* Ground fill — no gap at base */}
      <mesh position={[0, -15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[600, 80]} />
        <meshBasicMaterial color={layer.color} depthWrite={true} />
      </mesh>
    </group>
  )
}

// ─── Background scenery — smooth bezier silhouettes per biome ─────────────────
function BackgroundScenery({ biomeType = 'temperate' }: { biomeType: BiomeType }) {
  const layers = BIOME_LAYERS[biomeType] ?? BIOME_LAYERS.temperate

  return (
    <group>
      {layers.map((layer, li) => (
        <group key={li}>
          <RidgeLayer layer={layer} />
          {/* Atmospheric haze plane between layers (skip the last/nearest) */}
          {layer.hazeColor && li < layers.length - 1 && (
            <mesh
              position={[0, layer.y + 5, layer.z + 10]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[600, 80]} />
              <meshBasicMaterial
                color={layer.hazeColor}
                transparent
                opacity={0.12}
                depthWrite={false}
              />
            </mesh>
          )}
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

      {/* Layered 2D illustrated background scenery — smooth bezier ridges */}
      <BackgroundScenery biomeType={biomeType} />

      {/* Background clouds painted into the sky panorama */}
      <BackgroundClouds condition={weatherCondition} isNight={isNight} />

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
