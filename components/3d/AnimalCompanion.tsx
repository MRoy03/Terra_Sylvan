'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BOND_GLOW } from '@/lib/companion-bond'

export type AnimalType = 'fox' | 'owl' | 'deer' | 'rabbit' | 'none'

interface AnimalCompanionProps {
  type:       AnimalType
  scale?:     number
  bondLevel?: number
}

// ─── Fox ─────────────────────────────────────────────────────────────────────
function FoxCompanion({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15
    ref.current.position.y = 0.25 + Math.sin(state.clock.elapsedTime * 1.2) * 0.04
  })
  const s = scale * 0.22
  return (
    <group ref={ref} position={[1.8, 0.25, 0.8]} scale={[s, s, s]}>
      {/* Body — elongated */}
      <mesh scale={[1.4, 0.95, 1.1]}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshLambertMaterial color="#d4520a" />
      </mesh>
      {/* Belly (white underside) */}
      <mesh position={[0, -0.2, 0.6]} scale={[0.8, 0.6, 0.5]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshLambertMaterial color="#f5e6d0" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.9, 0.8]} scale={[0.95, 0.9, 1]}>
        <sphereGeometry args={[0.68, 12, 10]} />
        <meshLambertMaterial color="#d4520a" />
      </mesh>
      {/* Snout (muzzle) */}
      <mesh position={[0, 0.72, 1.36]} scale={[0.6, 0.45, 0.8]}>
        <sphereGeometry args={[0.42, 10, 8]} />
        <meshLambertMaterial color="#f0c080" />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.76, 1.74]}>
        <sphereGeometry args={[0.09, 7, 6]} />
        <meshLambertMaterial color="#1a0808" />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.26, 0.98, 1.22]}>
        <sphereGeometry args={[0.10, 7, 6]} />
        <meshLambertMaterial color="#0a0a0a" />
      </mesh>
      <mesh position={[0.26, 0.98, 1.22]}>
        <sphereGeometry args={[0.10, 7, 6]} />
        <meshLambertMaterial color="#0a0a0a" />
      </mesh>
      {/* Ears — tall triangular */}
      <mesh position={[-0.32, 1.58, 0.6]} rotation={[0.1, 0, -0.2]}>
        <coneGeometry args={[0.22, 0.58, 6]} />
        <meshLambertMaterial color="#d4520a" />
      </mesh>
      <mesh position={[0.32, 1.58, 0.6]} rotation={[0.1, 0, 0.2]}>
        <coneGeometry args={[0.22, 0.58, 6]} />
        <meshLambertMaterial color="#d4520a" />
      </mesh>
      {/* Ear inner pink */}
      <mesh position={[-0.32, 1.58, 0.65]} rotation={[0.1, 0, -0.2]}>
        <coneGeometry args={[0.12, 0.38, 5]} />
        <meshLambertMaterial color="#f08080" />
      </mesh>
      <mesh position={[0.32, 1.58, 0.65]} rotation={[0.1, 0, 0.2]}>
        <coneGeometry args={[0.12, 0.38, 5]} />
        <meshLambertMaterial color="#f08080" />
      </mesh>
      {/* Legs — front */}
      <mesh position={[-0.45, -0.88, 0.4]}>
        <capsuleGeometry args={[0.12, 0.75, 4, 8]} />
        <meshLambertMaterial color="#b84008" />
      </mesh>
      <mesh position={[0.45, -0.88, 0.4]}>
        <capsuleGeometry args={[0.12, 0.75, 4, 8]} />
        <meshLambertMaterial color="#b84008" />
      </mesh>
      {/* Legs — back */}
      <mesh position={[-0.45, -0.88, -0.5]}>
        <capsuleGeometry args={[0.13, 0.72, 4, 8]} />
        <meshLambertMaterial color="#b84008" />
      </mesh>
      <mesh position={[0.45, -0.88, -0.5]}>
        <capsuleGeometry args={[0.13, 0.72, 4, 8]} />
        <meshLambertMaterial color="#b84008" />
      </mesh>
      {/* Tail — large and bushy */}
      <mesh position={[0, 0.15, -1.35]} scale={[1.0, 0.9, 1.1]}>
        <sphereGeometry args={[0.65, 10, 8]} />
        <meshLambertMaterial color="#d4520a" />
      </mesh>
      {/* White tail tip */}
      <mesh position={[0, 0.1, -1.85]} scale={[0.7, 0.65, 0.7]}>
        <sphereGeometry args={[0.55, 10, 8]} />
        <meshLambertMaterial color="#f8f4f0" />
      </mesh>
    </group>
  )
}

// ─── Owl ─────────────────────────────────────────────────────────────────────
function OwlCompanion({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((state) => {
    if (!ref.current) return
    // Head group is children[3] (after body, two wing overlays)
    const headGroup = ref.current.children[3] as THREE.Group | undefined
    if (headGroup) {
      headGroup.rotation.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.3
    }
  })
  const s = scale * 0.21
  return (
    <group ref={ref} position={[-2.0, 0.4, 0.5]} scale={[s, s, s]}>
      {/* Body — compact, slightly pear-shaped */}
      <mesh scale={[1, 1.15, 0.9]}>
        <sphereGeometry args={[1.05, 12, 10]} />
        <meshLambertMaterial color="#6a4010" />
      </mesh>
      {/* Wing texture overlays */}
      <mesh position={[-1.05, 0, 0.1]} rotation={[0, 0.3, 0]} scale={[0.4, 0.9, 0.6]}>
        <sphereGeometry args={[1, 8, 7]} />
        <meshLambertMaterial color="#4a2808" />
      </mesh>
      <mesh position={[1.05, 0, 0.1]} rotation={[0, -0.3, 0]} scale={[0.4, 0.9, 0.6]}>
        <sphereGeometry args={[1, 8, 7]} />
        <meshLambertMaterial color="#4a2808" />
      </mesh>
      {/* Head group — rotates for head turning */}
      <group position={[0, 1.4, 0.2]}>
        {/* Head — large round */}
        <mesh scale={[1, 1.05, 0.95]}>
          <sphereGeometry args={[0.88, 12, 10]} />
          <meshLambertMaterial color="#7a5018" />
        </mesh>
        {/* Facial disk */}
        <mesh position={[0, -0.05, 0.72]}>
          <circleGeometry args={[0.68, 16]} />
          <meshBasicMaterial color="#e8d8b0" transparent opacity={0.9} />
        </mesh>
        {/* Eyes — large and golden */}
        <mesh position={[-0.28, 0.06, 0.85]}>
          <circleGeometry args={[0.26, 14]} />
          <meshBasicMaterial color="#e8be00" />
        </mesh>
        <mesh position={[0.28, 0.06, 0.85]}>
          <circleGeometry args={[0.26, 14]} />
          <meshBasicMaterial color="#e8be00" />
        </mesh>
        {/* Pupils */}
        <mesh position={[-0.28, 0.06, 0.87]}>
          <circleGeometry args={[0.15, 10]} />
          <meshBasicMaterial color="#080808" />
        </mesh>
        <mesh position={[0.28, 0.06, 0.87]}>
          <circleGeometry args={[0.15, 10]} />
          <meshBasicMaterial color="#080808" />
        </mesh>
        {/* Beak — small hooked triangle */}
        <mesh position={[0, -0.14, 0.89]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.1, 0.2, 4]} />
          <meshLambertMaterial color="#c8a020" />
        </mesh>
        {/* Ear tufts */}
        <mesh position={[-0.35, 0.85, 0.2]} rotation={[0.15, 0.1, -0.15]}>
          <coneGeometry args={[0.12, 0.38, 5]} />
          <meshLambertMaterial color="#4a2808" />
        </mesh>
        <mesh position={[0.35, 0.85, 0.2]} rotation={[0.15, -0.1, 0.15]}>
          <coneGeometry args={[0.12, 0.38, 5]} />
          <meshLambertMaterial color="#4a2808" />
        </mesh>
      </group>
      {/* Feet/talons */}
      <mesh position={[-0.38, -1.2, 0.1]} rotation={[0.3, 0, 0]}>
        <capsuleGeometry args={[0.1, 0.35, 3, 6]} />
        <meshLambertMaterial color="#c8a020" />
      </mesh>
      <mesh position={[0.38, -1.2, 0.1]} rotation={[0.3, 0, 0]}>
        <capsuleGeometry args={[0.1, 0.35, 3, 6]} />
        <meshLambertMaterial color="#c8a020" />
      </mesh>
    </group>
  )
}

// ─── Deer ────────────────────────────────────────────────────────────────────
function DeerCompanion({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 0.6) * 0.03
  })
  const s = scale * 0.18
  return (
    <group ref={ref} position={[2.2, 0.3, -0.4]} scale={[s, s, s]}>
      {/* Body — slim oval */}
      <mesh scale={[1.5, 1, 1.15]}>
        <sphereGeometry args={[1.1, 12, 10]} />
        <meshLambertMaterial color="#c07838" />
      </mesh>
      {/* Neck — angled forward */}
      <mesh position={[0.35, 1.0, 0.45]} rotation={[0.6, 0, -0.25]}>
        <capsuleGeometry args={[0.32, 1.0, 5, 8]} />
        <meshLambertMaterial color="#c07838" />
      </mesh>
      {/* Head */}
      <mesh position={[0.65, 2.0, 0.8]} scale={[0.9, 0.85, 1.0]}>
        <sphereGeometry args={[0.55, 10, 9]} />
        <meshLambertMaterial color="#c07838" />
      </mesh>
      {/* Snout */}
      <mesh position={[0.72, 1.85, 1.22]} scale={[0.7, 0.55, 0.9]}>
        <sphereGeometry args={[0.32, 8, 7]} />
        <meshLambertMaterial color="#e0a878" />
      </mesh>
      {/* Nose */}
      <mesh position={[0.76, 1.86, 1.52]}>
        <sphereGeometry args={[0.09, 6, 5]} />
        <meshLambertMaterial color="#201010" />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.42, 2.06, 1.08]}>
        <sphereGeometry args={[0.09, 7, 6]} />
        <meshLambertMaterial color="#080808" />
      </mesh>
      <mesh position={[0.92, 2.06, 1.08]}>
        <sphereGeometry args={[0.09, 7, 6]} />
        <meshLambertMaterial color="#080808" />
      </mesh>
      {/* Ears — large */}
      <mesh position={[0.28, 2.35, 0.72]} rotation={[0.1, 0, -0.4]} scale={[0.6, 1, 0.4]}>
        <sphereGeometry args={[0.38, 8, 7]} />
        <meshLambertMaterial color="#d88848" />
      </mesh>
      <mesh position={[1.02, 2.35, 0.72]} rotation={[0.1, 0, 0.4]} scale={[0.6, 1, 0.4]}>
        <sphereGeometry args={[0.38, 8, 7]} />
        <meshLambertMaterial color="#d88848" />
      </mesh>
      {/* Antlers — main stems */}
      <mesh position={[0.38, 2.58, 0.58]} rotation={[0.15, 0, -0.3]}>
        <capsuleGeometry args={[0.055, 0.75, 3, 5]} />
        <meshLambertMaterial color="#6a4020" />
      </mesh>
      <mesh position={[0.92, 2.58, 0.58]} rotation={[0.15, 0, 0.3]}>
        <capsuleGeometry args={[0.055, 0.75, 3, 5]} />
        <meshLambertMaterial color="#6a4020" />
      </mesh>
      {/* Antler branches */}
      <mesh position={[0.2, 3.0, 0.5]} rotation={[-0.2, 0, -0.6]}>
        <capsuleGeometry args={[0.04, 0.4, 3, 5]} />
        <meshLambertMaterial color="#6a4020" />
      </mesh>
      <mesh position={[1.1, 3.0, 0.5]} rotation={[-0.2, 0, 0.6]}>
        <capsuleGeometry args={[0.04, 0.4, 3, 5]} />
        <meshLambertMaterial color="#6a4020" />
      </mesh>
      {/* Legs — long slender (4) */}
      <mesh position={[-0.52, -1.1, 0.42]}>
        <capsuleGeometry args={[0.13, 1.1, 4, 7]} />
        <meshLambertMaterial color="#a06030" />
      </mesh>
      <mesh position={[0.52, -1.1, 0.42]}>
        <capsuleGeometry args={[0.13, 1.1, 4, 7]} />
        <meshLambertMaterial color="#a06030" />
      </mesh>
      <mesh position={[-0.52, -1.1, -0.45]}>
        <capsuleGeometry args={[0.13, 1.1, 4, 7]} />
        <meshLambertMaterial color="#a06030" />
      </mesh>
      <mesh position={[0.52, -1.1, -0.45]}>
        <capsuleGeometry args={[0.13, 1.1, 4, 7]} />
        <meshLambertMaterial color="#a06030" />
      </mesh>
      {/* White tail spot */}
      <mesh position={[0, 0.15, -1.2]}>
        <sphereGeometry args={[0.25, 7, 6]} />
        <meshLambertMaterial color="#f0e8e0" />
      </mesh>
    </group>
  )
}

// ─── Rabbit ──────────────────────────────────────────────────────────────────
function RabbitCompanion({ scale = 1 }: { scale?: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.position.y = 0.18 + Math.abs(Math.sin(t * 2.0)) * 0.14
    ref.current.rotation.y = Math.sin(t * 0.8) * 0.2
  })
  const s = scale * 0.19
  return (
    <group ref={ref} position={[1.4, 0.18, -1.0]} scale={[s, s, s]}>
      {/* Body — round and chubby */}
      <mesh scale={[1, 1.1, 1]}>
        <sphereGeometry args={[1.0, 11, 9]} />
        <meshLambertMaterial color="#dcdad6" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.1, 0.5]} scale={[0.92, 0.88, 0.95]}>
        <sphereGeometry args={[0.72, 11, 9]} />
        <meshLambertMaterial color="#dcdad6" />
      </mesh>
      {/* Cheek puffs */}
      <mesh position={[-0.38, 1.0, 0.88]} scale={[0.6, 0.55, 0.6]}>
        <sphereGeometry args={[0.32, 8, 7]} />
        <meshLambertMaterial color="#e8e4e0" />
      </mesh>
      <mesh position={[0.38, 1.0, 0.88]} scale={[0.6, 0.55, 0.6]}>
        <sphereGeometry args={[0.32, 8, 7]} />
        <meshLambertMaterial color="#e8e4e0" />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.98, 1.18]}>
        <sphereGeometry args={[0.09, 6, 5]} />
        <meshLambertMaterial color="#f08090" />
      </mesh>
      {/* Eyes — large round */}
      <mesh position={[-0.28, 1.18, 1.04]}>
        <sphereGeometry args={[0.13, 8, 7]} />
        <meshLambertMaterial color="#1a1a2a" />
      </mesh>
      <mesh position={[0.28, 1.18, 1.04]}>
        <sphereGeometry args={[0.13, 8, 7]} />
        <meshLambertMaterial color="#1a1a2a" />
      </mesh>
      {/* Ears — very long and upright */}
      <mesh position={[-0.28, 2.28, 0.35]} rotation={[0.1, 0.05, -0.08]}>
        <capsuleGeometry args={[0.15, 1.08, 4, 8]} />
        <meshLambertMaterial color="#dcdad6" />
      </mesh>
      <mesh position={[0.28, 2.28, 0.35]} rotation={[0.1, -0.05, 0.08]}>
        <capsuleGeometry args={[0.15, 1.08, 4, 8]} />
        <meshLambertMaterial color="#dcdad6" />
      </mesh>
      {/* Inner ear pink */}
      <mesh position={[-0.28, 2.28, 0.48]} rotation={[0.1, 0.05, -0.08]}>
        <capsuleGeometry args={[0.07, 0.85, 3, 6]} />
        <meshLambertMaterial color="#f0a0b0" />
      </mesh>
      <mesh position={[0.28, 2.28, 0.48]} rotation={[0.1, -0.05, 0.08]}>
        <capsuleGeometry args={[0.07, 0.85, 3, 6]} />
        <meshLambertMaterial color="#f0a0b0" />
      </mesh>
      {/* Front legs — shorter */}
      <mesh position={[-0.38, -0.82, 0.42]}>
        <capsuleGeometry args={[0.14, 0.55, 3, 7]} />
        <meshLambertMaterial color="#d0ccc8" />
      </mesh>
      <mesh position={[0.38, -0.82, 0.42]}>
        <capsuleGeometry args={[0.14, 0.55, 3, 7]} />
        <meshLambertMaterial color="#d0ccc8" />
      </mesh>
      {/* Back legs — longer */}
      <mesh position={[-0.45, -0.88, -0.48]} rotation={[0.3, 0, 0]}>
        <capsuleGeometry args={[0.17, 0.72, 3, 7]} />
        <meshLambertMaterial color="#d0ccc8" />
      </mesh>
      <mesh position={[0.45, -0.88, -0.48]} rotation={[0.3, 0, 0]}>
        <capsuleGeometry args={[0.17, 0.72, 3, 7]} />
        <meshLambertMaterial color="#d0ccc8" />
      </mesh>
      {/* Tail — cotton ball */}
      <mesh position={[0, 0.12, -1.05]}>
        <sphereGeometry args={[0.32, 8, 7]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function AnimalCompanion({ type, scale = 1, bondLevel = 0 }: AnimalCompanionProps) {
  const bondScale   = 1 + bondLevel * 0.09
  const effectiveS  = scale * bondScale
  const glowColor   = BOND_GLOW[Math.min(bondLevel, 4)] as string
  const glowIntensity = bondLevel > 0 ? 0.6 + bondLevel * 0.4 : 0

  const inner = (() => {
    if (type === 'fox')    return <FoxCompanion    scale={effectiveS} />
    if (type === 'owl')    return <OwlCompanion    scale={effectiveS} />
    if (type === 'deer')   return <DeerCompanion   scale={effectiveS} />
    if (type === 'rabbit') return <RabbitCompanion scale={effectiveS} />
    return null
  })()

  if (!inner) return null

  return (
    <group>
      {inner}
      {bondLevel > 0 && glowColor !== 'none' && (
        <pointLight
          position={[1.8, 1.2, 0.8]}
          color={glowColor}
          intensity={glowIntensity}
          distance={3.5}
          decay={2}
        />
      )}
    </group>
  )

}
