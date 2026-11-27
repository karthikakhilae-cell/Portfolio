import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from 'framer-motion'

function OrbScene({ paused }: { paused: boolean }) {
  const groupRef = useRef<THREE.Group>(null!)
  const innerRef = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    if (paused) return
    const t = clock.getElapsedTime()
    groupRef.current.rotation.x = Math.sin(t * 0.25) * 0.18
    groupRef.current.rotation.y = t * 0.32
    groupRef.current.position.y = Math.sin(t * 0.55) * 0.28
    innerRef.current.rotation.y = -t * 0.48
    innerRef.current.rotation.z = t * 0.18
  })

  return (
    <group ref={groupRef}>
      {/* Outer icosahedron wireframe */}
      <mesh>
        <icosahedronGeometry args={[2.4, 1]} />
        <meshBasicMaterial color="#1D1C1A" wireframe transparent opacity={0.5} />
      </mesh>
      {/* Inner counter-rotating icosahedron */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[1.45, 0]} />
        <meshBasicMaterial color="#5F6B4E" wireframe transparent opacity={0.4} />
      </mesh>
      {/* Translucent inner shell */}
      <mesh>
        <icosahedronGeometry args={[2.2, 1]} />
        <meshStandardMaterial color="#5F6B4E" transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>
      {/* Core glow */}
      <mesh>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial
          color="#5F6B4E"
          emissive="#5F6B4E"
          emissiveIntensity={1.4}
          transparent
          opacity={0.8}
        />
      </mesh>
      <pointLight color="#5F6B4E" intensity={2.5} distance={7} decay={2} />
    </group>
  )
}

interface FloatingOrbProps {
  className?: string
}

export default function FloatingOrb({ className }: FloatingOrbProps) {
  const prefersReduced = useReducedMotion()
  return (
    <div className={className} style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.2} />
        <OrbScene paused={!!prefersReduced} />
      </Canvas>
    </div>
  )
}
