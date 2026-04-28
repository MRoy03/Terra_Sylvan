'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { TreeStats, TreeType, TreeFamily, TREE_CONFIGS } from '@/types'
import { getCurrentSeason, getSeasonLeafColor, hasSnowCap } from '@/lib/seasons'

// Full-tree families render their own trunk from Y=0 — no separate cylinder
const FULL_TREE: TreeFamily[] = ['bamboo', 'cactus', 'palm', 'banana', 'joshua', 'mangrove', 'shrub']

// ─── Shared instanced helpers ─────────────────────────────────────────────────
function Leaves({ count, radius, color }: { count: number; radius: number; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  useEffect(() => {
    if (!ref.current || count === 0) return
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius * (0.6 + Math.random() * 0.5)
      dummy.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi) * 0.7, r * Math.sin(phi) * Math.sin(theta))
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      dummy.scale.setScalar(0.08 + Math.random() * 0.07)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [count, radius, dummy])
  if (count === 0) return null
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow>
      <planeGeometry args={[1, 1.2]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} transparent alphaTest={0.3} roughness={0.9} />
    </instancedMesh>
  )
}

function Fruits({ count, radius, color = '#e63946' }: { count: number; radius: number; color?: string }) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  useEffect(() => {
    if (!ref.current || count === 0) return
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1) * 0.7 + 0.47
      const r = radius * 0.85
      dummy.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi) - radius * 0.15, r * Math.sin(phi) * Math.sin(theta))
      dummy.scale.setScalar(0.055 + Math.random() * 0.04)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [count, radius, dummy])
  if (count === 0) return null
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </instancedMesh>
  )
}

function Flowers({ count, radius, color }: { count: number; radius: number; color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  useEffect(() => {
    if (!ref.current || count === 0) return
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius * (0.85 + Math.random() * 0.2)
      dummy.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
      dummy.scale.setScalar(0.04 + Math.random() * 0.025)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [count, radius, dummy])
  if (count === 0) return null
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <circleGeometry args={[1, 6]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </instancedMesh>
  )
}

function ButtressRoot({ angleDeg, scale, color }: { angleDeg: number; scale: number; color: string }) {
  const geo = useMemo(() => {
    const rad = (angleDeg * Math.PI) / 180
    const pts = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.cos(rad) * 0.7 * scale, -0.08, Math.sin(rad) * 0.7 * scale),
      new THREE.Vector3(Math.cos(rad) * 1.5 * scale, -0.02, Math.sin(rad) * 1.5 * scale),
      new THREE.Vector3(Math.cos(rad) * 2.5 * scale, 0.0, Math.sin(rad) * 2.5 * scale),
    ]
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.065 * scale, 5, false)
  }, [angleDeg, scale])
  return <mesh geometry={geo} receiveShadow><meshStandardMaterial color={color} roughness={1} /></mesh>
}

function TrunkProfile({ url, r, h }: { url: string; r: number; h: number }) {
  const tex = useTexture(url)
  return (
    <Billboard position={[0, h * 0.4, r + 0.015]}>
      <mesh>
        <circleGeometry args={[r * 0.88, 28]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
      <mesh>
        <ringGeometry args={[r * 0.86, r * 1.02, 28]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
    </Billboard>
  )
}

// ─── CROWN families — rendered at Y=0 local (= trunk top in world) ───────────

// Deciduous: 4 overlapping spheres forming a natural crown
function DeciduousCanopy({ s, c, stats, treeType, snow }: {
  s: number; c: string[]; stats: TreeStats; treeType: TreeType; snow: boolean
}) {
  const r = 1.55 * s
  // offset: sphere center is r*0.3 above trunk top so the sphere base wraps the trunk top
  const off = r * 0.3
  const flowerCol = treeType === 'cherry' ? '#ffb7c5'
    : treeType === 'sea_hibiscus' ? '#f9c040'
    : treeType === 'desert_willow' ? '#e080c0'
    : '#fffacd'
  return (
    <group>
      <mesh castShadow position={[0, off, 0]}>
        <sphereGeometry args={[r, 12, 12]} />
        <meshStandardMaterial color={c[0]} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[r * 0.65, off - r * 0.3, r * 0.15]}>
        <sphereGeometry args={[r * 0.72, 10, 10]} />
        <meshStandardMaterial color={c[1]} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[-r * 0.55, off - r * 0.4, -r * 0.2]}>
        <sphereGeometry args={[r * 0.68, 10, 10]} />
        <meshStandardMaterial color={c[2]} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[r * 0.1, off + r * 0.7, r * 0.1]}>
        <sphereGeometry args={[r * 0.5, 8, 8]} />
        <meshStandardMaterial color={c[0]} roughness={0.85} />
      </mesh>
      <group position={[0, off, 0]}>
        <Leaves count={stats.leafCount} radius={r} color={c[1]} />
        {stats.fruitCount  > 0 && <Fruits  count={stats.fruitCount}  radius={r} />}
        {stats.flowerCount > 0 && <Flowers count={stats.flowerCount} radius={r} color={flowerCol} />}
        {snow && (
          <mesh position={[0, r * 0.9, 0]}>
            <sphereGeometry args={[r * 0.6, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#eaf4fb" roughness={0.4} />
          </mesh>
        )}
      </group>
    </group>
  )
}

// Conical: cone tiers stacked up — fits naturally on trunk top
function ConicalCanopy({ s, c, stats, treeType, snow }: {
  s: number; c: string[]; stats: TreeStats; treeType: TreeType; snow: boolean
}) {
  const isCypress   = treeType === 'cypress'
  const isStone     = treeType === 'stone_pine'
  const isHemlock   = treeType === 'mountain_hemlock'
  const wm = isCypress ? 0.28 : isStone ? 1.7 : 1.0
  const hm = isCypress ? 1.8  : isStone ? 0.35 : 1.0
  const tiers = isCypress ? 7 : isStone ? 2 : Math.max(3, Math.round(3 + s * 2.5))
  const tierH   = s * 0.82 * hm
  const firstHt = tierH                          // ht for i=0 (fi=0)
  const baseOff = firstHt * 0.5                  // shift so tier-0 base sits at trunk top
  const topSpire = !isStone

  return (
    <group>
      {Array.from({ length: tiers }).map((_, i) => {
        const fi    = i / Math.max(tiers - 1, 1)
        const y     = baseOff + i * tierH * 0.88  // tier-0 base at Y=0 (trunk top)
        const rad   = s * (1.05 - fi * 0.6) * wm
        const ht    = tierH * (1.0 - fi * 0.15)
        const lean  = isHemlock && i === tiers - 1 ? 0.25 : 0  // drooping top for hemlock
        return (
          <group key={i} position={[lean * s * 0.3, y, 0]}>
            <mesh castShadow>
              <coneGeometry args={[rad, ht, 9]} />
              <meshStandardMaterial color={i % 2 === 0 ? c[0] : c[1]} roughness={0.8} />
            </mesh>
          </group>
        )
      })}
      {topSpire && (
        <mesh position={[0, baseOff + tiers * tierH * 0.88, 0]}>
          <coneGeometry args={[s * 0.12 * wm, s * 0.5 * hm, 6]} />
          <meshStandardMaterial color={c[2]} roughness={0.8} />
        </mesh>
      )}
      <group position={[0, baseOff + tiers * tierH * 0.45, 0]}>
        <Leaves count={stats.leafCount} radius={s * 0.7 * wm} color={c[2]} />
        {stats.flowerCount > 0 && <Flowers count={stats.flowerCount} radius={s * 0.6 * wm} color="#ffffff" />}
      </group>
      {snow && (
        <>
          {Array.from({ length: Math.min(tiers, 4) }).map((_, i) => (
            <mesh key={i} position={[0, baseOff + i * tierH * 0.88 + tierH * 0.4, 0]}>
              <coneGeometry args={[s * (0.9 - i * 0.15) * wm, s * 0.15, 7]} />
              <meshStandardMaterial color="#eaf4fb" roughness={0.4} transparent opacity={0.85} />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}

// Bristlecone: ancient gnarled asymmetric form
function BristleconeCanopy({ s, c, stats }: { s: number; c: string[]; stats: TreeStats }) {
  const coneH   = s * 0.85
  const baseOff = coneH * 0.5   // shift so first cone's base sits at trunk top
  return (
    <group>
      {[0, 1, 2, 3].map((i) => {
        const y   = baseOff + i * s * 0.9
        const r   = s * (0.95 - i * 0.15)
        const tilt = [0.15, -0.1, 0.2, -0.15][i]
        const rotY = i * 1.1
        return (
          <group key={i} position={[Math.sin(rotY) * s * 0.15, y, Math.cos(rotY) * s * 0.1]}
            rotation={[tilt, rotY, 0]}>
            <mesh castShadow>
              <coneGeometry args={[r, coneH, 7]} />
              <meshStandardMaterial color={i % 2 === 0 ? c[0] : c[1]} roughness={0.9} />
            </mesh>
          </group>
        )
      })}
      <Leaves count={stats.leafCount} radius={s * 0.7} color={c[2]} />
    </group>
  )
}

// Willow: sphere crown with long drooping branches to near ground
function WillowCanopy({ s, c, stats, trunkH, treeType }: {
  s: number; c: string[]; stats: TreeStats; trunkH: number; treeType: TreeType
}) {
  const isArctic = treeType === 'arctic_willow'
  const cr = isArctic ? s * 0.7 : s * 0.9
  const branches = useMemo(() => {
    const n = Math.max(5, Math.round(6 + s * 3))
    return Array.from({ length: n }, (_, i) => {
      const angle = (i / n) * Math.PI * 2 + Math.random() * 0.3
      const len   = isArctic ? s * 0.8 : s * (1.5 + Math.random() * 1.0)
      const droop = isArctic ? 0.3 : Math.min(trunkH * 0.9, s * (1.2 + Math.random() * 0.8))
      return { angle, len, droop }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, isArctic, trunkH])
  const isDesert = treeType === 'desert_willow'

  return (
    <group>
      <mesh castShadow position={[0, cr * 0.1, 0]}>
        <sphereGeometry args={[cr, 10, 10]} />
        <meshStandardMaterial color={c[0]} roughness={0.8} />
      </mesh>
      {branches.map((b, i) => {
        const pts = [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(Math.cos(b.angle) * b.len * 0.4, -b.droop * 0.3, Math.sin(b.angle) * b.len * 0.4),
          new THREE.Vector3(Math.cos(b.angle) * b.len * 0.8, -b.droop * 0.7, Math.sin(b.angle) * b.len * 0.8),
          new THREE.Vector3(Math.cos(b.angle) * b.len, -b.droop, Math.sin(b.angle) * b.len),
        ]
        return (
          <mesh key={i} geometry={new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, 0.018 * s, 4, false)}>
            <meshStandardMaterial color={c[1]} roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
      <group position={[0, cr * 0.1, 0]}>
        <Leaves count={stats.leafCount} radius={cr * 1.6} color={c[2]} />
        {stats.flowerCount > 0 && <Flowers count={stats.flowerCount} radius={cr * 1.5}
          color={isDesert ? '#e080c0' : '#d4f0d4'} />}
        {stats.fruitCount  > 0 && <Fruits count={stats.fruitCount} radius={cr * 1.2} />}
      </group>
    </group>
  )
}

// Birch: slender delicate crown, white trunk handled by trunkColor
function BirchCanopy({ s, c, stats, snow }: { s: number; c: string[]; stats: TreeStats; snow: boolean }) {
  const cr  = 1.15 * s
  const off = cr * 0.25  // sphere center 0.25r above trunk top → base is 0.75r inside trunk
  return (
    <group>
      <mesh castShadow position={[0, off, 0]}>
        <sphereGeometry args={[cr, 11, 11]} />
        <meshStandardMaterial color={c[0]} roughness={0.78} transparent opacity={0.88} />
      </mesh>
      <mesh castShadow position={[cr * 0.45, off - cr * 0.3, cr * 0.2]}>
        <sphereGeometry args={[cr * 0.62, 9, 9]} />
        <meshStandardMaterial color={c[1]} roughness={0.78} transparent opacity={0.88} />
      </mesh>
      <mesh castShadow position={[-cr * 0.38, off - cr * 0.1, -cr * 0.15]}>
        <sphereGeometry args={[cr * 0.55, 8, 8]} />
        <meshStandardMaterial color={c[2]} roughness={0.78} transparent opacity={0.88} />
      </mesh>
      <group position={[0, off, 0]}>
        <Leaves count={stats.leafCount} radius={cr} color={c[2]} />
        {stats.flowerCount > 0 && <Flowers count={stats.flowerCount} radius={cr} color="#fffde7" />}
        {stats.fruitCount  > 0 && <Fruits count={stats.fruitCount} radius={cr * 0.8} color="#8b4513" />}
        {snow && (
          <mesh position={[0, cr * 0.85, 0]}>
            <sphereGeometry args={[cr * 0.5, 9, 9, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#eaf4fb" roughness={0.4} />
          </mesh>
        )}
      </group>
    </group>
  )
}

// Acacia: flat umbrella canopy sitting directly on trunk top
function AcaciaCanopy({ s, c, stats }: { s: number; c: string[]; stats: TreeStats }) {
  const r    = 2.0 * s
  const disc = 0.22 * s
  return (
    // Shift up by disc/2 so the umbrella base sits at the trunk top
    <group position={[0, disc * 0.5, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[r, r * 1.08, disc, 14]} />
        <meshStandardMaterial color={c[0]} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, disc * 0.72, 0]}>
        <cylinderGeometry args={[r * 0.65, r * 0.75, disc * 0.72, 12]} />
        <meshStandardMaterial color={c[1]} roughness={0.85} />
      </mesh>
      <group position={[0, disc * 0.45, 0]}>
        <Leaves count={stats.leafCount} radius={r * 0.85} color={c[2]} />
        {stats.flowerCount > 0 && <Flowers count={stats.flowerCount} radius={r * 0.9} color="#f5e642" />}
        {stats.fruitCount  > 0 && <Fruits count={stats.fruitCount} radius={r * 0.75} color="#a0781a" />}
      </group>
    </group>
  )
}

// ─── FULL-TREE families — Y=0 is ground, build complete tree ─────────────────

// Bamboo: multiple culms from ground, segmented, leaf clusters at top and nodes
function BambooCanopy({ s, c, stats, trunkColor }: {
  s: number; c: string[]; stats: TreeStats; trunkColor: string
}) {
  const stalks = useMemo(() => {
    const n = Math.max(3, Math.round(3 + s * 2.5))
    return Array.from({ length: n }, (_, i) => {
      const angle  = (i / n) * Math.PI * 2
      const spread = s * (0.25 + i * 0.08)
      const height = s * (2.8 + Math.random() * 1.4)
      const segs   = Math.round(5 + s * 3)
      const lean   = (Math.random() - 0.5) * 0.18
      return { x: Math.cos(angle) * spread, z: Math.sin(angle) * spread, height, segs, lean }
    })
  }, [s])

  return (
    <group>
      {stalks.map((st, i) => {
        const segH = st.height / st.segs
        return (
          <group key={i} position={[st.x, 0, st.z]} rotation={[st.lean, 0, st.lean * 0.5]}>
            {Array.from({ length: st.segs }).map((_, j) => (
              <mesh key={j} castShadow position={[0, j * segH + segH * 0.5, 0]}>
                <cylinderGeometry args={[s * 0.055 * (1 - j / (st.segs + 1) * 0.3), s * 0.07 * (1 - j / (st.segs + 1) * 0.25), segH * 0.92, 6]} />
                <meshStandardMaterial color={j % 2 === 0 ? c[0] : c[1]} roughness={0.65} />
              </mesh>
            ))}
            {/* Node rings */}
            {Array.from({ length: st.segs }).map((_, j) => (
              <mesh key={`n${j}`} position={[0, j * segH, 0]}>
                <cylinderGeometry args={[s * 0.075, s * 0.075, 0.045 * s, 6]} />
                <meshStandardMaterial color={trunkColor} roughness={0.8} />
              </mesh>
            ))}
            {/* Leaf clusters at top and mid-nodes */}
            {[st.height, st.height * 0.65, st.height * 0.4].map((y, j) => (
              <group key={`l${j}`} position={[0, y, 0]}>
                <mesh castShadow>
                  <sphereGeometry args={[s * (0.45 - j * 0.08), 7, 7]} />
                  <meshStandardMaterial color={c[2]} roughness={0.8} transparent opacity={0.85} />
                </mesh>
              </group>
            ))}
          </group>
        )
      })}
      {stats.flowerCount > 0 && (
        <group position={[0, s * 3.2, 0]}>
          <Flowers count={stats.flowerCount} radius={s * 0.8} color="#c5f0c5" />
        </group>
      )}
    </group>
  )
}

// Palm: curved trunk from ground, crown of arching fronds
function PalmCanopy({ s, c, stats, treeType, trunkColor }: {
  s: number; c: string[]; stats: TreeStats; treeType: TreeType; trunkColor: string
}) {
  const isDate = treeType === 'date_palm'
  const trunkH = 3.4 * s
  const trunkR = 0.18 * s
  // Slight lean built into trunk rings
  const rings  = Math.max(6, Math.round(6 + s * 2))
  const frondCount = Math.max(7, Math.round(8 + s * 1.5))
  const lean   = isDate ? 0.52 : 0.72   // frond droop angle

  return (
    <group>
      {/* Segmented trunk with slight taper */}
      {Array.from({ length: rings }).map((_, i) => {
        const t  = i / rings
        const y  = t * trunkH
        const r  = trunkR * (1 - t * 0.25)
        const offX = Math.sin(t * 1.2) * s * 0.08   // gentle lean
        return (
          <mesh key={i} castShadow position={[offX, y + trunkH / rings * 0.5, 0]}>
            <cylinderGeometry args={[r * 0.88, r, trunkH / rings * 0.95, 7]} />
            <meshStandardMaterial color={trunkColor} roughness={0.95} />
          </mesh>
        )
      })}
      {/* Crown */}
      <group position={[0, trunkH, 0]}>
        {Array.from({ length: frondCount }).map((_, i) => {
          const a = (i / frondCount) * Math.PI * 2
          return (
            <group key={i} rotation={[lean, a, 0]}>
              {/* Main frond stem */}
              <mesh castShadow position={[0, s * 1.1, 0]}>
                <cylinderGeometry args={[0.028 * s, 0.04 * s, s * 2.2, 4]} />
                <meshStandardMaterial color={c[0]} roughness={0.85} />
              </mesh>
              {/* Leaflets along frond */}
              {Array.from({ length: 5 }).map((_, j) => (
                <group key={j} position={[0, s * (0.5 + j * 0.38), 0]} rotation={[0, 0, j % 2 === 0 ? 0.6 : -0.6]}>
                  <mesh>
                    <boxGeometry args={[s * 0.38, 0.025 * s, 0.04 * s]} />
                    <meshStandardMaterial color={c[j % 2]} roughness={0.85} side={THREE.DoubleSide} />
                  </mesh>
                </group>
              ))}
            </group>
          )
        })}
        {/* Coconut cluster */}
        {treeType === 'coconut_palm' && stats.fruitCount > 0 && (
          <Fruits count={Math.min(stats.fruitCount, 8)} radius={s * 0.4} color="#c8a040" />
        )}
        {isDate && stats.fruitCount > 0 && (
          <Fruits count={Math.min(stats.fruitCount, 12)} radius={s * 0.35} color="#8b4513" />
        )}
      </group>
    </group>
  )
}

// Banana: green pseudo-stem (wide), large paddle-shaped leaves from top
function BananaCanopy({ s, c, stats, trunkColor }: {
  s: number; c: string[]; stats: TreeStats; trunkColor: string
}) {
  const stemH = 2.6 * s
  const stemR = 0.38 * s
  const leafCount = Math.max(5, Math.round(5 + s * 2))

  return (
    <group>
      {/* Pseudo-stem */}
      <mesh castShadow position={[0, stemH / 2, 0]}>
        <cylinderGeometry args={[stemR * 0.8, stemR, stemH, 8]} />
        <meshStandardMaterial color={trunkColor} roughness={0.85} />
      </mesh>
      {/* Large paddle leaves from top */}
      <group position={[0, stemH, 0]}>
        {Array.from({ length: leafCount }).map((_, i) => {
          const a = (i / leafCount) * Math.PI * 2
          const droop = 0.45 + (i % 2) * 0.15
          return (
            <group key={i} rotation={[droop, a, 0]}>
              <mesh castShadow position={[0, s * 1.0, 0]}>
                <boxGeometry args={[0.75 * s, s * 2.0, 0.04 * s]} />
                <meshStandardMaterial color={i % 2 === 0 ? c[0] : c[1]} roughness={0.85} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )
        })}
        {/* Hanging banana bunch */}
        {stats.fruitCount > 0 && (
          <group position={[0, -s * 0.4, 0]}>
            <Fruits count={Math.min(stats.fruitCount, 12)} radius={s * 0.5} color="#f0d020" />
          </group>
        )}
      </group>
    </group>
  )
}

// Saguaro cactus: tall ribbed column + upward-curving arms
function CactusCanopy({ s, c, stats }: { s: number; c: string[]; stats: TreeStats }) {
  const colH = 4.2 * s
  const colR = 0.32 * s
  const armCount = Math.min(4, Math.max(0, Math.round(s * 1.8)))

  const armCurves = useMemo(() => {
    const arms = []
    for (let i = 0; i < armCount; i++) {
      const side  = i % 2 === 0 ? 1 : -1
      const startY = colH * (0.38 + i * 0.1)
      const pts = [
        new THREE.Vector3(0, startY, 0),
        new THREE.Vector3(side * colR * 3.5, startY + 0.35 * s, 0),
        new THREE.Vector3(side * colR * 6, startY + 0.55 * s, 0),
        new THREE.Vector3(side * colR * 6.5, startY + 1.6 * s, 0),
      ]
      arms.push({ pts, r: colR * 0.75 })
    }
    return arms
  }, [armCount, colH, colR, s])

  return (
    <group>
      {/* Main column */}
      <mesh castShadow position={[0, colH / 2, 0]}>
        <cylinderGeometry args={[colR * 0.85, colR, colH, 10]} />
        <meshStandardMaterial color={c[0]} roughness={0.85} />
      </mesh>
      {/* Ribs (subtle vertical ridges) */}
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * (colR * 0.9), colH / 2, Math.sin(a) * (colR * 0.9)]}>
            <boxGeometry args={[0.022 * s, colH * 0.95, 0.018 * s]} />
            <meshStandardMaterial color={c[1]} roughness={0.9} />
          </mesh>
        )
      })}
      {/* Arms */}
      {armCurves.map((arm, i) => (
        <mesh key={i} castShadow
          geometry={new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arm.pts), 12, arm.r, 8, false)}>
          <meshStandardMaterial color={c[i % 2]} roughness={0.85} />
        </mesh>
      ))}
      {/* Flowers at tips */}
      {stats.flowerCount > 0 && (
        <group position={[0, colH, 0]}>
          <Flowers count={stats.flowerCount} radius={s * 0.25} color="#ffffff" />
        </group>
      )}
    </group>
  )
}

// Joshua tree: forking trunk + spiky arm clusters
function JoshuaCanopy({ s, c, stats, trunkColor }: {
  s: number; c: string[]; stats: TreeStats; trunkColor: string
}) {
  const trunkH = 3.0 * s
  const trunkR = 0.22 * s
  const branches = useMemo(() => {
    const n = Math.max(3, Math.round(3 + s * 1.5))
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2
      const baseY = trunkH * (0.55 + (i % 2) * 0.12)
      const len   = s * (1.0 + Math.random() * 0.6)
      const pts   = [
        new THREE.Vector3(0, baseY, 0),
        new THREE.Vector3(Math.cos(a) * len * 0.4, baseY + len * 0.45, Math.sin(a) * len * 0.4),
        new THREE.Vector3(Math.cos(a) * len * 0.85, baseY + len, Math.sin(a) * len * 0.85),
      ]
      return { pts, a, tipX: Math.cos(a) * len * 0.85, tipY: baseY + len, tipZ: Math.sin(a) * len * 0.85 }
    })
  }, [s, trunkH])

  return (
    <group>
      {/* Main trunk */}
      <mesh castShadow position={[0, trunkH / 2, 0]}>
        <cylinderGeometry args={[trunkR * 0.7, trunkR, trunkH, 7]} />
        <meshStandardMaterial color={trunkColor} roughness={0.92} />
      </mesh>
      {/* Branches */}
      {branches.map((b, i) => (
        <group key={i}>
          <mesh castShadow
            geometry={new THREE.TubeGeometry(new THREE.CatmullRomCurve3(b.pts), 8, trunkR * 0.55, 6, false)}>
            <meshStandardMaterial color={trunkColor} roughness={0.9} />
          </mesh>
          {/* Spiky leaf cluster at branch tip */}
          <group position={[b.tipX, b.tipY, b.tipZ]}>
            {Array.from({ length: 10 }).map((_, j) => {
              const a2 = (j / 10) * Math.PI * 2
              return (
                <mesh key={j} rotation={[0.65, a2, 0]}>
                  <cylinderGeometry args={[0.01 * s, 0.025 * s, 0.7 * s, 3]} />
                  <meshStandardMaterial color={c[j % 2]} roughness={0.9} />
                </mesh>
              )
            })}
          </group>
        </group>
      ))}
      {stats.flowerCount > 0 && (
        <group position={[0, trunkH + s * 0.5, 0]}>
          <Flowers count={stats.flowerCount} radius={s * 0.7} color="#fffde7" />
        </group>
      )}
    </group>
  )
}

// Mangrove: arching prop roots from waist height down to ground, trunk above roots, canopy at top
function MangroveCanopy({ s, c, stats, treeType }: {
  s: number; c: string[]; stats: TreeStats; treeType: TreeType
}) {
  const rootJunction = 1.6 * s   // height where roots meet trunk
  const trunkH       = 1.8 * s   // trunk from junction to canopy
  const trunkR       = 0.18 * s
  const cr           = 1.5 * s
  const rootCount    = Math.max(5, Math.round(5 + s * 1.5))
  const isBlack      = treeType === 'black_mangrove'

  const propRoots = useMemo(() => Array.from({ length: rootCount }, (_, i) => {
    const a    = (i / rootCount) * Math.PI * 2
    const dist = (0.9 + Math.random() * 0.5) * s
    return [
      new THREE.Vector3(Math.cos(a) * dist * 0.4, rootJunction, Math.sin(a) * dist * 0.4),
      new THREE.Vector3(Math.cos(a) * dist * 0.75, rootJunction * 0.5, Math.sin(a) * dist * 0.75),
      new THREE.Vector3(Math.cos(a) * dist, 0.0, Math.sin(a) * dist),
    ]
  }), [rootCount, rootJunction, s])

  return (
    <group>
      {/* Prop roots arching from junction height to ground */}
      {propRoots.map((pts, i) => (
        <mesh key={i} castShadow
          geometry={new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.045 * s, 5, false)}>
          <meshStandardMaterial color={c[1]} roughness={0.95} />
        </mesh>
      ))}
      {/* Pneumatophores for black mangrove */}
      {isBlack && Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2, d = (0.5 + i * 0.08) * s
        return (
          <mesh key={i} position={[Math.cos(a) * d, 0.15 * s, Math.sin(a) * d]}>
            <cylinderGeometry args={[0.018 * s, 0.025 * s, 0.3 * s, 4]} />
            <meshStandardMaterial color={c[1]} roughness={0.95} />
          </mesh>
        )
      })}
      {/* Trunk rising from root junction */}
      <mesh castShadow position={[0, rootJunction + trunkH / 2, 0]}>
        <cylinderGeometry args={[trunkR * 0.8, trunkR, trunkH, 7]} />
        <meshStandardMaterial color={c[1]} roughness={0.92} />
      </mesh>
      {/* Canopy */}
      <group position={[0, rootJunction + trunkH, 0]}>
        <mesh castShadow position={[0, cr * 0.5, 0]}>
          <sphereGeometry args={[cr, 12, 12]} />
          <meshStandardMaterial color={c[0]} roughness={0.82} />
        </mesh>
        <mesh castShadow position={[cr * 0.5, cr * 0.2, 0]}>
          <sphereGeometry args={[cr * 0.65, 9, 9]} />
          <meshStandardMaterial color={c[2]} roughness={0.82} />
        </mesh>
        <group position={[0, cr * 0.5, 0]}>
          <Leaves count={stats.leafCount} radius={cr} color={c[1]} />
          {stats.fruitCount  > 0 && <Fruits count={stats.fruitCount} radius={cr} />}
          {stats.flowerCount > 0 && <Flowers count={stats.flowerCount} radius={cr} color="#ffe4b5" />}
        </group>
      </group>
    </group>
  )
}

// Shrub: low spreading mound of spheres directly on ground
function ShrubCanopy({ s, c, stats, treeType }: {
  s: number; c: string[]; stats: TreeStats; treeType: TreeType
}) {
  const cr = 0.9 * s
  const isCloud = treeType === 'cloudberry'
  const berryColor = treeType === 'crowberry' ? '#1a1a2a' : '#f4a020'

  return (
    <group>
      {/* Main spread at ground level */}
      <mesh castShadow position={[0, cr * 0.35, 0]}>
        <sphereGeometry args={[cr, 10, 10]} />
        <meshStandardMaterial color={c[0]} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[cr * 0.55, cr * 0.18, 0]}>
        <sphereGeometry args={[cr * 0.72, 8, 8]} />
        <meshStandardMaterial color={c[1]} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-cr * 0.48, cr * 0.1, cr * 0.38]}>
        <sphereGeometry args={[cr * 0.65, 8, 8]} />
        <meshStandardMaterial color={c[2]} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[cr * 0.2, cr * 0.08, -cr * 0.52]}>
        <sphereGeometry args={[cr * 0.58, 7, 7]} />
        <meshStandardMaterial color={c[0]} roughness={0.9} />
      </mesh>
      <group position={[0, cr * 0.35, 0]}>
        <Leaves count={Math.min(stats.leafCount, 60)} radius={cr * 0.9} color={c[2]} />
        {stats.fruitCount > 0 && (
          <Fruits count={Math.min(stats.fruitCount, 20)} radius={cr * 0.85} color={berryColor} />
        )}
        {(stats.flowerCount > 0 || isCloud) && (
          <Flowers count={Math.max(stats.flowerCount, 8)} radius={cr} color="#ffffff" />
        )}
      </group>
    </group>
  )
}

// ─── Main Tree ────────────────────────────────────────────────────────────────
interface TreeProps {
  stats:       TreeStats
  displayName: string
  status:      string
  photoURL:    string | null
  treeType:    TreeType
}

export function Tree({ stats, displayName, status, photoURL, treeType }: TreeProps) {
  const groupRef  = useRef<THREE.Group>(null!)
  const cfg       = TREE_CONFIGS[treeType] ?? TREE_CONFIGS.oak
  const season    = getCurrentSeason()
  const sc        = getSeasonLeafColor(season, treeType)
  const snow      = hasSnowCap(season) && cfg.family !== 'bamboo' && cfg.family !== 'cactus' && cfg.family !== 'palm' && cfg.family !== 'shrub'

  const { scale }  = stats
  const isFullTree = FULL_TREE.includes(cfg.family)
  const trunkH     = 3.2 * scale
  const trunkR     = 0.28 * scale

  // Name sits above the highest point of the tree
  const treeTop = isFullTree
    ? (cfg.family === 'bamboo' ? scale * 4.2 : cfg.family === 'cactus' ? scale * 4.5 : cfg.family === 'shrub' ? scale * 1.6 : scale * 4.0)
    : (cfg.family === 'willow' ? trunkH + scale * 1.0 : cfg.family === 'acacia' ? trunkH + scale * 0.4 : trunkH + scale * 1.6 * 1.8)
  const nameY   = treeTop + 0.9
  const statY   = nameY - 0.52 * Math.max(0.6, scale)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    groupRef.current.rotation.z = Math.sin(t * 0.42) * 0.016
    groupRef.current.rotation.x = Math.sin(t * 0.28 + 1.2) * 0.008
  })

  const roots = useMemo(
    () => [0, 72, 144, 216, 288].slice(0, Math.max(1, stats.rootCount)),
    [stats.rootCount],
  )

  const showTrunk = !isFullTree
  const showRoots = !isFullTree && cfg.family !== 'birch' && cfg.family !== 'willow'

  function renderCanopy() {
    const { family } = cfg
    const props = { s: scale, c: sc, stats }
    if (family === 'deciduous')
      return <DeciduousCanopy {...props} treeType={treeType} snow={snow} />
    if (family === 'conical' || family === 'cypress')
      return <ConicalCanopy {...props} treeType={treeType} snow={snow} />
    if (family === 'bristlecone')
      return <BristleconeCanopy {...props} />
    if (family === 'willow')
      return <WillowCanopy {...props} trunkH={trunkH} treeType={treeType} />
    if (family === 'birch')
      return <BirchCanopy {...props} snow={snow} />
    if (family === 'acacia')
      return <AcaciaCanopy {...props} />
    if (family === 'bamboo')
      return <BambooCanopy {...props} trunkColor={cfg.trunkColor} />
    if (family === 'palm')
      return <PalmCanopy {...props} treeType={treeType} trunkColor={cfg.trunkColor} />
    if (family === 'banana')
      return <BananaCanopy {...props} trunkColor={cfg.trunkColor} />
    if (family === 'cactus')
      return <CactusCanopy {...props} />
    if (family === 'joshua')
      return <JoshuaCanopy {...props} trunkColor={cfg.trunkColor} />
    if (family === 'mangrove')
      return <MangroveCanopy {...props} treeType={treeType} />
    if (family === 'shrub')
      return <ShrubCanopy {...props} treeType={treeType} />
    return <DeciduousCanopy {...props} treeType={treeType} snow={snow} />
  }

  const canopyY = isFullTree ? 0 : trunkH

  return (
    <group ref={groupRef}>
      {showRoots && roots.map((a) => (
        <ButtressRoot key={a} angleDeg={a} scale={scale} color={cfg.trunkColor} />
      ))}

      {showTrunk && (
        <mesh castShadow position={[0, trunkH / 2, 0]}>
          <cylinderGeometry args={[trunkR * 0.82, trunkR, trunkH, 10]} />
          <meshStandardMaterial color={cfg.trunkColor} roughness={0.94} />
        </mesh>
      )}

      {photoURL && showTrunk && (
        <TrunkProfile url={photoURL} r={trunkR} h={trunkH} />
      )}

      <group position={[0, canopyY, 0]}>
        {renderCanopy()}
      </group>

      <Billboard position={[0, nameY, 0]}>
        <Text fontSize={0.28 * Math.max(0.7, scale)} color="white"
          outlineWidth={0.022} outlineColor="#000" anchorX="center" anchorY="middle" renderOrder={1}>
          {displayName}
        </Text>
      </Billboard>

      <Billboard position={[0, statY, 0]}>
        <Text fontSize={0.185 * Math.max(0.7, scale)} color="#a7f3d0"
          outlineWidth={0.014} outlineColor="#000" anchorX="center" anchorY="middle" renderOrder={1} maxWidth={7}>
          {status}
        </Text>
      </Billboard>
    </group>
  )
}
