import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// ── Theme palette (matches index.css) ─────────────────────────────
const ACCENT = new THREE.Color("#8A8A60");
const ACCENT_BRIGHT = new THREE.Color("#D8D8AC");
const CREAM = new THREE.Color("#F0EDE8");

const MODEL_URL = "/jellyfish.glb";

// ══════════════════════════════════════════════════════════════════
//  Fresnel "jelly glass" shader for the Blender bell meshes
// ══════════════════════════════════════════════════════════════════

const bellVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMinY;
  uniform float uMaxY;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vHeight;

  void main() {
    vec3 pos = position;
    float h = clamp((pos.y - uMinY) / max(uMaxY - uMinY, 0.001), 0.0, 1.0);
    vHeight = h;

    // muscle contraction wave traveling from apex to rim
    float wave = sin(uTime * 2.2 - (1.0 - h) * 4.0);
    float squeeze = 1.0 + wave * 0.07 * (1.0 - h);
    pos.x *= squeeze;
    pos.z *= squeeze;
    pos.y += wave * 0.04 * h * (uMaxY - uMinY);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const bellFragmentShader = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uRimColor;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vHeight;

  void main() {
    float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), 2.2);
    float innerGlow = smoothstep(0.45, 1.0, vHeight) * 0.35;
    float shimmer = 0.9 + 0.1 * sin(uTime * 1.3 + vHeight * 8.0);
    vec3 color = mix(uBaseColor, uRimColor, fres) * shimmer;
    float alpha = (0.06 + fres * 0.75 + innerGlow) * 0.9;
    gl_FragColor = vec4(color + uRimColor * innerGlow, alpha);
  }
`;

function makeBellMaterial(geo: THREE.BufferGeometry, inner: boolean) {
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  return new THREE.ShaderMaterial({
    vertexShader: bellVertexShader,
    fragmentShader: bellFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uMinY: { value: bb.min.y },
      uMaxY: { value: bb.max.y },
      // champagne glow: mostly warm cream light, olive only as a tint
      uBaseColor: {
        value: inner
          ? new THREE.Color("#B8B49A").multiplyScalar(0.6)
          : new THREE.Color("#E8E4CE").multiplyScalar(0.85),
      },
      uRimColor: {
        value: inner
          ? CREAM.clone().multiplyScalar(1.1)
          : new THREE.Color("#F5F1DC").multiplyScalar(1.35),
      },
    },
    transparent: true,
    side: inner ? THREE.BackSide : THREE.DoubleSide,
    depthWrite: false,
  });
}

// Sway injection for tentacles / oral arms (runs on the GPU)
function makeSwayMaterial(
  color: THREE.Color,
  opacity: number,
  amp: number,
  timeUniform: { value: number },
  phase: number
) {
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.65,
    transparent: true,
    opacity,
    depthWrite: false,
    toneMapped: false,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = timeUniform;
    shader.uniforms.uAmp = { value: amp };
    shader.uniforms.uPhase = { value: phase };
    shader.vertexShader =
      `uniform float uTime;\nuniform float uAmp;\nuniform float uPhase;\n` +
      shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        {
          // deeper below the bell → bigger, slower drag waves
          float depth = max(-transformed.y, 0.0);
          float w = depth * depth * 0.12;
          transformed.x += sin(uTime * 1.4 - depth * 1.8 + uPhase) * uAmp * w;
          transformed.z += cos(uTime * 1.1 - depth * 1.4 + uPhase * 1.7) * uAmp * 0.8 * w;
        }`
      );
  };
  return mat;
}

// ══════════════════════════════════════════════════════════════════
//  The Blender model, re-materialed + animated
// ══════════════════════════════════════════════════════════════════

function BlenderJellyfish() {
  const { scene } = useGLTF(MODEL_URL, true);
  const timeUniform = useMemo(() => ({ value: 0 }), []);
  const bellMats = useRef<THREE.ShaderMaterial[]>([]);
  const organMats = useRef<THREE.MeshBasicMaterial[]>([]);

  const model = useMemo(() => {
    const root = scene.clone(true);
    bellMats.current = [];
    organMats.current = [];

    // normalize: center on bell, scale to ~2.4 units tall overall bell width
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const scale = 2.4 / Math.max(size.x, size.z);
    root.scale.setScalar(scale);
    const center = box.getCenter(new THREE.Vector3());
    root.position.set(-center.x * scale, -box.max.y * scale + 1.2, -center.z * scale);

    let ti = 0;
    root.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      const n = o.name;
      if (n.startsWith("BellOuter")) {
        o.material = makeBellMaterial(o.geometry, false);
        bellMats.current.push(o.material as THREE.ShaderMaterial);
        o.renderOrder = 10;
      } else if (n.startsWith("BellInner")) {
        o.material = makeBellMaterial(o.geometry, true);
        bellMats.current.push(o.material as THREE.ShaderMaterial);
        o.renderOrder = 9;
      } else if (n.startsWith("Gonad")) {
        const m = new THREE.MeshBasicMaterial({
          color: CREAM,
          transparent: true,
          opacity: 0.55,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        });
        o.material = m;
        organMats.current.push(m);
        o.renderOrder = 8;
      } else if (n.startsWith("OralArm")) {
        o.material = makeSwayMaterial(CREAM, 0.4, 0.6, timeUniform, ti++ * 1.7);
        o.renderOrder = 6;
      } else if (n.startsWith("Tentacle")) {
        o.material = makeSwayMaterial(
          ACCENT_BRIGHT,
          0.5,
          1,
          timeUniform,
          (ti++ * 2.399) % (Math.PI * 2)
        );
        o.renderOrder = 5;
      }
      o.frustumCulled = false;
    });
    return root;
  }, [scene, timeUniform]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    timeUniform.value = t;
    for (const m of bellMats.current) m.uniforms.uTime.value = t;
    // organs glow brighter on each contraction
    const pulse = 0.7 + Math.max(0, Math.sin(t * 2.2)) * 0.5;
    for (const m of organMats.current) m.opacity = 0.55 * pulse;
  });

  return (
    <group>
      <primitive object={model} />
      <pointLight position={[0, 0.5, 0]} color={ACCENT_BRIGHT} intensity={5} distance={7} />
    </group>
  );
}

useGLTF.preload(MODEL_URL, true);

// ══════════════════════════════════════════════════════════════════
//  Free swimming across the whole viewport
// ══════════════════════════════════════════════════════════════════

function Swimmer() {
  const group = useRef<THREE.Group>(null!);
  const { viewport } = useThree();
  const prev = useRef(new THREE.Vector3());
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.5;
    const bx = Math.max(viewport.width / 2 - 1.8, 1);
    const by = Math.max(viewport.height / 2 - 2.2, 1);

    target.set(
      Math.sin(t * 0.42) * bx * 0.8 + Math.sin(t * 0.13 + 2) * bx * 0.25,
      Math.cos(t * 0.31 + 1) * by * 0.7 + Math.sin(t * 0.09) * by * 0.3,
      Math.sin(t * 0.22) * 1.5 + 1
    );
    group.current.position.lerp(target, 0.025);

    // pulse-and-glide: upward thrust on each bell contraction
    group.current.position.y += Math.max(0, Math.sin(state.clock.elapsedTime * 2.2)) * 0.004;

    const vel = group.current.position.clone().sub(prev.current);
    prev.current.copy(group.current.position);
    const tiltZ = THREE.MathUtils.clamp(-vel.x * 5, -0.45, 0.45);
    const tiltX = THREE.MathUtils.clamp(vel.z * 3.5, -0.3, 0.3);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, tiltZ, 0.03);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, tiltX, 0.03);
    group.current.rotation.y += 0.0012;
  });

  return (
    <group ref={group} scale={0.9}>
      <BlenderJellyfish />
    </group>
  );
}

export default function Hero3D() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 9], fov: 50 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: "none" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.45} />
          <directionalLight position={[4, 6, 5]} intensity={0.8} color={CREAM} />
          <Swimmer />
        </Suspense>
      </Canvas>
    </div>
  );
}
