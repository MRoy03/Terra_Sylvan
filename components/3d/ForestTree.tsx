'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { TreeType, TREE_CONFIGS } from '@/types'
import { getCurrentSeason, getSeasonLeafColor } from '@/lib/seasons'

interface ForestTreeProps {
  position:       [number, number, number]
  treeType:       TreeType
  displayName:    string
  isOnline:       boolean
  scale?:         number
  isHighlighted?: boolean
  photoURL?:      string | null
}

// Simple photo disc on trunk for forest view
function MiniPhoto({ url, y, r }: { url: string; y: number; r: number }) {
  const tex = useTexture(url)
  return (
    <Billboard position={[0, y, r + 0.015]}>
      <mesh>
        <circleGeometry args={[r * 0.7, 20]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
    </Billboard>
  )
}

export function ForestTree({
  position, treeType, displayName, isOnline, scale = 1, isHighlighted = false, photoURL,
}: ForestTreeProps) {
  const ref    = useRef<THREE.Group>(null!)
  const cfg    = TREE_CONFIGS[treeType] ?? TREE_CONFIGS.oak
  const season = getCurrentSeason()
  const colors = getSeasonLeafColor(season, treeType)
  const family = cfg.family

  const th = (family === 'shrub' ? 0.1 : 2.8) * scale
  const tr = 0.22 * scale
  const cr = (family === 'shrub' ? 0.8 : family === 'cypress' ? 0.35 : family === 'palm' ? 0.5 : 1.5) * scale

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime() + position[0]
    ref.current.rotation.z = Math.sin(t * 0.4) * 0.015
  })

  const roots = useMemo(() => {
    if (family === 'bamboo' || family === 'cactus' || family === 'shrub' || family === 'palm') return []
    return [0, 120, 240].map((deg) => {
      const rad = (deg * Math.PI) / 180
      const pts = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(rad) * 0.7 * scale, -0.1, Math.sin(rad) * 0.7 * scale),
        new THREE.Vector3(Math.cos(rad) * 1.4 * scale, 0, Math.sin(rad) * 1.4 * scale),
      ]
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, 0.04 * scale, 5, false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, family])

  function renderCanopy() {
    switch (family) {
      case 'conical':
      case 'bristlecone': {
        const isCypress = treeType === 'cypress'
        const wm = isCypress ? 0.3 : treeType === 'stone_pine' ? 1.5 : 1.0
        const hm = isCypress ? 1.7 : treeType === 'stone_pine' ? 0.4 : 1.0
        const tiers = isCypress ? 5 : 3
        return (
          <group position={[0, th * 0.1, 0]}>
            {Array.from({ length: tiers }).map((_, i) => (
              <mesh key={i} castShadow
                position={[0, scale * 1.0 * hm + (tiers - i) * scale * 0.8 * hm, 0]}>
                <coneGeometry args={[scale * (1.0 - i/tiers * 0.5) * wm, scale * 0.75 * hm, 8]} />
                <meshStandardMaterial color={i % 2 === 0 ? colors[0] : colors[1]} roughness={0.8} />
              </mesh>
            ))}
          </group>
        )
      }
      case 'cypress': {
        return (
          <group position={[0, th * 0.1, 0]}>
            {Array.from({ length: 5 }).map((_, i) => (
              <mesh key={i} castShadow position={[0, scale * 0.6 + i * scale * 0.8, 0]}>
                <coneGeometry args={[scale * 0.28, scale * 0.75, 8]} />
                <meshStandardMaterial color={colors[i % 2]} roughness={0.8} />
              </mesh>
            ))}
          </group>
        )
      }
      case 'willow': {
        return (
          <group position={[0, th, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[cr * 0.8, 10, 10]} />
              <meshStandardMaterial color={colors[0]} roughness={0.8} />
            </mesh>
            {[0, 1.2, 2.5, 4.0].map((a, i) => {
              const pts = [
                new THREE.Vector3(0,0,0),
                new THREE.Vector3(Math.cos(a) * cr, -cr*0.5, Math.sin(a) * cr),
                new THREE.Vector3(Math.cos(a) * cr*1.3, -cr*1.1, Math.sin(a) * cr*1.3),
              ]
              return (
                <mesh key={i} geometry={new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 6, 0.012*scale, 4, false)}>
                  <meshStandardMaterial color={colors[1]} roughness={0.9} side={THREE.DoubleSide} />
                </mesh>
              )
            })}
          </group>
        )
      }
      case 'bamboo': {
        return (
          <>
            {[0, 1.1, 2.2, 3.4].map((a, i) => {
              const x = Math.cos(a) * 0.3 * scale, z = Math.sin(a) * 0.3 * scale
              return (
                <group key={i} position={[x, 0, z]}>
                  <mesh castShadow position={[0, th * 0.6, 0]}>
                    <cylinderGeometry args={[0.06*scale, 0.08*scale, th*1.2, 6]} />
                    <meshStandardMaterial color={colors[i%2]} roughness={0.7} />
                  </mesh>
                  <mesh position={[0, th * 1.2, 0]}>
                    <sphereGeometry args={[scale*0.4, 7,7]} />
                    <meshStandardMaterial color={colors[2]} roughness={0.8} transparent opacity={0.85} />
                  </mesh>
                </group>
              )
            })}
          </>
        )
      }
      case 'birch': {
        return (
          <group position={[0, th * 0.88, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[cr * 0.9, 10, 10]} />
              <meshStandardMaterial color={colors[0]} roughness={0.75} transparent opacity={0.9} />
            </mesh>
            <mesh castShadow position={[cr*0.3, -cr*0.2, 0]}>
              <sphereGeometry args={[cr * 0.55, 8, 8]} />
              <meshStandardMaterial color={colors[1]} roughness={0.75} transparent opacity={0.9} />
            </mesh>
          </group>
        )
      }
      case 'palm': {
        const frondCount = 6
        return (
          <group position={[0, th, 0]}>
            {Array.from({ length: frondCount }).map((_, i) => (
              <group key={i} rotation={[0.8, (i/frondCount)*Math.PI*2, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.06*scale, scale*1.6, 0.28*scale]} />
                  <meshStandardMaterial color={colors[i%2]} roughness={0.8} />
                </mesh>
              </group>
            ))}
          </group>
        )
      }
      case 'banana': {
        return (
          <group position={[0, th, 0]}>
            {Array.from({ length: 5 }).map((_, i) => (
              <group key={i} rotation={[0.6, (i/5)*Math.PI*2, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.08*scale, scale*1.8, 0.55*scale]} />
                  <meshStandardMaterial color={colors[i%2]} roughness={0.8} side={THREE.DoubleSide} />
                </mesh>
              </group>
            ))}
          </group>
        )
      }
      case 'cactus': {
        return (
          <group>
            <mesh castShadow position={[0, th*0.6, 0]}>
              <cylinderGeometry args={[0.22*scale, 0.28*scale, th*1.2, 8]} />
              <meshStandardMaterial color={colors[0]} roughness={0.8} />
            </mesh>
            <mesh castShadow
              geometry={new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, th*0.45, 0),
                new THREE.Vector3(0.7*scale, th*0.5, 0),
                new THREE.Vector3(0.9*scale, th*0.9, 0),
              ]), 8, 0.14*scale, 6, false)}>
              <meshStandardMaterial color={colors[1]} roughness={0.8} />
            </mesh>
            <mesh castShadow
              geometry={new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, th*0.5, 0),
                new THREE.Vector3(-0.7*scale, th*0.55, 0),
                new THREE.Vector3(-0.9*scale, th*0.95, 0),
              ]), 8, 0.13*scale, 6, false)}>
              <meshStandardMaterial color={colors[1]} roughness={0.8} />
            </mesh>
          </group>
        )
      }
      case 'joshua': {
        return (
          <group>
            {[0, 2.1, 4.2].map((a, i) => {
              const pts = [
                new THREE.Vector3(0, th*0.7, 0),
                new THREE.Vector3(Math.cos(a)*cr*0.7, th*0.7+cr*0.5, Math.sin(a)*cr*0.7),
                new THREE.Vector3(Math.cos(a)*cr, th*0.7+cr, Math.sin(a)*cr),
              ]
              return (
                <mesh key={i} castShadow
                  geometry={new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 6, 0.1*scale, 5, false)}>
                  <meshStandardMaterial color={colors[i%2]} roughness={0.9} />
                </mesh>
              )
            })}
          </group>
        )
      }
      case 'acacia': {
        return (
          <group position={[0, th, 0]}>
            <mesh castShadow rotation={[-Math.PI/2,0,0]}>
              <cylinderGeometry args={[cr, cr*1.1, 0.2*scale, 12]} />
              <meshStandardMaterial color={colors[0]} roughness={0.85} />
            </mesh>
          </group>
        )
      }
      case 'mangrove': {
        return (
          <group>
            {[0, 2.1, 4.2, 5.5].map((a, i) => {
              const pts = [
                new THREE.Vector3(0, th*0.8, 0),
                new THREE.Vector3(Math.cos(a)*0.6*scale, 0.4*scale, Math.sin(a)*0.6*scale),
                new THREE.Vector3(Math.cos(a)*scale, -0.05, Math.sin(a)*scale),
              ]
              return (
                <mesh key={i} castShadow
                  geometry={new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, 0.035*scale, 4, false)}>
                  <meshStandardMaterial color={cfg.trunkColor} roughness={0.95} />
                </mesh>
              )
            })}
            <group position={[0, th, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[cr, 10, 10]} />
                <meshStandardMaterial color={colors[0]} roughness={0.82} />
              </mesh>
            </group>
          </group>
        )
      }
      case 'shrub': {
        return (
          <group position={[0, 0.15*scale, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[cr, 10, 10]} />
              <meshStandardMaterial color={colors[0]} roughness={0.9} />
            </mesh>
            <mesh castShadow position={[cr*0.5, -cr*0.3, 0]}>
              <sphereGeometry args={[cr*0.7, 8, 8]} />
              <meshStandardMaterial color={colors[1]} roughness={0.9} />
            </mesh>
          </group>
        )
      }
      default: {
        // deciduous — 3 overlapping spheres
        return (
          <group position={[0, th * 0.88, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[cr, 12, 12]} />
              <meshStandardMaterial color={colors[0]} roughness={0.85} />
            </mesh>
            <mesh castShadow position={[cr*0.45, -cr*0.18, 0]}>
              <sphereGeometry args={[cr*0.7, 8, 8]} />
              <meshStandardMaterial color={colors[1]} roughness={0.85} />
            </mesh>
            <mesh castShadow position={[-cr*0.35, -cr*0.25, cr*0.2]}>
              <sphereGeometry args={[cr*0.6, 8, 8]} />
              <meshStandardMaterial color={colors[2]} roughness={0.85} />
            </mesh>
          </group>
        )
      }
    }
  }

  const showTrunk = family !== 'bamboo' && family !== 'cactus' && family !== 'mangrove' && family !== 'shrub' && family !== 'palm'

  return (
    <group ref={ref} position={position}>
      {roots.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial color={cfg.trunkColor} roughness={0.95} />
        </mesh>
      ))}

      {showTrunk && (
        <mesh castShadow position={[0, th / 2, 0]}>
          <cylinderGeometry args={[tr * 0.6, tr, th, 8]} />
          <meshStandardMaterial color={cfg.trunkColor} roughness={0.9} />
        </mesh>
      )}

      {photoURL && showTrunk && (
        <MiniPhoto url={photoURL} y={th * 0.35} r={tr} />
      )}

      {renderCanopy()}

      {isHighlighted && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[cr * 0.8, cr * 1.1, 32]} />
          <meshBasicMaterial color="#4ade80" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}

      <mesh position={[0, th * 0.88 + cr * 1.25, 0]}>
        <sphereGeometry args={[0.07 * scale, 6, 6]} />
        <meshBasicMaterial color={isOnline ? '#4ade80' : '#6b7280'} />
      </mesh>

      <Billboard position={[0, th * 0.88 + cr * 1.6, 0]}>
        <Text fontSize={0.22 * scale} color="white" outlineWidth={0.02} outlineColor="#000"
          anchorX="center" anchorY="middle" renderOrder={2}>
          {displayName.length > 12 ? displayName.slice(0, 11) + '…' : displayName}
        </Text>
      </Billboard>
    </group>
  )
}
