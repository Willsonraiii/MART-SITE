import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion'

function Spin({ children, reduced }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current || reduced) return
    ref.current.rotation.y += delta * 0.5
  })
  return <group ref={ref}>{children}</group>
}

function Pack({ color }) {
  return (
    <mesh>
      <boxGeometry args={[1.15, 1.55, 0.18]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
  )
}

function Bottle({ color }) {
  return (
    <group>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.32, 0.36, 1.2, 24]} />
        <meshStandardMaterial color={color} roughness={0.28} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 0.28, 16]} />
        <meshStandardMaterial color="#e8e4dc" roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 16]} />
        <meshStandardMaterial color="#1f4e7a" />
      </mesh>
    </group>
  )
}

function Sphere({ color }) {
  return (
    <mesh>
      <sphereGeometry args={[0.72, 28, 20]} />
      <meshStandardMaterial color={color} roughness={0.45} />
    </mesh>
  )
}

function Bag({ color }) {
  return (
    <mesh>
      <boxGeometry args={[1.1, 1.4, 0.35]} />
      <meshStandardMaterial color={color} roughness={0.55} />
    </mesh>
  )
}

function Carton({ color }) {
  return (
    <mesh>
      <boxGeometry args={[0.9, 1.3, 0.55]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  )
}

function Model({ type, color }) {
  if (type === 'bottle') return <Bottle color={color} />
  if (type === 'sphere') return <Sphere color={color} />
  if (type === 'bag') return <Bag color={color} />
  if (type === 'carton') return <Carton color={color} />
  return <Pack color={color} />
}

export default function ProductViewer3D({ model, color = '#c45d2c' }) {
  const reduced = usePrefersReducedMotion()

  return (
    <Canvas
      dpr={[1, 1.25]}
      frameloop={reduced ? 'demand' : 'always'}
      gl={{ antialias: !reduced, alpha: true, powerPreference: 'low-power', stencil: false }}
      camera={{ position: [0, 0.2, 3.4], fov: 40 }}
      style={{ width: '100%', height: '100%', background: 'transparent', touchAction: 'pan-y' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.outputColorSpace = THREE.SRGBColorSpace
      }}
    >
      <ambientLight intensity={0.8} />
      <hemisphereLight args={['#fff7ea', '#8aa37a', 0.5]} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} />
      <Spin reduced={reduced}>
        <Model type={model} color={color} />
      </Spin>
    </Canvas>
  )
}
