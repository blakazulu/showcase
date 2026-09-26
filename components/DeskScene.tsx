"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { DeskMode, SlotId } from "@/lib/desk";
import { SLOTS, slotInMode } from "@/lib/desk";

export interface DeskView {
  scroll: number; // 0..1 progress through the tall scroll region
}

interface SceneProps {
  mode: DeskMode;
  reducedMotion: boolean;
  spins: Record<SlotId, number>;
  view: React.MutableRefObject<DeskView>;
  onSelect: (slot: SlotId) => void;
}

const DESK_TOP = 0.16;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/* ---------------- procedural canvas textures ---------------- */

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d")! };
}
function toTexture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function woodTexture() {
  const { c, g } = makeCanvas(512, 512);
  const grad = g.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, "#8a5a33");
  grad.addColorStop(0.5, "#7c4f2a");
  grad.addColorStop(1, "#93653a");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 110; i++) {
    g.strokeStyle = `rgba(52,30,12,${0.05 + Math.random() * 0.09})`;
    g.lineWidth = 0.8 + Math.random() * 2.2;
    const y = Math.random() * 512;
    g.beginPath();
    g.moveTo(-8, y);
    for (let x = 0; x <= 520; x += 26)
      g.lineTo(x, y + Math.sin(x * 0.02 + i) * 3.5 + (Math.random() - 0.5) * 2.5);
    g.stroke();
  }
  for (let i = 0; i < 7; i++) {
    const x = Math.random() * 512, y = Math.random() * 512;
    g.strokeStyle = "rgba(52,30,12,0.16)";
    g.lineWidth = 1.4;
    g.beginPath();
    g.ellipse(x, y, 6 + Math.random() * 10, 3 + Math.random() * 5, Math.random(), 0, Math.PI * 2);
    g.stroke();
  }
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 1.2);
  return t;
}

function pdfTexture(name: string, tagline: string) {
  const { c, g } = makeCanvas(512, 680);
  g.fillStyle = "#f5f2ec";
  g.fillRect(0, 0, 512, 680);
  g.fillStyle = "#b3452e";
  g.fillRect(0, 0, 512, 74);
  g.fillStyle = "#f5f2ec";
  g.font = "700 34px system-ui, sans-serif";
  g.fillText(name, 28, 50);
  g.fillStyle = "#333a45";
  g.font = "500 21px system-ui, sans-serif";
  g.fillText(tagline, 28, 116);
  let y = 168;
  while (y < 630) {
    const w = 180 + Math.random() * 250;
    g.fillStyle = "rgba(51,58,69,0.30)";
    g.fillRect(28, y, w, 10);
    y += 34;
    if (Math.random() < 0.22) y += 26;
  }
  g.strokeStyle = "rgba(51,58,69,0.18)";
  g.strokeRect(0.5, 0.5, 511, 679);
  return toTexture(c);
}

function keyboardTexture() {
  const { c, g } = makeCanvas(512, 192);
  g.fillStyle = "#14161d";
  g.fillRect(0, 0, 512, 192);
  g.fillStyle = "#232733";
  for (let r = 0; r < 4; r++)
    for (let k = 0; k < 13; k++) {
      const x = 14 + k * 38 + (r % 2) * 9;
      if (x > 478) continue;
      g.beginPath();
      g.roundRect(x, 16 + r * 42, 30, 32, 5);
      g.fill();
    }
  g.beginPath();
  g.roundRect(150, 142, 210, 32, 5);
  g.fill();
  return toTexture(c);
}

function notebookTexture() {
  const { c, g } = makeCanvas(384, 256);
  g.fillStyle = "#b3452e";
  g.fillRect(0, 0, 384, 256);
  g.fillStyle = "rgba(0,0,0,0.14)";
  g.fillRect(0, 0, 26, 256);
  g.strokeStyle = "rgba(245,242,236,0.5)";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(48, 42);
  g.lineTo(336, 42);
  g.stroke();
  return toTexture(c);
}

/* ---------------- camera ---------------- */

const STOPS = [
  { pos: new THREE.Vector3(0.1, 2.15, 5.7), look: new THREE.Vector3(0, 0.5, -0.15) },
  { pos: new THREE.Vector3(-1.75, 1.85, 3.15), look: new THREE.Vector3(-1.55, 1.0, -0.95) },
  { pos: new THREE.Vector3(0.45, 1.45, 2.9), look: new THREE.Vector3(0.35, 0.7, -0.55) },
  { pos: new THREE.Vector3(1.9, 1.75, 3.1), look: new THREE.Vector3(1.45, 0.35, 0.1) },
];

function CameraRig({ view, reducedMotion }: { view: React.MutableRefObject<DeskView>; reducedMotion: boolean }) {
  const { camera, size, pointer } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const p = reducedMotion ? 0.12 : THREE.MathUtils.clamp(view.current.scroll, 0, 1);
    const seg = Math.min(p * (STOPS.length - 1), STOPS.length - 1.0001);
    const i = Math.floor(seg);
    const t = easeOut(seg - i);
    pos.lerpVectors(STOPS[i].pos, STOPS[i + 1].pos, t);
    look.lerpVectors(STOPS[i].look, STOPS[i + 1].look, t);
    const aspect = size.width / Math.max(1, size.height);
    const narrow = aspect < 0.85;
    if (narrow) {
      pos.z += 3.3;
      pos.y += 1.0;
    } else if (aspect < 1.25) {
      pos.z += 1.4;
      pos.y += 0.4;
    }
    const pc = camera as THREE.PerspectiveCamera;
    const targetFov = narrow ? 54 : aspect < 1.25 ? 46 : 42;
    if (Math.abs(pc.fov - targetFov) > 0.01) {
      pc.fov = targetFov;
      pc.updateProjectionMatrix();
    }
    if (!reducedMotion) {
      pos.x += pointer.x * 0.22;
      pos.y += -pointer.y * 0.14;
    }
    camera.position.lerp(pos, reducedMotion ? 1 : 0.07);
    camera.lookAt(look);
  });
  return null;
}

/* ---------------- interactive slot wrapper ---------------- */

function SlotGroup({
  id,
  position,
  rotationY = 0,
  mode,
  spinNonce,
  reducedMotion,
  onSelect,
  children,
}: {
  id: SlotId;
  position: [number, number, number];
  rotationY?: number;
  mode: DeskMode;
  spinNonce: number;
  reducedMotion: boolean;
  onSelect: (slot: SlotId) => void;
  children: React.ReactNode;
}) {
  const g = useRef<THREE.Group>(null);
  const spinT = useRef(-1);
  const slot = SLOTS.find((s) => s.id === id)!;
  const active = slotInMode(slot, mode);

  useEffect(() => {
    if (spinNonce > 0 && !reducedMotion) spinT.current = 0;
  }, [spinNonce, reducedMotion]);

  useFrame((_, dt) => {
    const gr = g.current;
    if (!gr) return;
    if (spinT.current >= 0) {
      spinT.current += dt / 0.85;
      if (spinT.current >= 1) {
        spinT.current = -1;
        gr.rotation.y = rotationY;
      } else {
        gr.rotation.y = rotationY + Math.PI * 2 * easeOut(spinT.current);
      }
    }
    const lift = active ? 0.09 : 0;
    gr.position.y = THREE.MathUtils.lerp(gr.position.y, position[1] + lift, reducedMotion ? 1 : 0.09);
    const dim = active ? 1 : 0.38;
    const k = reducedMotion ? 1 : 0.12;
    gr.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.userData.dimmable) {
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        mats.forEach((mat) => {
          const sm = mat as THREE.MeshStandardMaterial;
          if (!sm.userData.baseColor) sm.userData.baseColor = sm.color.clone();
          const cur = sm.userData.curDim ?? 1;
          const next = THREE.MathUtils.lerp(cur, dim, k);
          sm.userData.curDim = next;
          sm.color.copy(sm.userData.baseColor).multiplyScalar(next);
        });
      }
    });
  });

  return (
    <group
      ref={g}
      position={position}
      rotation={[0, rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {children}
    </group>
  );
}

/* ---------------- scene ---------------- */

function DeskObjects(props: SceneProps) {
  const { mode, reducedMotion, spins, onSelect } = props;
  const [findraTex, chathopTex, nhoTex, floatjetTex] = useTexture([
    "/textures/findra-screen.jpg",
    "/textures/chathop-phone.jpg",
    "/textures/nho-plan.jpg",
    "/textures/floatjet-postcard.jpg",
  ]);
  useMemo(() => {
    [findraTex, chathopTex, nhoTex, floatjetTex].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    });
  }, [findraTex, chathopTex, nhoTex, floatjetTex]);

  const wood = useMemo(woodTexture, []);
  const pdf = useMemo(() => pdfTexture("ScalpelPDF", "Edit PDFs, keep your privacy"), []);
  const keys = useMemo(keyboardTexture, []);
  const notebook = useMemo(notebookTexture, []);

  const dust = useMemo(() => {
    const n = 110;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = 0.3 + Math.random() * 3.4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return geo;
  }, []);
  const dustRef = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (reducedMotion || !dustRef.current) return;
    dustRef.current.rotation.y = clock.elapsedTime * 0.016;
  });

  return (
    <>
      <ambientLight intensity={0.32} color="#ffd9b0" />
      <spotLight
        position={[3.1, 3.4, -1.2]}
        angle={0.85}
        penumbra={0.75}
        intensity={140}
        color="#ffc98a"
        distance={12}
        decay={2}
      />
      <pointLight position={[-1.6, 1.3, 0.4]} intensity={3.2} color="#cfe0ff" distance={4.5} decay={2} />
      <pointLight position={[-2.5, 2.6, 2.8]} intensity={5} color="#7aa2ff" distance={11} decay={2} />

      {/* desk */}
      <mesh position={[0, DESK_TOP - 0.09, 0]}>
        <boxGeometry args={[7.6, 0.18, 3.7]} />
        <meshStandardMaterial map={wood} roughness={0.72} metalness={0.05} />
      </mesh>
      {[[-3.5, -1.6], [3.5, -1.6], [-3.5, 1.6], [3.5, 1.6]].map(([x, z], i) => (
        <mesh key={i} position={[x, DESK_TOP - 1.3, z]}>
          <boxGeometry args={[0.16, 2.5, 0.16]} />
          <meshStandardMaterial color="#4a2f18" roughness={0.8} />
        </mesh>
      ))}
      <ContactShadows position={[0, DESK_TOP + 0.001, 0]} scale={11} far={3.2} blur={2.6} opacity={0.62} color="#160a03" resolution={512} />

      {/* MONITOR — Findra */}
      <SlotGroup id="monitor" position={[-1.55, DESK_TOP, -0.95]} rotationY={0.16} mode={mode} spinNonce={spins.monitor} reducedMotion={reducedMotion} onSelect={onSelect}>
        <mesh position={[0, 0.045, 0]} userData={{ dimmable: true }}>
          <cylinderGeometry args={[0.3, 0.36, 0.045, 24]} />
          <meshStandardMaterial color="#15171d" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.42, 0]} userData={{ dimmable: true }}>
          <boxGeometry args={[0.07, 0.78, 0.07]} />
          <meshStandardMaterial color="#15171d" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 1.06, 0]} userData={{ dimmable: true }}>
          <boxGeometry args={[2.35, 1.38, 0.07]} />
          <meshStandardMaterial color="#0c0e13" roughness={0.42} metalness={0.35} />
        </mesh>
        <mesh position={[0, 1.06, 0.041]} userData={{ dimmable: true }}>
          <planeGeometry args={[2.2, 1.24]} />
          <meshStandardMaterial map={findraTex} emissiveMap={findraTex} emissive="#ffffff" emissiveIntensity={0.62} roughness={0.35} toneMapped={false} />
        </mesh>
        <mesh position={[0, 1.06, -0.2]}>
          <boxGeometry args={[2.7, 1.7, 0.5]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </SlotGroup>

      {/* keyboard (prop) */}
      <mesh position={[-1.5, DESK_TOP + 0.03, 0.28]} rotation={[-0.06, 0.05, 0]}>
        <boxGeometry args={[1.75, 0.055, 0.62]} />
        <meshStandardMaterial map={keys} roughness={0.6} />
      </mesh>

      {/* PHONE — ChatHop */}
      <SlotGroup id="phone" position={[0.38, DESK_TOP, -0.5]} rotationY={-0.14} mode={mode} spinNonce={spins.phone} reducedMotion={reducedMotion} onSelect={onSelect}>
        <group rotation={[-0.24, 0, 0]} position={[0, 0.47, 0]}>
          <mesh userData={{ dimmable: true }}>
            <boxGeometry args={[0.46, 0.94, 0.045]} />
            <meshStandardMaterial color="#101318" roughness={0.38} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.026]} userData={{ dimmable: true }}>
            <planeGeometry args={[0.42, 0.88]} />
            <meshStandardMaterial map={chathopTex} emissiveMap={chathopTex} emissive="#ffffff" emissiveIntensity={0.5} roughness={0.3} toneMapped={false} />
          </mesh>
        </group>
        <mesh position={[0, 0.02, 0.06]} rotation={[0.5, 0, 0]} userData={{ dimmable: true }}>
          <boxGeometry args={[0.5, 0.03, 0.22]} />
          <meshStandardMaterial color="#1a1d24" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.8, 1.3, 0.6]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </SlotGroup>

      {/* PAPERS — ScalpelPDF */}
      <SlotGroup id="papers" position={[1.62, DESK_TOP, 0.18]} rotationY={-0.32} mode={mode} spinNonce={spins.papers} reducedMotion={reducedMotion} onSelect={onSelect}>
        {[0, 1].map((i) => (
          <mesh key={i} position={[0.015 * i, 0.006 * i, 0.01 * i]} rotation={[0, 0.06 * i, 0]} userData={{ dimmable: true }}>
            <boxGeometry args={[0.92, 0.008, 1.22]} />
            <meshStandardMaterial color="#e8e4dc" roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0, 0.017, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} userData={{ dimmable: true }}>
          <planeGeometry args={[1.22, 0.92]} />
          <meshStandardMaterial map={pdf} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[1.3, 0.9, 1.6]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </SlotGroup>

      {/* PLAN — New Home Owner (folded sheet) */}
      <SlotGroup id="plan" position={[-0.42, DESK_TOP + 0.005, 1.05]} rotationY={0.3} mode={mode} spinNonce={spins.plan} reducedMotion={reducedMotion} onSelect={onSelect}>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <mesh position={[-0.29, 0, 0.004]} rotation={[0, 0.32, 0]} userData={{ dimmable: true }}>
            <planeGeometry args={[0.62, 0.9]} />
            <meshStandardMaterial map={nhoTex} emissiveMap={nhoTex} emissive="#ffffff" emissiveIntensity={0.3} roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.29, 0, 0.004]} rotation={[0, -0.32, 0]} userData={{ dimmable: true }}>
            <planeGeometry args={[0.62, 0.9]} />
            <meshStandardMaterial map={nhoTex} emissiveMap={nhoTex} emissive="#ffffff" emissiveIntensity={0.3} roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
        </group>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.5, 0.7, 1.2]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </SlotGroup>

      {/* POSTCARD — FloatJet, leaning on the mug */}
      <SlotGroup id="postcard" position={[1.28, DESK_TOP, -0.78]} rotationY={-0.42} mode={mode} spinNonce={spins.postcard} reducedMotion={reducedMotion} onSelect={onSelect}>
        <group position={[0, 0.26, 0.1]} rotation={[-0.32, 0, 0]}>
          <mesh userData={{ dimmable: true }}>
            <boxGeometry args={[0.78, 0.52, 0.012]} />
            <meshStandardMaterial color="#f2ede2" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.009]} userData={{ dimmable: true }}>
            <planeGeometry args={[0.74, 0.48]} />
            <meshStandardMaterial map={floatjetTex} roughness={0.85} />
          </mesh>
        </group>
        <mesh position={[0, 0.3, 0.1]}>
          <boxGeometry args={[1.0, 0.9, 0.8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </SlotGroup>

      {/* mug (prop) */}
      <group position={[1.52, DESK_TOP, -1.02]}>
        <mesh>
          <cylinderGeometry args={[0.14, 0.12, 0.3, 24]} />
          <meshStandardMaterial color="#b3452e" roughness={0.55} />
        </mesh>
        <mesh position={[0.15, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.075, 0.02, 10, 20]} />
          <meshStandardMaterial color="#b3452e" roughness={0.55} />
        </mesh>
      </group>

      {/* notebook (prop) */}
      <mesh position={[-0.62, DESK_TOP + 0.02, -1.28]} rotation={[0, 0.22, 0]}>
        <boxGeometry args={[0.85, 0.045, 0.6]} />
        <meshStandardMaterial map={notebook} roughness={0.8} />
      </mesh>

      {/* pencil (prop) */}
      <mesh position={[1.0, DESK_TOP + 0.015, 0.62]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.5, 8]} />
        <meshStandardMaterial color="#e0a63f" roughness={0.6} />
      </mesh>

      {/* lamp (key light visual) */}
      <group position={[2.72, DESK_TOP, -1.35]}>
        <mesh>
          <cylinderGeometry args={[0.17, 0.2, 0.05, 20]} />
          <meshStandardMaterial color="#15171d" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.5, 0]} rotation={[0, 0, -0.28]}>
          <cylinderGeometry args={[0.022, 0.022, 1.05, 10]} />
          <meshStandardMaterial color="#15171d" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0.24, 1.02, 0]} rotation={[0, 0, 1.15]}>
          <coneGeometry args={[0.17, 0.3, 20, 1, true]} />
          <meshStandardMaterial color="#15171d" roughness={0.5} metalness={0.4} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.29, 0.95, 0]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
        </mesh>
      </group>

      {/* dust in the lamplight */}
      <points ref={dustRef} geometry={dust}>
        <pointsMaterial size={0.014} color="#ffdcae" transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </>
  );
}

export default function DeskScene(props: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 42, near: 0.1, far: 60, position: [0.1, 2.6, 6.6] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <CameraRig view={props.view} reducedMotion={props.reducedMotion} />
        <DeskObjects {...props} />
      </Suspense>
    </Canvas>
  );
}
