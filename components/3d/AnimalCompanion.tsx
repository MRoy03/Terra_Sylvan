'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type AnimalType = 'fox' | 'owl' | 'deer' | 'rabbit' | 'none'

interface AnimalCompanionProps {
  type:   AnimalType
  scale?: number
}

function FoxCompanion({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.4
      ref.current.position.y = Math.sin(Date.now() * 0.002) * 0.05
    }
  })
  const s = scale * 0.18
  return (
    <group ref={ref} position={[1.8, 0.1, 0.8]} scale={[s, s, s]}>
      {/* body */}
      <mesh><sphereGeometry args={[1, 8, 6]} /><meshLambertMaterial color="#e07820" /></mesh>
      {/* head */}
      <mesh position={[0, 1.2, 0.6]}><sphereGeometry args={[0.7, 8, 6]} /><meshLambertMaterial color="#e07820" /></mesh>
      {/* snout */}
      <mesh position={[0, 1.1, 1.2]}><sphereGeometry args={[0.28, 6, 5]} /><meshLambertMaterial color="#f0c090" /></mesh>
      {/* nose */}
      <mesh position={[0, 1.15, 1.46]}><sphereGeometry args={[0.1, 5, 4]} /><meshLambertMaterial color="#1a1a1a" /></mesh>
      {/* ears */}
      <mesh position={[-0.35, 1.85, 0.4]}><coneGeometry args={[0.2, 0.5, 6]} /><meshLambertMaterial color="#e07820" /></mesh>
      <mesh position={[0.35, 1.85, 0.4]}><coneGeometry args={[0.2, 0.5, 6]} /><meshLambertMaterial color="#e07820" /></mesh>
      {/* tail */}
      <mesh position={[0, 0.2, -1.2]} rotation={[0.4, 0, 0]}><sphereGeometry args={[0.55, 6, 5]} /><meshLambertMaterial color="#f0f0f0" /></mesh>
      {/* legs */}
      {[[-0.5,0,-0.3],[0.5,0,-0.3],[-0.5,0,0.3],[0.5,0,0.3]].map(([x,y,z],i) => (
        <mesh key={i} position={[x as number, (y as number) - 0.9, z as number]}>
          <cylinderGeometry args={[0.15, 0.12, 0.7, 6]} />
          <meshLambertMaterial color="#e07820" />
        </mesh>
      ))}
    </group>
  )
}

function OwlCompanion({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.5
  })
  const s = scale * 0.2
  return (
    <group ref={ref} position={[-1.8, 0.3, 0.6]} scale={[s, s, s]}>
      {/* body */}
      <mesh><sphereGeometry args={[1, 8, 7]} /><meshLambertMaterial color="#8b6914" /></mesh>
      {/* head */}
      <mesh position={[0, 1.3, 0]}><sphereGeometry args={[0.75, 8, 7]} /><meshLambertMaterial color="#8b6914" /></mesh>
      {/* eye rings */}
      <mesh position={[-0.28, 1.35, 0.6]}><circleGeometry args={[0.28, 12]} /><meshLambertMaterial color="#e0c060" /></mesh>
      <mesh position={[0.28, 1.35, 0.6]}><circleGeometry args={[0.28, 12]} /><meshLambertMaterial color="#e0c060" /></mesh>
      {/* pupils */}
      <mesh position={[-0.28, 1.35, 0.62]}><circleGeometry args={[0.14, 8]} /><meshLambertMaterial color="#1a1a1a" /></mesh>
      <mesh position={[0.28, 1.35, 0.62]}><circleGeometry args={[0.14, 8]} /><meshLambertMaterial color="#1a1a1a" /></mesh>
      {/* beak */}
      <mesh position={[0, 1.1, 0.72]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.12, 0.25, 5]} /></mesh>
      {/* ear tufts */}
      <mesh position={[-0.4, 2.0, 0]}><coneGeometry args={[0.12, 0.35, 5]} /><meshLambertMaterial color="#6b4e0a" /></mesh>
      <mesh position={[0.4, 2.0, 0]}><coneGeometry args={[0.12, 0.35, 5]} /><meshLambertMaterial color="#6b4e0a" /></mesh>
      {/* wings */}
      <mesh position={[-1.1, 0, 0]} rotation={[0, 0, 0.3]}><sphereGeometry args={[0.6, 6, 5]} /><meshLambertMaterial color="#6b4e0a" /></mesh>
      <mesh position={[1.1, 0, 0]} rotation={[0, 0, -0.3]}><sphereGeometry args={[0.6, 6, 5]} /><meshLambertMaterial color="#6b4e0a" /></mesh>
    </group>
  )
}

function DeerCompanion({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.position.y = 0.05 + Math.sin(Date.now() * 0.0015) * 0.04
  })
  const s = scale * 0.16
  return (
    <group ref={ref} position={[2, 0, -0.5]} scale={[s, s, s]}>
      {/* body */}
      <mesh rotation={[0, 0, 0.1]}><sphereGeometry args={[1.1, 8, 6]} /><meshLambertMaterial color="#c07040" /></mesh>
      {/* neck */}
      <mesh position={[0.3, 1.0, 0.2]} rotation={[0.4, 0, -0.3]}><cylinderGeometry args={[0.35, 0.45, 1.1, 7]} /><meshLambertMaterial color="#c07040" /></mesh>
      {/* head */}
      <mesh position={[0.6, 1.8, 0.5]}><sphereGeometry args={[0.55, 8, 6]} /><meshLambertMaterial color="#c07040" /></mesh>
      {/* snout */}
      <mesh position={[0.7, 1.65, 0.9]}><sphereGeometry args={[0.25, 6, 5]} /><meshLambertMaterial color="#d09060" /></mesh>
      {/* ears */}
      <mesh position={[0.3, 2.25, 0.4]}><sphereGeometry args={[0.25, 6, 5]} /><meshLambertMaterial color="#e0a070" /></mesh>
      <mesh position={[0.9, 2.25, 0.4]}><sphereGeometry args={[0.25, 6, 5]} /><meshLambertMaterial color="#e0a070" /></mesh>
      {/* antlers */}
      <mesh position={[0.4, 2.5, 0.3]} rotation={[0.1, 0, -0.2]}><cylinderGeometry args={[0.06, 0.08, 0.8, 5]} /><meshLambertMaterial color="#7a5030" /></mesh>
      <mesh position={[0.8, 2.5, 0.3]} rotation={[0.1, 0, 0.2]}><cylinderGeometry args={[0.06, 0.08, 0.8, 5]} /><meshLambertMaterial color="#7a5030" /></mesh>
      {/* legs */}
      {[[-0.5,-1.1,-0.4],[0.5,-1.1,-0.4],[-0.5,-1.1,0.4],[0.5,-1.1,0.4]].map(([x,y,z],i) => (
        <mesh key={i} position={[x as number, y as number, z as number]}>
          <cylinderGeometry args={[0.14, 0.1, 1.1, 6]} />
          <meshLambertMaterial color="#a86030" />
        </mesh>
      ))}
    </group>
  )
}

function RabbitCompanion({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    if (ref.current) ref.current.position.y = 0.05 + Math.abs(Math.sin(Date.now() * 0.003)) * 0.08
  })
  const s = scale * 0.17
  return (
    <group ref={ref} position={[1.5, 0.05, -1]} scale={[s, s, s]}>
      {/* body */}
      <mesh><sphereGeometry args={[0.9, 8, 6]} /><meshLambertMaterial color="#e8e8e8" /></mesh>
      {/* head */}
      <mesh position={[0, 1.1, 0.3]}><sphereGeometry args={[0.65, 8, 6]} /><meshLambertMaterial color="#e8e8e8" /></mesh>
      {/* ears */}
      <mesh position={[-0.22, 2.1, 0.2]}><capsuleGeometry args={[0.12, 0.7, 4, 8]} /><meshLambertMaterial color="#e8e8e8" /></mesh>
      <mesh position={[0.22, 2.1, 0.2]}><capsuleGeometry args={[0.12, 0.7, 4, 8]} /><meshLambertMaterial color="#e8e8e8" /></mesh>
      {/* inner ears */}
      <mesh position={[-0.22, 2.1, 0.28]}><capsuleGeometry args={[0.07, 0.5, 4, 6]} /><meshLambertMaterial color="#f0a0b0" /></mesh>
      <mesh position={[0.22, 2.1, 0.28]}><capsuleGeometry args={[0.07, 0.5, 4, 6]} /><meshLambertMaterial color="#f0a0b0" /></mesh>
      {/* nose */}
      <mesh position={[0, 1.05, 0.93]}><sphereGeometry args={[0.09, 5, 4]} /><meshLambertMaterial color="#f08090" /></mesh>
      {/* eyes */}
      <mesh position={[-0.24, 1.18, 0.87]}><sphereGeometry args={[0.1, 6, 5]} /><meshLambertMaterial color="#1a1a2e" /></mesh>
      <mesh position={[0.24, 1.18, 0.87]}><sphereGeometry args={[0.1, 6, 5]} /><meshLambertMaterial color="#1a1a2e" /></mesh>
      {/* tail */}
      <mesh position={[0, 0.1, -0.95]}><sphereGeometry args={[0.3, 6, 5]} /><meshLambertMaterial color="#ffffff" /></mesh>
    </group>
  )
}

export function AnimalCompanion({ type, scale = 1 }: AnimalCompanionProps) {
  if (type === 'fox')    return <FoxCompanion    scale={scale} />
  if (type === 'owl')    return <OwlCompanion    scale={scale} />
  if (type === 'deer')   return <DeerCompanion   scale={scale} />
  if (type === 'rabbit') return <RabbitCompanion scale={scale} />
  return null
}
