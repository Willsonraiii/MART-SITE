import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

function useCanvasTexture(draw, w = 256, h = 384) {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    draw(canvas.getContext('2d'), w, h)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    return texture
  }, [draw, w, h])
}

function noodleArt(ctx, w, h) {
  ctx.fillStyle = '#E85D04'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#F4C430'
  ctx.beginPath()
  ctx.moveTo(w * 0.68, 0)
  ctx.bezierCurveTo(w * 0.9, h * 0.3, w * 0.55, h * 0.7, w * 0.78, h)
  ctx.lineTo(w, h)
  ctx.lineTo(w, 0)
  ctx.fill()
  ctx.fillStyle = '#2b2118'
  ctx.beginPath()
  ctx.ellipse(w * 0.42, h * 0.68, 70, 48, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#f0c060'
  ctx.beginPath()
  ctx.ellipse(w * 0.42, h * 0.64, 56, 34, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#d98a2b'
  ctx.lineWidth = 3
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath()
    ctx.arc(w * 0.3 + i * 10, h * 0.64, 10, 0.2, Math.PI - 0.2)
    ctx.stroke()
  }
}

function milkArt(ctx, w, h) {
  ctx.fillStyle = '#f7f4ee'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#2a5f8a'
  ctx.fillRect(0, h * 0.38, w, h * 0.22)
  ctx.fillStyle = '#f7f4ee'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('MILK', w / 2, h * 0.53)
}

function Float({ children, amp = 0.12, speed = 1, offset = 0, rot = 0.08, reduced }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current || reduced) return
    const t = clock.elapsedTime * speed + offset
    ref.current.position.y = Math.sin(t) * amp
    ref.current.rotation.z = Math.cos(t * 0.6) * rot
    ref.current.rotation.y = Math.sin(t * 0.35) * rot * 1.4
  })
  return <group ref={ref}>{children}</group>
}

function Shadow({ position, scale = 1 }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.55 * scale, 20]} />
      <meshBasicMaterial color="#1a1714" transparent opacity={0.14} />
    </mesh>
  )
}

function NoodlePack({ reduced }) {
  const map = useCanvasTexture(noodleArt)
  return (
    <Float amp={0.14} speed={0.9} offset={0.2} reduced={reduced}>
      <mesh rotation={[0.1, -0.45, 0.05]} castShadow>
        <boxGeometry args={[1.05, 1.45, 0.16]} />
        <meshStandardMaterial map={map} roughness={0.38} metalness={0.08} />
      </mesh>
    </Float>
  )
}

function MilkBottle({ reduced }) {
  const map = useCanvasTexture(milkArt, 128, 256)
  return (
    <Float amp={0.1} speed={1.05} offset={1.1} reduced={reduced}>
      <group>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.32, 0.36, 1.15, 24]} />
          <meshStandardMaterial color="#f4f1ea" roughness={0.25} metalness={0.15} map={map} />
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.16, 0.22, 0.28, 16]} />
          <meshStandardMaterial color="#e8e4dc" roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.14, 16]} />
          <meshStandardMaterial color="#1f4e7a" roughness={0.35} />
        </mesh>
      </group>
    </Float>
  )
}

function Apple({ reduced }) {
  return (
    <Float amp={0.16} speed={1.2} offset={2.2} rot={0.12} reduced={reduced}>
      <group>
        <mesh>
          <sphereGeometry args={[0.38, 24, 18]} />
          <meshStandardMaterial color="#c23b22" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.025, 0.03, 0.18, 8]} />
          <meshStandardMaterial color="#3b2a1a" />
        </mesh>
        <mesh position={[0.12, 0.42, 0]} rotation={[0.2, 0, -0.6]}>
          <sphereGeometry args={[0.1, 8, 6, 0, Math.PI]} />
          <meshStandardMaterial color="#3d8a58" />
        </mesh>
      </group>
    </Float>
  )
}

function BreadLoaf({ reduced }) {
  return (
    <Float amp={0.08} speed={0.8} offset={0.7} reduced={reduced}>
      <group rotation={[0.15, 0.6, 0]}>
        <mesh>
          <boxGeometry args={[1.15, 0.55, 0.55]} />
          <meshStandardMaterial color="#e8c07a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.28, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#c9964a" roughness={0.65} />
        </mesh>
      </group>
    </Float>
  )
}

function CarrotVeg({ reduced }) {
  return (
    <Float amp={0.11} speed={1.1} offset={1.6} reduced={reduced}>
      <group rotation={[0.4, 0.2, 0.5]}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.18, 0.9, 10]} />
          <meshStandardMaterial color="#e07a3d" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.52, 0]} rotation={[0.3, 0, 0.2]}>
          <coneGeometry args={[0.05, 0.28, 6]} />
          <meshStandardMaterial color="#2f6b47" />
        </mesh>
        <mesh position={[0.06, 0.5, 0]} rotation={[0.1, 0.4, -0.4]}>
          <coneGeometry args={[0.04, 0.24, 6]} />
          <meshStandardMaterial color="#3d8a58" />
        </mesh>
      </group>
    </Float>
  )
}

function Tomato({ reduced }) {
  return (
    <Float amp={0.13} speed={0.95} offset={2.8} reduced={reduced}>
      <group>
        <mesh>
          <sphereGeometry args={[0.32, 20, 16]} />
          <meshStandardMaterial color="#d4452f" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.08, 8, 6]} />
          <meshStandardMaterial color="#2f6b47" />
        </mesh>
      </group>
    </Float>
  )
}

function GroceryBag({ reduced }) {
  return (
    <Float amp={0.07} speed={0.7} offset={0.4} rot={0.04} reduced={reduced}>
      <group>
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[1.35, 1.5, 0.7]} />
          <meshStandardMaterial color="#c4a574" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <boxGeometry args={[1.42, 0.12, 0.76]} />
          <meshStandardMaterial color="#b39162" roughness={0.8} />
        </mesh>
        <mesh position={[-0.28, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.035, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#8a6a3b" />
        </mesh>
        <mesh position={[0.28, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.035, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#8a6a3b" />
        </mesh>
      </group>
    </Float>
  )
}

function Parallax({ children, enabled, reduced }) {
  const ref = useRef()
  const target = useRef({ x: 0, y: 0 })
  const { gl } = useThree()

  useEffect(() => {
    if (!enabled) return undefined
    const el = gl.domElement
    const move = (e) => {
      const r = el.getBoundingClientRect()
      target.current.x = ((e.clientX - r.left) / r.width - 0.5) * 2
      target.current.y = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    const leave = () => {
      target.current.x = 0
      target.current.y = 0
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [enabled, gl])

  useFrame(() => {
    if (!ref.current) return
    const rx = reduced || !enabled ? 0 : target.current.y * 0.1
    const ry = reduced || !enabled ? 0 : target.current.x * 0.22
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, rx, 0.06)
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, ry, 0.06)
  })

  return <group ref={ref}>{children}</group>
}

function DemandFrame({ active }) {
  const { invalidate } = useThree()
  useEffect(() => {
    if (active) invalidate()
  }, [active, invalidate])
  return null
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.72} />
      <hemisphereLight args={['#fff7ea', '#8aa37a', 0.55]} />
      <directionalLight position={[4, 6, 3]} intensity={1.15} color="#fff4e0" />
      <directionalLight position={[-3, 2, -2]} intensity={0.25} color="#9fc0a8" />
    </>
  )
}

function SceneContents({ mobile, reduced }) {
  return (
    <Parallax enabled={!mobile} reduced={reduced}>
      <group position={[0, -0.15, 0]}>
        <group position={[0, 0.1, -0.4]}>
          <GroceryBag reduced={reduced} />
          <Shadow position={[0, -0.85, 0]} scale={1.5} />
        </group>
        <group position={[-1.35, 0.15, 0.55]}>
          <NoodlePack reduced={reduced} />
          <Shadow position={[0, -0.85, 0]} scale={0.9} />
        </group>
        <group position={[1.35, 0.2, 0.35]}>
          <MilkBottle reduced={reduced} />
          <Shadow position={[0, -0.85, 0]} scale={0.7} />
        </group>
        <group position={[0.85, 1.05, 0.2]}>
          <Apple reduced={reduced} />
        </group>
        {!mobile && (
          <>
            <group position={[-0.95, -0.55, 0.9]}>
              <BreadLoaf reduced={reduced} />
              <Shadow position={[0, -0.45, 0]} scale={0.9} />
            </group>
            <group position={[1.15, -0.45, 0.85]}>
              <CarrotVeg reduced={reduced} />
            </group>
            <group position={[-0.15, 0.95, 0.7]}>
              <Tomato reduced={reduced} />
            </group>
          </>
        )}
      </group>
    </Parallax>
  )
}

export default function Scene3D({ mobile = false, reduced = false }) {
  return (
    <Canvas
      dpr={mobile ? 1 : [1, 1.5]}
      gl={{
        antialias: !mobile,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      camera={{ position: [0, 0.35, mobile ? 7.2 : 6.4], fov: mobile ? 42 : 38 }}
      frameloop={reduced ? 'demand' : 'always'}
      style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.outputColorSpace = THREE.SRGBColorSpace
      }}
    >
      <Lights />
      <DemandFrame active={reduced} />
      <SceneContents mobile={mobile} reduced={reduced} />
    </Canvas>
  )
}
