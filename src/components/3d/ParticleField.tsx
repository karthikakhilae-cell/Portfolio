import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from 'framer-motion'

const COUNT = 38

function FieldScene({ paused }: { paused: boolean }) {
  const posArr = useMemo(() => new Float32Array(COUNT * 3), [])

  const initial = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 22
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    return arr
  }, [])

  const phases = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        px: Math.random() * Math.PI * 2,
        py: Math.random() * Math.PI * 2,
        sx: 0.04 + Math.random() * 0.07,
        sy: 0.03 + Math.random() * 0.05,
      })),
    []
  )

  const pointsRef = useRef<THREE.Points>(null!)

  useFrame(({ clock }) => {
    if (paused) return
    const t = clock.getElapsedTime()
    for (let i = 0; i < COUNT; i++) {
      const ph = phases[i]
      posArr[i * 3] = initial[i * 3] + Math.sin(t * ph.sx + ph.px) * 1.5
      posArr[i * 3 + 1] = initial[i * 3 + 1] + Math.cos(t * ph.sy + ph.py) * 1.0
      posArr[i * 3 + 2] = initial[i * 3 + 2]
    }
    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posArr, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#5F6B4E" size={0.055} sizeAttenuation transparent opacity={0.18} />
    </points>
  )
}

interface ParticleFieldProps {
  className?: string
}

export default function ParticleField({ className }: ParticleFieldProps) {
  const prefersReduced = useReducedMotion()
  return (
    <div className={className} style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 70 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <FieldScene paused={!!prefersReduced} />
      </Canvas>
    </div>
  )
}
