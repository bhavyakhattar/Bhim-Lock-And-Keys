"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  RoundedBox,
  useGLTF,
} from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { Group, MathUtils } from "three";
import { shop } from "@/lib/shop";
const metal = { color: "#d7d9dc", metalness: 0.9, roughness: 0.25 };
function Placeholder() {
  return (
    <group>
      <RoundedBox args={[1.35, 2.45, 0.48]} radius={0.28} smoothness={4}>
        <meshStandardMaterial {...metal} />
      </RoundedBox>
      <RoundedBox
        position={[0, 0.02, 0.19]}
        args={[1.18, 2.21, 0.26]}
        radius={0.24}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#343238"
          metalness={0.35}
          roughness={0.42}
        />
      </RoundedBox>
      {[-0.55, 0.08, 0.71].map((y, i) => (
        <group key={y} position={[0, y, 0.36]}>
          <RoundedBox args={[0.8, 0.46, 0.08]} radius={0.08} smoothness={3}>
            <meshStandardMaterial
              color="#373d37"
              metalness={0.5}
              roughness={0.35}
            />
          </RoundedBox>
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[i === 2 ? 0.27 : 0.18, 0.1, 0.025]} />
            <meshStandardMaterial {...metal} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -1.4, 0]}>
        <torusGeometry args={[0.24, 0.055, 12, 32]} />
        <meshStandardMaterial {...metal} />
      </mesh>
    </group>
  );
}
function Model() {
  // REPLACE: supply a Draco-compressed /public/models/key.glb below 1.5 MB; enable in shop.json.
  const { scene } = useGLTF("/models/key.glb", "/draco/");
  return <primitive object={scene.clone()} />;
}
function Key({
  story,
  rolling = false,
  gyro,
  active,
  input,
}: {
  story: boolean;
  rolling?: boolean;
  gyro: boolean;
  active: boolean;
  input: React.RefObject<{ x: number; y: number; drag: boolean }>;
}) {
  const group = useRef<Group>(null);
  const progress = useRef(0);
  const orientation = useRef({ x: 0, y: 0 });
  const elapsed = useRef(0);
  useEffect(() => {
    if (!story && !rolling) return;
    const section = document.getElementById("how-it-works");
    if (!section && !rolling) return;
    const update = () => {
      if (rolling) { progress.current = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight); return; }
      const rect = section!.getBoundingClientRect();
      progress.current = MathUtils.clamp(
        (innerHeight * 0.7 - rect.top) / (rect.height + innerHeight * 0.3),
        0,
        1,
      );
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, [story, rolling]);
  useEffect(() => {
    if (!gyro || !active) return;
    const update = (event: DeviceOrientationEvent) => {
      orientation.current = {
        x: MathUtils.clamp((event.gamma || 0) / 70, -0.6, 0.6),
        y: MathUtils.clamp(((event.beta || 0) - 45) / 90, -0.4, 0.4),
      };
    };
    addEventListener("deviceorientation", update);
    return () => removeEventListener("deviceorientation", update);
  }, [gyro, active]);
  useFrame((_, delta) => {
    if (!active || !group.current) return;
    elapsed.current += Math.min(delta, 0.04);
    const p = progress.current;
    const rotation = rolling ? p * Math.PI * 8 : story
      ? p * Math.PI * 2
      : Math.sin(elapsed.current * 0.35) * 0.38;
    const targetX =
      (gyro ? orientation.current.y : input.current.y) * 0.6 - 0.18;
    const targetY =
      rotation + (gyro ? orientation.current.x : input.current.x) * 0.6;
    const smoothing = 1 - Math.exp(-5 * Math.min(delta, 0.05));
    group.current.rotation.x = MathUtils.lerp(
      group.current.rotation.x,
      targetX,
      smoothing,
    );
    group.current.rotation.y = MathUtils.lerp(
      group.current.rotation.y,
      targetY,
      smoothing,
    );
    group.current.rotation.z = rolling ? p * Math.PI * 6 : story ? -0.3 + p * 0.65 : -0.4;
    const scale = story ? 1 + Math.sin(p * Math.PI) * 0.3 : 1.1;
    group.current.scale.setScalar(scale);
    group.current.position.y = story
      ? Math.sin(p * Math.PI) * 0.18
      : Math.sin(elapsed.current * 0.65) * 0.06;
  });
  return (
    <group ref={group}>{shop.modelEnabled ? <Model /> : <Placeholder />}</group>
  );
}
function Ready({
  onReady,
  onFail,
}: {
  onReady: () => void;
  onFail: () => void;
}) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    let frame = requestAnimationFrame(onReady);
    const canvas = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault();
      onFail();
    };
    canvas.addEventListener("webglcontextlost", lost);
    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener("webglcontextlost", lost);
    };
  }, [gl, onReady, onFail]);
  return null;
}
export default function KeyScene({
  active,
  story,
  rolling = false,
  gyro,
  onReady,
  onFail,
}: {
  active: boolean;
  story: boolean;
  rolling?: boolean;
  gyro: boolean;
  onReady: () => void;
  onFail: () => void;
}) {
  const input = useRef({ x: 0, y: 0, drag: false });
  const start = useRef({ x: 0, y: 0 });
  const [usable, setUsable] = useState(true);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) {
        setUsable(false);
        onFail();
      } else gl.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setUsable(false);
      onFail();
    }
  }, [onFail]);
  if (!usable) return null;
  return (
    <div
      className="stage-canvas"
      aria-hidden="true"
      onPointerDown={(e) => {
        input.current.drag = true;
        start.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        if (e.pointerType === "mouse" && !input.current.drag) {
          input.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
          input.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
        } else if (input.current.drag) {
          input.current.x = MathUtils.clamp(
            (e.clientX - start.current.x) / 100,
            -2,
            2,
          );
          input.current.y = MathUtils.clamp(
            (e.clientY - start.current.y) / 160,
            -1,
            1,
          );
        }
      }}
      onPointerUp={() => {
        input.current.drag = false;
      }}
      onPointerCancel={() => {
        input.current.drag = false;
      }}
      onPointerLeave={() => {
        if (!input.current.drag) input.current = { x: 0, y: 0, drag: false };
      }}
    >
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 36 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        fallback={null}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[0, 3, 5]} intensity={4} color="#ffffff" />
          <directionalLight position={[-4, 1, 3]} intensity={2.5} color="#fff1df" />
          <spotLight
            position={[3, 5, 4]}
            color="#e7bd74"
            intensity={45}
            angle={0.5}
            penumbra={1}
          />
          <Environment files="/images/studio.hdr" />
          <Key story={story} rolling={rolling} gyro={gyro} active={active} input={input} />
          <ContactShadows
            position={[0, -1.9, 0]}
            opacity={0.45}
            scale={7}
            blur={2.8}
            far={4}
            resolution={128}
            frames={1}
          />
          <Ready onReady={onReady} onFail={onFail} />
        </Suspense>
      </Canvas>
    </div>
  );
}
