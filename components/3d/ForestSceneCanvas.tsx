'use client'

import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Stars, Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { ForestTree } from './ForestTree'
import { BiomeType, TreeType, BIOME_CONFIGS } from '@/types'

export interface ForestMember {
  uid:         string
  displayName: string
  treeType:    TreeType
  isOnline:    boolean
  scale:       number
  photoURL?:   string | null
}

interface ForestSceneProps {
  members:       ForestMember[]
  biomeType:     BiomeType
  communityName: string
  highlightUid?: string
  onTreeClick?:  (uid: string) => void
}

function getPositions(count: number): [number, number, number][] {
  const golden = Math.PI * (3 - Math.sqrt(5))
  const maxR   = 5 + Math.sqrt(count) * 2.8
  return Array.from({ length: count }, (_, i) => {
    const r     = Math.sqrt((i + 0.5) / count) * maxR
    const theta = i * golden
    return [r * Math.cos(theta), 0, r * Math.sin(theta)] as [number, number, number]
  })
}

const BIOME_SKY: Record<BiomeType, { rayleigh: number; turbidity: number; mieCoeff: number; sunY: number }> = {
  tropical:      { rayleigh: 3,   turbidity: 18, mieCoeff: 0.008, sunY: 0.60 },
  arid:          { rayleigh: 0.8, turbidity: 5,  mieCoeff: 0.003, sunY: 0.78 },
  mediterranean: { rayleigh: 1,   turbidity: 7,  mieCoeff: 0.004, sunY: 0.65 },
  tundra:        { rayleigh: 2,   turbidity: 12, mieCoeff: 0.006, sunY: 0.20 },
  mangrove:      { rayleigh: 3.5, turbidity: 18, mieCoeff: 0.009, sunY: 0.50 },
  mountain:      { rayleigh: 0.8, turbidity: 4,  mieCoeff: 0.002, sunY: 0.75 },
  temperate:     { rayleigh: 1.5, turbidity: 9,  mieCoeff: 0.005, sunY: 0.55 },
}

const BIOME_COLORS: Record<BiomeType, { ground: string; fog: string; ambient: string }> = {
  tropical:      { ground: '#2a5e1e', fog: '#6db87d', ambient: '#ffffff' },
  arid:          { ground: '#c4a35a', fog: '#d4b87a', ambient: '#ffe8a0' },
  mediterranean: { ground: '#8b7355', fog: '#b8a882', ambient: '#ffffff' },
  tundra:        { ground: '#d0e8f0', fog: '#e8f4f8', ambient: '#c8dce8' },
  mangrove:      { ground: '#2e5a3e', fog: '#8ab89a', ambient: '#c0e0d0' },
  mountain:      { ground: '#7a8a7a', fog: '#b8c8b8', ambient: '#d0e8ff' },
  temperate:     { ground: '#4a7c4a', fog: '#8aaa8a', ambient: '#ffffff' },
}

function BiomeAtmosphere({ biomeType }: { biomeType: BiomeType }) {
  const sky    = BIOME_SKY[biomeType]
  const colors = BIOME_COLORS[biomeType]
  const hour   = new Date().getHours()
  const mins   = new Date().getMinutes()
  const t      = hour + mins / 60
  const isNight = hour >= 20 || hour < 5
  const isDusk  = hour >= 17 && hour < 20
  const isDawn  = hour >= 5  && hour < 7
  const sunElev = Math.max(0.08, Math.sin(((t - 6) / 12) * Math.PI))
  const sunPos: [number, number, number] = isNight
    ? [-20, 5, -60]
    : [0.5 * 100, sunElev * 80 + sky.sunY * 30, -60]

  return (
    <>
      {isNight ? (
        <>
          <color attach="background" args={['#050a14']} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.3} />
        </>
      ) : (
        <Sky
          distance={450000}
          sunPosition={sunPos}
          rayleigh={isDusk || isDawn ? 6 : sky.rayleigh}
          turbidity={isDusk || isDawn ? 22 : sky.turbidity}
          mieCoefficient={isDusk || isDawn ? 0.012 : sky.mieCoeff}
          mieDirectionalG={0.78}
        />
      )}

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <circleGeometry args={[80, 64]} />
        <meshStandardMaterial color={colors.ground} roughness={1} />
      </mesh>

      <fog attach="fog" args={[colors.fog, 30, 90]} />

      <directionalLight
        position={isNight ? [-20, 10, -40] : sunPos}
        intensity={isNight ? 0.18 : isDusk || isDawn ? 0.8 : 1.3}
        color={isDawn ? '#ffb880' : isDusk ? '#ff7030' : isNight ? '#c0d0ff' : '#fffde7'}
        castShadow shadow-mapSize={[1024, 1024]}
        shadow-camera-far={100} shadow-camera-left={-40} shadow-camera-right={40}
        shadow-camera-top={40} shadow-camera-bottom={-40}
      />
      <ambientLight intensity={isNight ? 0.10 : isDusk || isDawn ? 0.28 : 0.42} color={colors.ambient} />
      <hemisphereLight args={[isNight ? '#0a1030' : '#87CEEB', colors.ground, isNight ? 0.12 : 0.28]} />

      <BiomeGroundDetails biomeType={biomeType} />
    </>
  )
}

function BiomeGroundDetails({ biomeType }: { biomeType: BiomeType }) {
  if (biomeType === 'mountain')      return <MountainDetails />
  if (biomeType === 'mangrove')      return <MangroveDetails />
  if (biomeType === 'tundra')        return <TundraDetails />
  if (biomeType === 'arid')          return <AridDetails />
  if (biomeType === 'tropical')      return <TropicalDetails />
  if (biomeType === 'mediterranean') return <MediterraneanDetails />
  return <TemperateDetails />
}

function MountainDetails() {
  const peaks = [
    { x: -60, z: -120, h: 45, r: 22 }, { x: 30,  z: -130, h: 55, r: 28 },
    { x: 90,  z: -110, h: 40, r: 20 }, { x: -100, z: -95, h: 35, r: 18 },
    { x: 55,  z: -140, h: 60, r: 30 }, { x: -30,  z: -100, h: 38, r: 19 },
  ]
  return (
    <>
      {peaks.map((p, i) => (
        <group key={i} position={[p.x, -1, p.z]}>
          <mesh castShadow>
            <coneGeometry args={[p.r, p.h, 7]} />
            <meshStandardMaterial color="#7a8a78" roughness={0.9} />
          </mesh>
          <mesh position={[0, p.h * 0.42, 0]}>
            <coneGeometry args={[p.r * 0.32, p.h * 0.20, 6]} />
            <meshStandardMaterial color="#eaf4fb" roughness={0.5} />
          </mesh>
        </group>
      ))}
      {[[-12,8],[15,-10],[-8,-15],[20,12],[-18,-8],[10,18],[-15,15],[18,-18]].map(([x,z],i) => (
        <mesh key={i} position={[x,0.3,z]} scale={0.5+i*0.08} castShadow>
          <dodecahedronGeometry args={[1,0]} />
          <meshStandardMaterial color="#8a8a80" roughness={0.95} />
        </mesh>
      ))}
      {[[-6,4],[8,-7],[-10,-5],[5,10],[-4,-12],[12,5]].map(([x,z],i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x,0.01,z]}>
          <circleGeometry args={[0.8+i*0.15,10]} />
          <meshBasicMaterial color="#eaf6fb" transparent opacity={0.88} />
        </mesh>
      ))}
    </>
  )
}

function MangroveDetails() {
  const arches = useMemo(() => Array.from({length:16}, (_,i) => {
    const a = (i/16)*Math.PI*2
    const d = 12 + (i%3)*4
    return [
      new THREE.Vector3(Math.cos(a)*(d-3), 3.5, Math.sin(a)*(d-3)),
      new THREE.Vector3(Math.cos(a)*d*0.85, 1.2, Math.sin(a)*d*0.85),
      new THREE.Vector3(Math.cos(a)*d, -0.05, Math.sin(a)*d),
    ]
  }), [])

  return (
    <>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.08,0]}>
        <circleGeometry args={[80,64]} />
        <meshStandardMaterial color="#1a6080" transparent opacity={0.72} roughness={0.08} metalness={0.35} />
      </mesh>
      {Array.from({length:8}, (_,i) => {
        const a = (i/8)*Math.PI*2, d = 10+i*2
        return (
          <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[Math.cos(a)*d,0.01,Math.sin(a)*d]}>
            <circleGeometry args={[2.5,16]} />
            <meshStandardMaterial color="#3a6048" roughness={1} />
          </mesh>
        )
      })}
      {arches.map((pts,i) => (
        <mesh key={i} castShadow
          geometry={new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.06, 5, false)}>
          <meshStandardMaterial color="#7a5030" roughness={0.95} />
        </mesh>
      ))}
      {[5,12,20,30].map((r,i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[0,-0.01,0]}>
          <ringGeometry args={[r,r+0.06,48]} />
          <meshBasicMaterial color="#5aaac8" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.4,-80]}>
        <planeGeometry args={[300,80]} />
        <meshStandardMaterial color="#1a5878" roughness={0.05} metalness={0.4} transparent opacity={0.88} />
      </mesh>
    </>
  )
}

function TundraDetails() {
  return (
    <>
      {[[20,15,1.5],[-18,22,1.2],[25,-20,1.8]].map(([x,z,sx],i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x,-0.02,z]} scale={[sx,1,1]}>
          <circleGeometry args={[5+i,32]} />
          <meshStandardMaterial color="#b0d0e0" transparent opacity={0.82} roughness={0.05} metalness={0.3} />
        </mesh>
      ))}
      {[[-8,6],[6,-10],[-10,-8],[12,10],[-5,15],[8,5]].map(([x,z],i) => (
        <mesh key={i} position={[x,0.2,z]}>
          <sphereGeometry args={[1+i*0.15,8,6]} />
          <meshStandardMaterial color="#deeef8" roughness={0.8} />
        </mesh>
      ))}
      {[[10,8],[-12,5],[8,-12],[-6,-10],[14,-6]].map(([x,z],i) => (
        <mesh key={i} position={[x,0.4,z]} scale={0.5+i*0.1} castShadow>
          <dodecahedronGeometry args={[1,0]} />
          <meshStandardMaterial color="#8898a0" roughness={0.95} />
        </mesh>
      ))}
      {[[5,3],[-3,8],[8,-5],[-8,-3]].map(([x,z],i) => (
        <mesh key={i} rotation={[-Math.PI/2,i*0.8,0]} position={[x,0.02,z]}>
          <planeGeometry args={[3,0.02]} />
          <meshBasicMaterial color="#88a8c0" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  )
}

function AridDetails() {
  return (
    <>
      {[[-30,-50],[25,-60],[-55,-40],[50,-55],[-20,-45],[40,-35]].map(([x,z],i) => (
        <mesh key={i} position={[x,-2,z]}>
          <sphereGeometry args={[8+i*1.5,10,7]} />
          <meshStandardMaterial color="#c8a860" roughness={0.9} />
        </mesh>
      ))}
      {[[10,6],[-14,8],[8,-12],[-10,-8],[16,-5],[-6,14]].map(([x,z],i) => (
        <mesh key={i} position={[x,0.4,z]} scale={0.45+i*0.06} castShadow>
          <dodecahedronGeometry args={[1,0]} />
          <meshStandardMaterial color="#9a8060" roughness={0.95} />
        </mesh>
      ))}
      {[[-4,2],[2,-5],[5,3],[-7,-3],[3,7],[-2,-8]].map(([x,z],i) => (
        <mesh key={i} rotation={[-Math.PI/2,i*0.7,0]} position={[x,0.01,z]}>
          <planeGeometry args={[2+i*0.3,0.02]} />
          <meshBasicMaterial color="#9a7040" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  )
}

function TropicalDetails() {
  return (
    <>
      {[[-15,10],[18,-12],[-12,-14],[16,14],[-20,-8],[20,8],[-10,18],[12,-18]].map(([x,z],i) => (
        <mesh key={i} position={[x,0.4,z]}>
          <sphereGeometry args={[1.5+i*0.1,8,7]} />
          <meshStandardMaterial color={i%2===0?'#1e5018':'#2a6020'} roughness={0.9} />
        </mesh>
      ))}
      {[[-8,4],[8,-6],[-5,-10],[9,9],[-12,-5],[6,12],[-10,8],[10,-10]].map(([x,z],i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x,0.12,z]}>
          <circleGeometry args={[0.22,6]} />
          <meshBasicMaterial color={['#ff4040','#ff9900','#ffcc00','#ff44aa','#dd00ff','#ff6644','#44ddff','#aaff44'][i]} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {[[-6,5],[6,-7],[-4,-8],[7,6]].map(([x,z],i) => (
        <group key={i} position={[x,0,z]}>
          {Array.from({length:6},(_,j) => (
            <mesh key={j} rotation={[0.65,(j/6)*Math.PI*2,0]}>
              <boxGeometry args={[0.06,1.1,0.32]} />
              <meshStandardMaterial color="#1a6020" roughness={0.9} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  )
}

function MediterraneanDetails() {
  return (
    <>
      {[[-40,-70],[20,-80],[-70,-55],[55,-75]].map(([x,z],i) => (
        <mesh key={i} position={[x,-3,z]}>
          <sphereGeometry args={[20+i*3,10,8]} />
          <meshStandardMaterial color={['#9a8865','#a09070','#8a7855','#b0a080'][i]} roughness={0.9} />
        </mesh>
      ))}
      {[[-10,6],[10,-8],[14,4],[-6,-12],[-14,-4],[8,13],[-8,11],[12,-13]].map(([x,z],i) => (
        <group key={i} position={[x,0,z]}>
          <mesh castShadow>
            <sphereGeometry args={[0.55,8,8]} />
            <meshStandardMaterial color="#8068b8" roughness={0.9} />
          </mesh>
          <mesh position={[0,0.4,0]}>
            <cylinderGeometry args={[0.06,0.06,0.8,5]} />
            <meshStandardMaterial color="#88a050" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {Array.from({length:6},(_,i) => (
        <mesh key={i} position={[-18+i*1.3,0.35,15]} castShadow>
          <boxGeometry args={[1.1,0.7,0.6]} />
          <meshStandardMaterial color={i%2===0?'#c0b090':'#b8a888'} roughness={0.95} />
        </mesh>
      ))}
      {[[6,3],[-5,8],[9,-6],[-8,-5],[4,10]].map(([x,z],i) => (
        <mesh key={i} position={[x,0.08,z]} scale={0.18+i*0.03}>
          <dodecahedronGeometry args={[1,0]} />
          <meshStandardMaterial color="#c8b898" roughness={0.9} />
        </mesh>
      ))}
    </>
  )
}

function TemperateDetails() {
  return (
    <>
      {[[-25,-45],[20,-50],[-45,-35],[40,-40],[-15,-50],[30,-35]].map(([x,z],i) => (
        <mesh key={i} castShadow position={[x,2,z]}>
          <sphereGeometry args={[4+i*0.5,8,8]} />
          <meshStandardMaterial color={i%2===0?'#2a5a1a':'#1e4a14'} roughness={0.9} />
        </mesh>
      ))}
      {[[-8,4],[8,-6],[-5,-10],[9,9],[-12,-5],[6,12]].map(([x,z],i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x,0.1,z]}>
          <circleGeometry args={[0.18,5]} />
          <meshBasicMaterial color={['#f9c74f','#f4a261','#e9c46a','#90be6d','#e76f51','#f72585'][i]} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {[[6,4],[-8,6],[5,-8],[-5,-6]].map(([x,z],i) => (
        <mesh key={i} position={[x,0.3,z]} scale={0.3+i*0.05} castShadow>
          <dodecahedronGeometry args={[1,0]} />
          <meshStandardMaterial color="#7a7a72" roughness={0.95} />
        </mesh>
      ))}
      {[[4,3],[-6,5],[3,-5],[-4,-4],[7,-3],[-3,7]].map(([x,z],i) => (
        <group key={i} position={[x,0,z]}>
          {Array.from({length:4},(_,j) => (
            <mesh key={j} position={[Math.cos(j*1.6)*0.08,0.15,Math.sin(j*1.6)*0.08]}
              rotation={[0.25*Math.cos(j*1.6),j*1.6,0.25*Math.sin(j*1.6)]}>
              <planeGeometry args={[0.05,0.28]} />
              <meshStandardMaterial color="#4a8a3a" side={THREE.DoubleSide} roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  )
}

export default function ForestSceneCanvas({
  members, biomeType, communityName, highlightUid,
}: ForestSceneProps) {
  const positions = useMemo(() => getPositions(members.length), [members.length])
  const cfg       = BIOME_CONFIGS[biomeType]
  const colors    = BIOME_COLORS[biomeType]

  return (
    <div className="w-full h-full">
      <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <BiomeAtmosphere biomeType={biomeType} />

          <Billboard position={[0, 1.2, 0]}>
            <Text fontSize={0.55} color="white" outlineWidth={0.04} outlineColor="#000"
              anchorX="center" anchorY="middle" renderOrder={3}>
              {cfg.emoji} {communityName}
            </Text>
          </Billboard>

          <Billboard position={[0, 0.1, 5]}>
            <Text fontSize={0.28} color={colors.fog} anchorX="center" anchorY="middle" renderOrder={1}>
              {cfg.label} Biome · {members.length} {members.length === 1 ? 'tree' : 'trees'}
            </Text>
          </Billboard>

          {members.map((m, i) => (
            <ForestTree
              key={m.uid}
              position={positions[i] ?? [0, 0, 0]}
              treeType={m.treeType}
              displayName={m.displayName}
              isOnline={m.isOnline}
              scale={m.scale}
              isHighlighted={m.uid === highlightUid}
              photoURL={m.photoURL}
            />
          ))}

          <OrbitControls
            enablePan={false}
            minPolarAngle={Math.PI / 10}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={6}
            maxDistance={50}
            autoRotate
            autoRotateSpeed={0.25}
            enableDamping
            dampingFactor={0.06}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
