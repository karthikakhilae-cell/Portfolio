import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// ── Theme palette (matches index.css) ─────────────────────────────
const ACCENT = new THREE.Color("#8A8A60");
const ACCENT_BRIGHT = new THREE.Color("#D8D8AC");
const CREAM = new THREE.Color("#F0EDE8");
const FOG_COLOR = new THREE.Color("#131209"); // deep-water dark, warm-tinted

const MODEL_URL = "/jellyfish.glb";

// ══════════════════════════════════════════════════════════════════
//  Fresnel "jelly glass" shader for the Blender bell meshes
//  (with depth fog: fades into the dark water with distance)
// ══════════════════════════════════════════════════════════════════

const bellVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMinY;
  uniform float uMaxY;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vHeight;
  varying float vViewDepth;

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
    vViewDepth = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const bellFragmentShader = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uRimColor;
  uniform vec3 uFogColor;
  uniform float uTime;
  uniform float uDim;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vHeight;
  varying float vViewDepth;

  void main() {
    float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), 2.2);
    float innerGlow = smoothstep(0.45, 1.0, vHeight) * 0.35;
    float shimmer = 0.9 + 0.1 * sin(uTime * 1.3 + vHeight * 8.0);
    vec3 color = mix(uBaseColor, uRimColor, fres) * shimmer;
    float alpha = (0.06 + fres * 0.75 + innerGlow) * 0.9 * uDim;

    // depth fog: sink into dark water with distance from camera
    float fogF = smoothstep(10.0, 22.0, vViewDepth);
    color = mix(color + uRimColor * innerGlow, uFogColor, fogF);
    alpha *= 1.0 - fogF * 0.75;

    gl_FragColor = vec4(color, alpha);
  }
`;

function makeBellMaterial(geo: THREE.BufferGeometry, inner: boolean, dim = 1) {
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  return new THREE.ShaderMaterial({
    vertexShader: bellVertexShader,
    fragmentShader: bellFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uDim: { value: dim },
      uFogColor: { value: FOG_COLOR.clone() },
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
    fog: true,
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

function BlenderJellyfish({ dim = 1 }: { dim?: number }) {
  const { scene } = useGLTF(MODEL_URL, true);
  const timeUniform = useMemo(() => ({ value: 0 }), []);
  const bellMats = useRef<THREE.ShaderMaterial[]>([]);
  const organMats = useRef<THREE.MeshBasicMaterial[]>([]);

  const model = useMemo(() => {
    const root = scene.clone(true);
    bellMats.current = [];
    organMats.current = [];

    // normalize: center on bell, scale to ~2.4 units wide
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
        o.material = makeBellMaterial(o.geometry, false, dim);
        bellMats.current.push(o.material as THREE.ShaderMaterial);
        o.renderOrder = 10;
      } else if (n.startsWith("BellInner")) {
        o.material = makeBellMaterial(o.geometry, true, dim);
        bellMats.current.push(o.material as THREE.ShaderMaterial);
        o.renderOrder = 9;
      } else if (n.startsWith("Gonad")) {
        const m = new THREE.MeshBasicMaterial({
          color: CREAM,
          transparent: true,
          opacity: 0.55 * dim,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        });
        o.material = m;
        organMats.current.push(m);
        o.renderOrder = 8;
      } else if (n.startsWith("OralArm")) {
        o.material = makeSwayMaterial(CREAM, 0.4 * dim, 0.6, timeUniform, ti++ * 1.7);
        o.renderOrder = 6;
      } else if (n.startsWith("Tentacle")) {
        o.material = makeSwayMaterial(
          ACCENT_BRIGHT,
          0.5 * dim,
          1,
          timeUniform,
          (ti++ * 2.399) % (Math.PI * 2)
        );
        o.renderOrder = 5;
      }
      o.frustumCulled = false;
    });
    return root;
  }, [scene, timeUniform, dim]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    timeUniform.value = t;
    for (const m of bellMats.current) m.uniforms.uTime.value = t;
    // organs glow brighter on each contraction
    const pulse = 0.7 + Math.max(0, Math.sin(t * 2.2)) * 0.5;
    for (const m of organMats.current) m.opacity = 0.55 * dim * pulse;
  });

  return (
    <group>
      <primitive object={model} />
      <pointLight
        position={[0, 0.5, 0]}
        color={ACCENT_BRIGHT}
        intensity={5 * dim}
        distance={7}
      />
    </group>
  );
}

useGLTF.preload(MODEL_URL, true);

// ══════════════════════════════════════════════════════════════════
//  OCEAN ENVIRONMENT
// ══════════════════════════════════════════════════════════════════

// (1) Drifting marine dust at many depths → parallax sells the volume
function Plankton({ count = 700 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = -9 + Math.random() * 13;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    return { positions, seeds };
  }, [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      pos.setY(i, pos.getY(i) + Math.sin(t * 0.3 + seeds[i]) * 0.0012 + 0.0008);
      pos.setX(i, pos.getX(i) + Math.cos(t * 0.2 + seeds[i] * 1.3) * 0.0015);
      if (pos.getY(i) > 9) pos.setY(i, -9);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={CREAM}
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// round soft-dot texture shared by bubbles
function useDotTexture() {
  return useMemo(() => {
    const size = 64;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(240, 237, 232, 0.9)");
    g.addColorStop(0.35, "rgba(240, 237, 232, 0.35)");
    g.addColorStop(1, "rgba(240, 237, 232, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

// (5) Rising bubble streams, wobbling upward
function Bubbles({ count = 90 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const tex = useDotTexture();
  const { viewport } = useThree();
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        // a few emitter columns across the page
        col: (Math.floor(Math.random() * 6) / 5 - 0.5) * 24,
        y: -10 + Math.random() * 20,
        z: -7 + Math.random() * 9,
        speed: 0.4 + Math.random() * 0.7,
        wobble: Math.random() * Math.PI * 2,
      })),
    [count]
  );
  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const top = Math.max(viewport.height / 2 + 2, 10);
    const pos = ref.current.geometry.attributes.position;
    data.forEach((b, i) => {
      b.y += b.speed * delta;
      if (b.y > top) b.y = -top;
      pos.setXYZ(
        i,
        b.col + Math.sin(t * 1.6 + b.wobble) * 0.25 + Math.sin(t * 0.4 + b.wobble * 2) * 0.4,
        b.y,
        b.z
      );
    });
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={tex}
        color={CREAM}
        size={0.14}
        sizeAttenuation
        transparent
        opacity={0.35}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// (2) Soft volumetric light shafts falling from above
function useRayTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 512;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, "rgba(245, 241, 220, 0.55)");
    grad.addColorStop(0.5, "rgba(216, 216, 172, 0.18)");
    grad.addColorStop(1, "rgba(216, 216, 172, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 512);
    const side = ctx.createLinearGradient(0, 0, 128, 0);
    side.addColorStop(0, "rgba(0,0,0,1)");
    side.addColorStop(0.25, "rgba(0,0,0,0)");
    side.addColorStop(0.75, "rgba(0,0,0,0)");
    side.addColorStop(1, "rgba(0,0,0,1)");
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = side;
    ctx.fillRect(0, 0, 128, 512);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

function GodRays() {
  const group = useRef<THREE.Group>(null!);
  const tex = useRayTexture();
  const { viewport } = useThree();

  const rays = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        x: (i / 4 - 0.5) * 1.6,
        tilt: -0.28 + Math.random() * 0.12,
        width: 1.6 + Math.random() * 2.4,
        speed: 0.1 + Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2,
        base: 0.1 + Math.random() * 0.12,
      })),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const r = rays[i];
      const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = r.base + Math.sin(t * r.speed + r.phase) * 0.05;
      child.position.x = r.x * viewport.width * 0.5 + Math.sin(t * 0.05 + r.phase) * 0.8;
    });
  });

  return (
    <group ref={group} position={[0, 0, -7]}>
      {rays.map((r, i) => (
        <mesh
          key={i}
          position={[r.x * viewport.width * 0.5, viewport.height * 0.35, 0]}
          rotation={[0, 0, r.tilt]}
        >
          <planeGeometry args={[r.width, viewport.height * 1.8]} />
          <meshBasicMaterial
            map={tex}
            transparent
            opacity={r.base}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// (3) Small dim companions drifting far behind — depth layering
function DistantJelly({
  offset,
  depth,
  scale,
  dim,
}: {
  offset: number;
  depth: number;
  scale: number;
  dim: number;
}) {
  const group = useRef<THREE.Group>(null!);
  const { viewport } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.5;
    const bx = viewport.width / 2;
    const by = viewport.height / 2;
    group.current.position.set(
      Math.sin(t * 0.17 + offset) * bx * 0.7,
      Math.cos(t * 0.11 + offset * 2) * by * 0.6 + Math.sin(t * 0.05 + offset) * by * 0.2,
      depth
    );
    group.current.rotation.z = Math.sin(t * 0.1 + offset) * 0.15;
  });

  return (
    <group ref={group} scale={scale}>
      <BlenderJellyfish dim={dim} />
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════
//  Free swimming across the whole viewport
// ══════════════════════════════════════════════════════════════════

function Swimmer({ isMobile = false }: { isMobile?: boolean }) {
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

    // mobile: keep-out zone over the page content — if the path heads
    // toward the middle of the screen, push it out to the edges instead
    if (isMobile) {
      const cx = target.x / Math.max(bx, 0.001);
      const cy = target.y / Math.max(by, 0.001);
      const r = Math.hypot(cx, cy); // 0 at screen center, ~1 at edges
      const minR = 0.85;
      if (r < minR) {
        const push = r < 0.001 ? { x: 1, y: 0 } : { x: cx / r, y: cy / r };
        target.x = push.x * minR * bx;
        target.y = push.y * minR * by;
      }
    }

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
    <group ref={group} scale={isMobile ? 0.55 : 0.9}>
      <BlenderJellyfish />
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════
//  (7) Parallax rig — the whole ocean tilts with the cursor and
//  drifts with page scroll, anchoring the scene in 3D space
// ══════════════════════════════════════════════════════════════════

function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const g = group.current;
    // cursor: gentle whole-scene tilt (deeper layers move most on screen)
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, state.pointer.x * 0.06, 0.03);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -state.pointer.y * 0.05, 0.03);
    // scroll: ocean drifts up as the page scrolls down
    const scrollY = window.scrollY / window.innerHeight;
    g.position.y = THREE.MathUtils.lerp(g.position.y, scrollY * 1.4, 0.05);
  });

  return <group ref={group}>{children}</group>;
}

export default function Hero3D() {
  // adaptive quality: phones get a lighter ocean so it stays smooth
  const isMobile = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches,
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 9], fov: 50 }}
        dpr={isMobile ? [1, 1.25] : [1, 1.75]}
        gl={{ antialias: !isMobile, alpha: true }}
        style={{ pointerEvents: "none" }}
        eventSource={document.body}
        eventPrefix="client"
      >
        {/* (4) depth fog for standard materials (tentacles, arms) */}
        <fog attach="fog" args={[FOG_COLOR, 10, 22]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.45} />
          <directionalLight position={[4, 6, 5]} intensity={0.8} color={CREAM} />
          <ParallaxRig>
            <GodRays />
            <Plankton count={isMobile ? 250 : 700} />
            <Bubbles count={isMobile ? 35 : 90} />
            <DistantJelly offset={2.1} depth={-7} scale={0.32} dim={0.3} />
            {!isMobile && <DistantJelly offset={5.4} depth={-8.5} scale={0.22} dim={0.2} />}
            <Swimmer isMobile={isMobile} />
          </ParallaxRig>
        </Suspense>
      </Canvas>
    </div>
  );
}
