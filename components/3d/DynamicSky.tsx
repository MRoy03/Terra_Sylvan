'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
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
  const isDawn   = phase === 'dawn'
  const isDusk   = phase === 'dusk'
  const coreCol  = isDawn ? '#ffe0a0' : isDusk ? '#ff8c40' : '#fff8e8'
  const glowCol  = isDawn ? '#ff9933' : isDusk ? '#ff4400' : '#ffdd66'
  const rayCol   = isDawn ? '#ff8820' : isDusk ? '#cc3300' : '#ffcc44'
  const r        = (isDawn || isDusk) ? 5.5 : 3.8

  const rays = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    angle: (i / 12) * Math.PI * 2,
    len: r * (1.8 + (i % 3) * 0.4),
    w: 0.12 + (i % 2) * 0.06,
  })), [r])

  return (
    <group position={position}>
      {/* Wide diffuse atmosphere */}
      <mesh position={[0, 0, -0.5]}>
        <circleGeometry args={[r * 6, 32]} />
        <meshBasicMaterial color={glowCol} transparent opacity={0.025} depthWrite={false} />
      </mesh>
      {/* Outer corona */}
      <mesh position={[0, 0, -0.4]}>
        <circleGeometry args={[r * 3.2, 32]} />
        <meshBasicMaterial color={glowCol} transparent opacity={0.07} depthWrite={false} />
      </mesh>
      {/* Mid glow */}
      <mesh position={[0, 0, -0.3]}>
        <circleGeometry args={[r * 1.9, 32]} />
        <meshBasicMaterial color={glowCol} transparent opacity={0.16} depthWrite={false} />
      </mesh>
      {/* Inner glow */}
      <mesh position={[0, 0, -0.2]}>
        <circleGeometry args={[r * 1.3, 32]} />
        <meshBasicMaterial color={coreCol} transparent opacity={0.28} depthWrite={false} />
      </mesh>
      {/* Solar disc */}
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[r, 48]} />
        <meshBasicMaterial color={coreCol} transparent opacity={0.96} depthWrite={false} />
      </mesh>
      {/* Bright limb centre */}
      <mesh>
        <circleGeometry args={[r * 0.38, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.88} depthWrite={false} />
      </mesh>
      {/* Light rays */}
      {rays.map((ray, i) => (
        <mesh key={i} position={[0, 0, -0.15]}
          rotation={[0, 0, ray.angle]}>
          <planeGeometry args={[ray.w, ray.len]} />
          <meshBasicMaterial color={rayCol} transparent opacity={0.06 + (i % 3) * 0.02} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Moon with phase shadow + glow halo ───────────────────────────────────────
function Moon({ position }: { position: [number, number, number] }) {
  const phase   = getMoonPhase()
  const opacity = phase < 0.05 || phase > 0.95 ? 0.12 : 1.0
  const moonR   = 4.2

  // Canvas-generated moon surface texture with maria (lunar seas)
  const moonTex = useMemo(() => {
    const c2 = document.createElement('canvas')
    c2.width = 256; c2.height = 256
    const ctx2 = c2.getContext('2d')!
    // Base warm-grey disc
    const grad = ctx2.createRadialGradient(128, 118, 10, 128, 128, 128)
    grad.addColorStop(0, '#f0ece0')
    grad.addColorStop(0.6, '#d8d0c0')
    grad.addColorStop(1, '#b0a890')
    ctx2.fillStyle = grad; ctx2.beginPath(); ctx2.arc(128,128,126,0,Math.PI*2); ctx2.fill()
    // Maria (dark regions) — simplified but recognizable
    const maria = [
      { x: 100, y: 90, rx: 38, ry: 28, a: -0.3, col: 'rgba(80,72,60,0.55)' },   // Mare Imbrium
      { x: 150, y: 100, rx: 22, ry: 18, a: 0.2, col: 'rgba(70,65,55,0.50)' },   // Mare Serenitatis
      { x: 160, y: 130, rx: 28, ry: 20, a: 0.1, col: 'rgba(75,68,58,0.45)' },   // Mare Tranquillitatis
      { x: 100, y: 155, rx: 32, ry: 18, a: -0.2, col: 'rgba(68,62,52,0.40)' },  // Oceanus Procellarum
      { x: 160, y: 160, rx: 18, ry: 14, a: 0.3, col: 'rgba(72,66,56,0.42)' },   // Mare Fecunditatis
    ]
    maria.forEach(m => {
      ctx2.save(); ctx2.translate(m.x, m.y); ctx2.rotate(m.a)
      ctx2.fillStyle = m.col
      ctx2.beginPath(); ctx2.ellipse(0, 0, m.rx, m.ry, 0, 0, Math.PI*2); ctx2.fill()
      ctx2.restore()
    })
    // Craters
    const craters = [
      {x:80,y:60,r:8},{x:185,y:75,r:6},{x:60,y:150,r:10},{x:195,y:170,r:7},
      {x:128,y:200,r:9},{x:75,y:190,r:5},{x:210,y:120,r:5},{x:40,y:100,r:6},
    ]
    craters.forEach(cr => {
      const cg = ctx2.createRadialGradient(cr.x-cr.r*0.2, cr.y-cr.r*0.2, 0, cr.x, cr.y, cr.r)
      cg.addColorStop(0,'rgba(60,55,45,0.7)'); cg.addColorStop(0.7,'rgba(80,74,64,0.4)'); cg.addColorStop(1,'rgba(200,190,175,0.2)')
      ctx2.fillStyle=cg; ctx2.beginPath(); ctx2.arc(cr.x,cr.y,cr.r,0,Math.PI*2); ctx2.fill()
      ctx2.strokeStyle='rgba(220,210,195,0.5)'; ctx2.lineWidth=0.8
      ctx2.beginPath(); ctx2.arc(cr.x,cr.y,cr.r,0,Math.PI*2); ctx2.stroke()
    })
    const tex = new THREE.CanvasTexture(c2)
    return tex
  }, [])

  const shadowX = Math.cos(phase * Math.PI * 2) * (moonR * 1.05)

  return (
    <group position={position}>
      {/* Outer atmospheric glow */}
      <mesh position={[0, 0, -0.4]}>
        <circleGeometry args={[moonR * 3.5, 32]} />
        <meshBasicMaterial color="#5060a0" transparent opacity={0.04} depthWrite={false} />
      </mesh>
      {/* Halo */}
      <mesh position={[0, 0, -0.3]}>
        <circleGeometry args={[moonR * 2.0, 32]} />
        <meshBasicMaterial color="#9aabce" transparent opacity={0.10} depthWrite={false} />
      </mesh>
      {/* Inner halo */}
      <mesh position={[0, 0, -0.2]}>
        <circleGeometry args={[moonR * 1.35, 32]} />
        <meshBasicMaterial color="#c8d8f0" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      {/* Moon disc with surface texture */}
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[moonR, 48]} />
        <meshBasicMaterial map={moonTex} transparent opacity={opacity} depthWrite={false} />
      </mesh>
      {/* Phase shadow overlay */}
      {opacity > 0.1 && phase < 0.95 && phase > 0.05 && (
        <mesh position={[shadowX, 0, 0.05]}>
          <circleGeometry args={[moonR * 1.04, 40]} />
          <meshBasicMaterial color="#03070f" transparent
            opacity={phase < 0.5 ? 0.94 - phase * 0.82 : 0.18 + (phase - 0.5) * 1.45}
            depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

// ─── Background Clouds (painted into sky at z=-135) ───────────────────────────
function BackgroundClouds({ condition, isNight }: { condition: WeatherCondition; isNight: boolean }) {
  const count = condition === 'clear' ? 0 : condition === 'partly_cloudy' ? 5 : 11
  const clouds = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x:       (i / Math.max(count, 1) - 0.5) * 320 + (Math.random() - 0.5) * 50,
    y:       32 + Math.random() * 22,
    scale:   10 + Math.random() * 18,
    opacity: 0.45 + Math.random() * 0.30,
    rotZ:    (Math.random() - 0.5) * 0.15,
  })), [count])
  if (count === 0) return null

  const topCol    = isNight ? '#2a3350' : '#f5f8ff'
  const litCol    = isNight ? '#3a4468' : '#ffffff'
  const shadowCol = isNight ? '#151d30' : '#c8d8e8'

  return (
    <group position={[0, 0, -135]}>
      {clouds.map((c, ci) => {
        const s = c.scale
        // 7-puff organic cloud shape
        const puffs = [
          { dx: 0,        dy: s * 0.28, r: s * 1.45, col: topCol,    op: c.opacity },
          { dx:  s * 2.0, dy: 0,        r: s * 1.05, col: topCol,    op: c.opacity * 0.92 },
          { dx: -s * 1.8, dy: 0,        r: s * 0.92, col: topCol,    op: c.opacity * 0.88 },
          { dx:  s * 0.9, dy: s * 1.05, r: s * 0.78, col: litCol,    op: c.opacity * 0.80 },
          { dx: -s * 0.8, dy: s * 0.95, r: s * 0.72, col: litCol,    op: c.opacity * 0.75 },
          { dx:  s * 2.8, dy: -s * 0.1, r: s * 0.60, col: topCol,    op: c.opacity * 0.65 },
          { dx: -s * 2.6, dy: -s * 0.1, r: s * 0.55, col: topCol,    op: c.opacity * 0.60 },
          // Shadow underbelly
          { dx:  s * 0.3, dy: -s * 0.1, r: s * 1.30, col: shadowCol, op: c.opacity * 0.35 },
        ]
        return (
          <group key={ci} position={[c.x, c.y, 0]} rotation={[0, 0, c.rotZ]}>
            {puffs.map((p, pi) => (
              <mesh key={pi} position={[p.dx, p.dy, pi < 7 ? 0 : -0.2]}>
                <circleGeometry args={[p.r, 18]} />
                <meshBasicMaterial color={p.col} transparent opacity={p.op} depthWrite={false} />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}

// (Background scenery removed — replaced by photo panorama in TreeSceneCanvas)


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
  classicSky?:       boolean
  // When true (panorama mode): only lighting renders, no sky graphics — lets the CSS photo show through
  panoramaMode?:     boolean
}

const CLASSIC_SKY_COLORS: Record<string, string> = {
  dawn:  '#180a04',
  day:   '#061428',
  dusk:  '#120604',
  night: '#020410',
}

export function DynamicSky({ weatherCondition = 'clear', biomeType = 'temperate', classicSky = false, panoramaMode = false }: DynamicSkyProps) {
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

  // Lighting intensity adjusted for panorama mode (brighter to complement photo background)
  const panoramaAmbient    = isNight ? 0.12 : cfg.phase === 'dawn' || cfg.phase === 'dusk' ? 0.55 : 0.75
  const panoramaDirIntensity = isNight ? 0.25 : cfg.phase === 'dawn' || cfg.phase === 'dusk' ? 0.8 : 1.2

  return (
    <>
      {/* Classic sky solid background colour (used when photo panorama is off) */}
      {classicSky && !panoramaMode && (
        <color attach="background" args={[CLASSIC_SKY_COLORS[cfg.phase]]} />
      )}

      {/* Sky graphics — skip in panorama mode (photo already has sky/clouds) */}
      {!panoramaMode && (
        <>
          <BackgroundClouds condition={weatherCondition} isNight={isNight} />
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
          {isNight && !isRainy && !isSnowy && <Fireflies />}
        </>
      )}

      {/* Lighting — always rendered (even in panorama mode, to light the 3D tree) */}
      <directionalLight
        position={isNight ? [-28, 42, -85] : sunPos}
        intensity={panoramaMode
          ? panoramaDirIntensity
          : isNight ? 0.18 : isRainy ? sunIntensity * 0.55 : sunIntensity * 1.55}
        color={cfg.phase === 'dawn' ? '#ffb855' : cfg.phase === 'dusk' ? '#ff6a30' : isNight ? '#c0d0ff' : '#fffde8'}
        castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-far={85} shadow-camera-left={-22}
        shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-22}
      />
      <ambientLight
        intensity={panoramaMode
          ? panoramaAmbient
          : isRainy ? ambientIntensity * 0.55 : ambientIntensity}
        color={isNight ? '#1a2045' : isRainy ? '#8895a8' : '#ffffff'}
      />
      <hemisphereLight
        args={[isNight ? '#0a1032' : '#87CEEB', isNight ? '#050810' : '#3d2c20', panoramaMode ? 0.45 : (isNight ? 0.1 : 0.32)]}
      />
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
