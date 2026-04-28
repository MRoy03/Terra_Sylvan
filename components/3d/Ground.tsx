'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { BiomeType } from '@/types'

interface GroundProps {
  biomeType?: BiomeType
}

export function Ground({ biomeType = 'temperate' }: GroundProps) {
  const biome = BIOME_GROUND_CFG[biomeType]
  return (
    <group>
      {/* Main ground disc */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[32, 72]} />
        <meshStandardMaterial color={biome.groundColor} roughness={0.95} metalness={0} />
      </mesh>

      {/* Inner soil ring around tree base */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[0, 1.4, 40]} />
        <meshStandardMaterial color={biome.soilColor} roughness={1} />
      </mesh>

      {/* Terrain bumps — subtle elevation variation gives 3D ground feel */}
      <TerrainBumps color={biome.groundColor} midColor={biome.midColor} />

      {/* Mid-distance fade ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <circleGeometry args={[90, 36]} />
        <meshStandardMaterial color={biome.farColor} roughness={1} />
      </mesh>

      {/* Biome-specific elements */}
      {biomeType === 'temperate'     && <TemperateElements />}
      {biomeType === 'mountain'      && <MountainElements />}
      {biomeType === 'mangrove'      && <MangroveElements />}
      {biomeType === 'tropical'      && <TropicalElements />}
      {biomeType === 'arid'          && <AridElements />}
      {biomeType === 'mediterranean' && <MediterraneanElements />}
      {biomeType === 'tundra'        && <TundraElements />}
    </group>
  )
}

// ─── Config ───────────────────────────────────────────────────────────────────
const BIOME_GROUND_CFG: Record<BiomeType, {
  groundColor: string; soilColor: string; farColor: string; midColor: string
}> = {
  temperate:     { groundColor: '#3a6b35', soilColor: '#5c3d1e', farColor: '#1c3818', midColor: '#2e5828' },
  mountain:      { groundColor: '#7a8878', soilColor: '#6a6055', farColor: '#485648', midColor: '#607068' },
  mangrove:      { groundColor: '#3a6048', soilColor: '#2a4838', farColor: '#183425', midColor: '#2c5038' },
  tropical:      { groundColor: '#2d5a1b', soilColor: '#4a3220', farColor: '#183808', midColor: '#224c14' },
  arid:          { groundColor: '#c8a860', soilColor: '#a07840', farColor: '#7a5c2c', midColor: '#ae9050' },
  mediterranean: { groundColor: '#9a8060', soilColor: '#7a6040', farColor: '#564534', midColor: '#847060' },
  tundra:        { groundColor: '#d0e4ef', soilColor: '#b8d0e2', farColor: '#a0b8c8', midColor: '#c0d4e5' },
}

// ─── Terrain bumps (3D ground undulation) ─────────────────────────────────────
function TerrainBumps({ color, midColor }: { color: string; midColor: string }) {
  const bumps = useMemo(() => Array.from({ length: 18 }, (_, i) => {
    const angle = (i / 18) * Math.PI * 2 + 0.3
    const dist  = 6 + Math.random() * 14
    return {
      x:  Math.cos(angle) * dist,
      z:  Math.sin(angle) * dist,
      rx: 1.2 + Math.random() * 2.5,
      ry: 0.08 + Math.random() * 0.18,
      rz: 0.8 + Math.random() * 2.0,
    }
  }), [])

  return (
    <group>
      {bumps.map((b, i) => (
        <mesh key={i} position={[b.x, b.ry / 2, b.z]} castShadow receiveShadow
          rotation={[0, (i / 18) * Math.PI * 2, 0]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? midColor : color}
            roughness={0.92}
            metalness={0}
          />
          <group scale={[b.rx, b.ry, b.rz]} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function Rock({ position, scale, color = '#7a7a72', rot = 0 }: {
  position: [number,number,number]; scale: number; color?: string; rot?: number
}) {
  return (
    <mesh position={[position[0], position[1] + scale * 0.5, position[2]]}
      scale={scale} castShadow receiveShadow rotation={[0, rot, 0.15]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0.04} />
    </mesh>
  )
}

function SmallRockCluster({ cx, cz, color }: { cx: number; cz: number; color: string }) {
  const rocks = useMemo(() => [
    { dx: 0,    dz: 0,    s: 0.18, r: 0.2 },
    { dx: 0.28, dz: 0.15, s: 0.13, r: 1.1 },
    { dx:-0.22, dz: 0.18, s: 0.10, r: 2.3 },
    { dx: 0.05, dz:-0.24, s: 0.15, r: 0.8 },
  ], [])
  return (
    <>
      {rocks.map((r, i) => (
        <Rock key={i} position={[cx + r.dx, 0, cz + r.dz]} scale={r.s} color={color} rot={r.r} />
      ))}
    </>
  )
}

function GrassClump({ position, rotation, color = '#4a8a3a' }: {
  position: [number,number,number]; rotation: number; color?: string
}) {
  const blades = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    angle:  (i / 6) * Math.PI * 2 + rotation,
    lean:   0.18 + Math.random() * 0.28,
    height: 0.18 + Math.random() * 0.18,
  })), [rotation])
  return (
    <group position={position}>
      {blades.map((b, i) => (
        <mesh key={i}
          position={[Math.cos(b.angle) * 0.09, b.height / 2, Math.sin(b.angle) * 0.09]}
          rotation={[b.lean * Math.cos(b.angle), b.angle, b.lean * Math.sin(b.angle)]}>
          <planeGeometry args={[0.045, b.height]} />
          <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function Flower({ position, color }: { position: [number,number,number]; color: string }) {
  return (
    <group position={position}>
      {/* Stem */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.008, 0.01, 0.24, 4]} />
        <meshStandardMaterial color="#3a7030" roughness={0.9} />
      </mesh>
      {/* Bloom */}
      <mesh position={[0, 0.26, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <circleGeometry args={[0.10, 8]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// ─── Temperate ────────────────────────────────────────────────────────────────
function TemperateElements() {
  return (
    <>
      <SmallRockCluster cx={3.5}  cz={2.2}  color="#7a7870" />
      <SmallRockCluster cx={-4.2} cz={3.8}  color="#8a8478" />
      <SmallRockCluster cx={2.2}  cz={-4.8} color="#7a7870" />
      <SmallRockCluster cx={-3.2} cz={-2.8} color="#8a8070" />
      <GrassClump position={[2.4, 0, 1.6]}  rotation={0.4} />
      <GrassClump position={[-3.8, 0, 2.0]} rotation={1.2} />
      <GrassClump position={[2.0, 0, -3.4]} rotation={2.1} />
      <GrassClump position={[-3.0, 0, -2.4]}rotation={0.8} />
      <GrassClump position={[4.8, 0, -1.4]} rotation={1.7} />
      <GrassClump position={[-5.5, 0, 1.2]} rotation={3.0} />
      <Flower position={[-5.2, 0, 4.2]}  color="#f9c74f" />
      <Flower position={[4.2, 0, -5.2]}  color="#f4a261" />
      <Flower position={[5.8, 0, 2.2]}   color="#e9c46a" />
      <Flower position={[-4.2, 0, -5.2]} color="#90be6d" />
      <Flower position={[-6.2, 0, -2.2]} color="#e76f51" />
      <Flower position={[2.0, 0, 6.2]}   color="#f9c74f" />
      {/* Mossy log */}
      <mesh position={[-7, 0.12, 3]} rotation={[0, 0.6, 0.08]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 1.8, 7]} />
        <meshStandardMaterial color="#5a4028" roughness={0.95} />
      </mesh>
      <mesh position={[-7.05, 0.2, 3.05]} rotation={[0, 0.6, 0.08]}>
        <cylinderGeometry args={[0.17, 0.21, 0.9, 7]} />
        <meshStandardMaterial color="#3a6030" roughness={0.9} transparent opacity={0.7} />
      </mesh>
    </>
  )
}

// ─── Mountain ─────────────────────────────────────────────────────────────────
function MountainElements() {
  const peaks = useMemo(() => [
    { x: -48, z: -82, h: 32, r: 16 },
    { x:  18, z: -92, h: 42, r: 20 },
    { x:  64, z: -78, h: 26, r: 13 },
    { x: -74, z: -68, h: 22, r: 11 },
    { x:  85, z: -88, h: 36, r: 18 },
    { x: -110,z: -72, h: 18, r:  9 },
    { x:  115,z: -80, h: 28, r: 14 },
  ], [])
  return (
    <>
      {peaks.map((p, i) => (
        <group key={i} position={[p.x, -0.5, p.z]}>
          {/* Body */}
          <mesh castShadow>
            <coneGeometry args={[p.r, p.h, 7]} />
            <meshStandardMaterial color="#8a9888" roughness={0.92} />
          </mesh>
          {/* Snow cap */}
          <mesh position={[0, p.h * 0.40, 0]}>
            <coneGeometry args={[p.r * 0.32, p.h * 0.24, 6]} />
            <meshStandardMaterial color="#eaf5fc" roughness={0.45} />
          </mesh>
          {/* Rock face detail */}
          <mesh position={[p.r*0.15, p.h*0.2, p.r*0.3]} rotation={[0, 0, 0.3]}>
            <coneGeometry args={[p.r*0.25, p.h*0.4, 5]} />
            <meshStandardMaterial color="#7a8875" roughness={0.95} />
          </mesh>
        </group>
      ))}
      <Rock position={[4.2, 0, 3.2]}   scale={0.55} color="#8a887a" />
      <Rock position={[-5.2, 0, 4.2]}  scale={0.45} color="#929082" />
      <Rock position={[3.2, 0, -5.5]}  scale={0.60} color="#7c7a70" />
      <Rock position={[-4.2, 0, -3.2]} scale={0.38} color="#8a887a" />
      <Rock position={[6.5, 0, -2.2]}  scale={0.65} color="#929082" />
      <SmallRockCluster cx={1.5}  cz={5.5}  color="#909088" />
      <SmallRockCluster cx={-6.5} cz={2.5}  color="#888880" />
      {/* Snow patches */}
      {[[-4.2,2.2],[-2.2,-4.2],[3.2,-3.2],[5.2,4.2],[-6.2,-1.2]].map(([x,z],i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x,0.01,z]}>
          <circleGeometry args={[0.55 + i * 0.18, 10]} />
          <meshBasicMaterial color="#e8f5fc" transparent opacity={0.88} />
        </mesh>
      ))}
      {/* Alpine tiny flowers */}
      {[[-3.2,3.2],[4.2,-4.2],[-5.2,-2.2]].map(([x,z], i) => (
        <Flower key={i} position={[x, 0, z]} color={['#f0e8ff','#d0e4ff','#fff8e0'][i]} />
      ))}
    </>
  )
}

// ─── Mangrove ─────────────────────────────────────────────────────────────────
function MangroveElements() {
  const propArches = useMemo(() => Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2
    const dist  = 5 + (i % 3) * 2.5
    return [
      new THREE.Vector3(Math.cos(angle) * (dist - 1.8), 2.8, Math.sin(angle) * (dist - 1.8)),
      new THREE.Vector3(Math.cos(angle) * dist * 0.75, 0.9, Math.sin(angle) * dist * 0.75),
      new THREE.Vector3(Math.cos(angle) * dist, -0.05, Math.sin(angle) * dist),
    ]
  }), [])

  return (
    <>
      {/* Water plane */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.06,0]}>
        <circleGeometry args={[32, 52]} />
        <meshStandardMaterial color="#186070" transparent opacity={0.78} roughness={0.08} metalness={0.35} />
      </mesh>
      {/* Animated ripple rings */}
      {[3.5, 7, 12, 18, 25].map((r, i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[0,0.005,0]}>
          <ringGeometry args={[r, r+0.05, 52]} />
          <meshBasicMaterial color="#5ab8d0" transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Prop root arches */}
      {propArches.map((pts, i) => (
        <mesh key={i} castShadow
          geometry={new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.055, 5, false)}>
          <meshStandardMaterial color="#7a5830" roughness={0.95} />
        </mesh>
      ))}
      {/* Mud mounds */}
      <Rock position={[5.8,0.1,3.2]}  scale={0.22} color="#5a4830" />
      <Rock position={[-4.2,0.1,5.2]} scale={0.20} color="#6a5840" />
      <Rock position={[3.2,0.1,-5.8]} scale={0.28} color="#5a4830" />
      {/* Distant sea */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.35,-52]}>
        <planeGeometry args={[220, 65]} />
        <meshStandardMaterial color="#185878" roughness={0.04} metalness={0.42} transparent opacity={0.88} />
      </mesh>
      {/* Mangrove leaf clusters near water */}
      {[[-8,6],[8,-7],[10,8],[-9,-8]].map(([x,z],i)=>(
        <mesh key={i} position={[x, 0.5, z]} castShadow>
          <sphereGeometry args={[0.6+i*0.1, 7, 7]} />
          <meshStandardMaterial color="#2a5838" roughness={0.88} />
        </mesh>
      ))}
    </>
  )
}

// ─── Tropical ─────────────────────────────────────────────────────────────────
function TropicalElements() {
  return (
    <>
      {/* Large fern fronds */}
      {[[3.2,1.8],[-3.8,2.2],[2.2,-4.2],[-2.8,-3.2],[5.5,-2.2],[-5.8,3.2]].map(([x,z], i) => (
        <group key={i} position={[x,0,z]}>
          {Array.from({length:6}, (_, j) => {
            const a = (j/6)*Math.PI*2
            return (
              <mesh key={j} rotation={[0.65, a, 0]} castShadow>
                <boxGeometry args={[0.055, 0.9, 0.28]} />
                <meshStandardMaterial color={j%2===0 ? '#1a6020' : '#226828'} roughness={0.9} side={THREE.DoubleSide} />
              </mesh>
            )
          })}
        </group>
      ))}
      {/* Bright tropical flowers */}
      {[[-4.2,2.2],[4.2,-3.2],[-2.2,-5.2],[5.5,2.5],[-5.5,-3.2],[2.5,5.5]].map(([x,z], i) => (
        <Flower key={i} position={[x, 0, z]} color={['#ff3030','#ff9900','#ffcc00','#ff44bb','#dd00ff','#ff6622'][i]} />
      ))}
      {/* Undergrowth mounds */}
      {[[-6.5,4.5],[6.5,-5.5],[-5.5,-4.5],[6.5,3.5],[-4.5,6.5],[5.5,5.5]].map(([x,z], i) => (
        <mesh key={i} position={[x,0.12,z]} castShadow>
          <sphereGeometry args={[0.55+i*0.08, 7, 7]} />
          <meshStandardMaterial color={i%2===0?'#1e5020':'#245a28'} roughness={0.9} />
        </mesh>
      ))}
      <SmallRockCluster cx={3.2}  cz={4.2}  color="#5a4a30" />
      <SmallRockCluster cx={-4.2} cz={3.2}  color="#4a3a28" />
      {/* Jungle floor leaves */}
      {[[-3,5],[4,-2],[6,4],[-6,-4]].map(([x,z],i)=>(
        <mesh key={i} rotation={[-Math.PI/2,0, i*0.8]} position={[x,0.02,z]}>
          <circleGeometry args={[0.4+i*0.08, 7]} />
          <meshBasicMaterial color="#1a5818" side={THREE.DoubleSide} transparent opacity={0.85} />
        </mesh>
      ))}
    </>
  )
}

// ─── Arid ─────────────────────────────────────────────────────────────────────
function AridElements() {
  return (
    <>
      {/* Dunes */}
      {[[-8,0,-16],[11,0,-22],[-16,0,-13],[16,0,-19],[-6,0,-28]].map(([x,y,z], i) => (
        <mesh key={i} position={[x,y-0.9,z]}>
          <sphereGeometry args={[4.5+i*0.8, 10, 6]} />
          <meshStandardMaterial color="#c8a860" roughness={0.92} />
        </mesh>
      ))}
      {/* Mesa / flat rock formations */}
      {[[-12,0,-8],[12,0,-10]].map(([x,y,z],i)=>(
        <group key={i} position={[x,0,z]}>
          <mesh castShadow>
            <cylinderGeometry args={[2.5-i*0.3, 3+i*0.3, 2+i*0.5, 6]} />
            <meshStandardMaterial color="#b09060" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.1+i*0.25, 0]} castShadow>
            <cylinderGeometry args={[2.2-i*0.3, 2.6-i*0.2, 0.5, 6]} />
            <meshStandardMaterial color="#c0a070" roughness={0.88} />
          </mesh>
        </group>
      ))}
      <Rock position={[4.2,0,3.2]}   scale={0.42} color="#9a8060" />
      <Rock position={[-5.2,0,4.2]}  scale={0.38} color="#a08870" />
      <Rock position={[3.2,0,-5.2]}  scale={0.52} color="#9a8060" />
      <Rock position={[-4.2,0,-4.2]} scale={0.30} color="#b09070" />
      <Rock position={[6.5,0,-2.2]}  scale={0.48} color="#9a8060" />
      {/* Dried plant stumps */}
      {[[-3.2,2.2],[3.2,-4.2],[-5.2,-2.2],[4.5,4.5],[0,6]].map(([x,z], i) => (
        <mesh key={i} position={[x,0.32,z]} castShadow>
          <cylinderGeometry args={[0.038,0.065,0.65,5]} />
          <meshStandardMaterial color="#a08050" roughness={0.95} />
        </mesh>
      ))}
      {/* Cracked earth pattern */}
      {[[-2.2,1.2],[1.2,-3.2],[3.2,2.2],[-4.2,-1.2],[0,-5],[5,-4]].map(([x,z], i) => (
        <mesh key={i} rotation={[-Math.PI/2, i*0.9, 0]} position={[x,0.01,z]}>
          <planeGeometry args={[1.6, 0.022]} />
          <meshBasicMaterial color="#9a7040" side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Scattered pebbles */}
      {Array.from({length:12}, (_, i) => (
        <Rock key={i}
          position={[(Math.cos(i/12*Math.PI*2)*5), 0, (Math.sin(i/12*Math.PI*2)*5)]}
          scale={0.06 + (i%3)*0.03} color="#aa9868" />
      ))}
    </>
  )
}

// ─── Mediterranean ────────────────────────────────────────────────────────────
function MediterraneanElements() {
  return (
    <>
      {/* Rolling hills */}
      {[[-26,0,-42],[11,0,-47],[-52,0,-36],[42,0,-52],[-15,0,-58]].map(([x,y,z], i) => (
        <mesh key={i} position={[x,y-2.2,z]}>
          <sphereGeometry args={[14+i*3.5, 10, 8]} />
          <meshStandardMaterial color={['#9a8865','#8a7855','#a09070','#b0a080','#988875'][i]} roughness={0.9} />
        </mesh>
      ))}
      {/* Lavender bushes */}
      {[[-4.2,2.2],[4.5,-3.2],[6.2,1.2],[-3.2,-4.2],[-6.2,-2.2],[5.2,-5.2],[0,7]].map(([x,z], i) => (
        <group key={i} position={[x,0,z]}>
          <mesh castShadow>
            <sphereGeometry args={[0.38,9,8]} />
            <meshStandardMaterial color={i%2===0?'#8870c0':'#9878c8'} roughness={0.9} />
          </mesh>
          <mesh position={[0,0.28,0]} castShadow>
            <cylinderGeometry args={[0.048,0.048,0.56,5]} />
            <meshStandardMaterial color="#88a052" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Stone wall */}
      {[[-8,0,6],[-8,0,7.3],[-8,0,8.6],[-7,0,6],[-7,0,7.3],[-7,0,8.6]].map(([x,y,z], i) => (
        <mesh key={i} position={[x,0.28,z]} castShadow>
          <boxGeometry args={[0.52,0.52,1.12]} />
          <meshStandardMaterial color={i<3?'#c0b090':'#b8a888'} roughness={0.95} />
        </mesh>
      ))}
      {/* Terracotta pots */}
      {[[6,4],[7.5,3],[6.8,5]].map(([x,z],i)=>(
        <group key={i} position={[x,0,z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.18-i*0.02, 0.22-i*0.02, 0.35, 8]} />
            <meshStandardMaterial color="#c07040" roughness={0.85} />
          </mesh>
          <mesh position={[0,0.22,0]}>
            <sphereGeometry args={[0.14, 7, 7]} />
            <meshStandardMaterial color={['#e03030','#ff9900','#88cc44'][i]} roughness={0.8} />
          </mesh>
        </group>
      ))}
      <SmallRockCluster cx={5.2}  cz={3.2}  color="#b0a080" />
      <SmallRockCluster cx={-3.2} cz={5.2}  color="#c0b090" />
    </>
  )
}

// ─── Tundra ───────────────────────────────────────────────────────────────────
function TundraElements() {
  return (
    <>
      {/* Frozen lake */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[8,-0.025,8]}>
        <circleGeometry args={[5.5,36]} />
        <meshStandardMaterial color="#c0d8e8" transparent opacity={0.88} roughness={0.04} metalness={0.32} />
      </mesh>
      {/* Ice surface cracks */}
      {[[8,0,8],[9.2,0,7.6],[7.6,0,9.2],[8.5,0,9.5],[7,0,8.8]].map(([x,y,z], i) => (
        <mesh key={i} rotation={[-Math.PI/2, i*1.3, 0]} position={[x,0.012,z]}>
          <planeGeometry args={[2.8, 0.018]} />
          <meshBasicMaterial color="#9ab8cc" side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Snow mounds */}
      {[[-5.2,3.2],[3.2,-5.2],[-3.2,-4.2],[5.2,-3.2],[0,6.5],[6.5,0],[-6.5,0]].map(([x,z], i) => (
        <mesh key={i} position={[x,0.12,z]} castShadow>
          <sphereGeometry args={[0.65+i*0.1, 8, 6]} />
          <meshStandardMaterial color="#e5f0f8" roughness={0.82} />
        </mesh>
      ))}
      {/* Permafrost rocks */}
      <Rock position={[4.2,0,2.2]}  scale={0.32} color="#909898" />
      <Rock position={[-4.2,0,3.2]} scale={0.28} color="#888888" />
      <Rock position={[3.2,0,-4.2]} scale={0.38} color="#909898" />
      <Rock position={[-5.2,0,-3.2]}scale={0.22} color="#9898a0" />
      <SmallRockCluster cx={0}    cz={-7}  color="#888890" />
      <SmallRockCluster cx={7}    cz={-4}  color="#909098" />
      {/* Dead vegetation sticks */}
      {[[-6.2,4.2],[6.2,-5.2],[-4.2,-5.2],[5.2,5.2],[0,-7],[7.5,2]].map(([x,z], i) => (
        <mesh key={i} position={[x,0.18,z]} castShadow>
          <cylinderGeometry args={[0.018,0.038,0.42,4]} />
          <meshStandardMaterial color="#7a7868" roughness={0.95} />
        </mesh>
      ))}
      {/* Auroral glow on the ground (subtle tint) */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.005,0]}>
        <circleGeometry args={[12, 32]} />
        <meshBasicMaterial color="#80ffcc" transparent opacity={0.035} side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}
