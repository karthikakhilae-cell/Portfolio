import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from 'framer-motion'

const NODE_COUNT = 55
const MAX_CONNECTIONS = 180

function NeuralScene({ paused }: { paused: boolean }) {
  const posArr = useMemo(() => new Float32Array(NODE_COUNT * 3), [])
  const lineArr = useMemo(() => new Float32Array(MAX_CONNECTIONS * 6), [])

  const initial = useMemo(() => {
    const arr = new Float32Array(NODE_COUNT * 3)
    for (let i = 0; i < NODE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 24
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    return arr
  }, [])

  const phases = useMemo(
    () =>
      Array.from({ length: NODE_COUNT }, () => ({
        px: Math.random() * Math.PI * 2,
        py: Math.random() * Math.PI * 2,
        sx: 0.1 + Math.random() * 0.15,
        sy: 0.07 + Math.random() * 0.1,
      })),
    []
  )

  const pointsRef = useRef<THREE.Points>(null!)
  const linesRef = useRef<THREE.LineSegments>(null!)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame(({ clock }) => {
    if (paused) return
    const t = clock.getElapsedTime()
    const mx = mouseRef.current.x * 1.2
    const my = mouseRef.current.y * 0.8

    for (let i = 0; i < NODE_COUNT; i++) {
      const ph = phases[i]
      posArr[i * 3] = initial[i * 3] + Math.sin(t * ph.sx + ph.px) * 1.1 + mx
      posArr[i * 3 + 1] = initial[i * 3 + 1] + Math.cos(t * ph.sy + ph.py) * 0.7 + my
      posArr[i * 3 + 2] = initial[i * 3 + 2]
    }

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }

    let count = 0
    const threshSq = 5.0 * 5.0
    for (let i = 0; i < NODE_COUNT && count < MAX_CONNECTIONS; i++) {
      for (let j = i + 1; j < NODE_COUNT && count < MAX_CONNECTIONS; j++) {
        const dx = posArr[i * 3] - posArr[j * 3]
        const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1]
        const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2]
        if (dx * dx + dy * dy + dz * dz < threshSq) {
          lineArr[count * 6] = posArr[i * 3]
          lineArr[count * 6 + 1] = posArr[i * 3 + 1]
          lineArr[count * 6 + 2] = posArr[i * 3 + 2]
          lineArr[count * 6 + 3] = posArr[j * 3]
          lineArr[count * 6 + 4] = posArr[j * 3 + 1]
          lineArr[count * 6 + 5] = posArr[j * 3 + 2]
          count++
        }
      }
    }
    for (let i = count; i < MAX_CONNECTIONS; i++) lineArr.fill(0, i * 6, i * 6 + 6)

    if (linesRef.current) {
      linesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[posArr, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#F2F0E8" size={0.07} sizeAttenuation transparent opacity={0.9} />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lineArr, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#9AAA80" transparent opacity={0.3} />
      </lineSegments>
    </>
  )
}

export default function NeuralBackground() {
  const prefersReduced = useReducedMotion()
  return (
    <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 70 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <NeuralScene paused={!!prefersReduced} />
      </Canvas>
    </div>
  )
}
