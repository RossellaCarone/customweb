import { Canvas } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Laptop } from "./Laptop";
import { Desk } from "./Desk";
import { Dust } from "./Dust";
import { mapRange } from "@/utils/mapRange";

interface SceneProps {
  scrollRef: React.MutableRefObject<number>;
}

/**
 * Cinematic camera rig — pulls in toward desk, then tilts to focus on screen.
 */
const CameraRig = ({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) => {
  useFrame(({ camera }) => {
    const s = scrollRef.current;

    // Phase A — approach desk (0 → 0.40)
    // Phase C — SNAP zoom INTO the screen (0.40 → 0.50) — fast, punchy
    // Phase D — hold inside (0.50 → 0.78) for the gallery
    // Phase E — pull back out (0.78 → 0.92)

    let z: number, y: number, tiltX: number, fov: number;

    if (s < 0.4) {
      z = mapRange(s, 0, 0.4, 5.2, 2.6);
      y = mapRange(s, 0, 0.4, 1.6, 0.95);
      tiltX = mapRange(s, 0, 0.4, -0.18, -0.05);
      fov = 38;
    } else if (s < 0.78) {
      // Fast snap-zoom: cubic ease-in for aggressive acceleration
      const k = Math.max(0, Math.min(1, (s - 0.4) / 0.10)); // 0.40 → 0.50 full range
      const eased = k * k * k; // cubic ease-in — starts slow, slams in
      z = 2.6 + (1.35 - 2.6) * eased;
      y = 0.95 + (1.02 - 0.95) * eased;
      tiltX = -0.05 + (0.0 - -0.05) * eased;
      // FOV narrows sharply during zoom for a "punch-in" lens feel
      fov = 38 + (28 - 38) * eased;
    } else {
      // Pull back out
      z = mapRange(s, 0.78, 0.92, 1.35, 3.2);
      y = mapRange(s, 0.78, 0.92, 1.02, 1.1);
      tiltX = mapRange(s, 0.78, 0.92, 0, -0.08);
      fov = 28;
    }

    // Lerp factor: much higher during zoom phase for snappiness, normal otherwise
    const inZoom = s >= 0.4 && s < 0.5;
    const lerpFactor = inZoom ? 0.14 : 0.06;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, lerpFactor);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, y, lerpFactor);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, z, lerpFactor);
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, tiltX, lerpFactor);
    (camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp(
      (camera as THREE.PerspectiveCamera).fov,
      fov,
      lerpFactor
    );
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });
  return null;
};

export const Scene = ({ scrollRef }: SceneProps) => {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.6, 5.2], fov: 38, near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ position: "fixed", inset: 0 }}
    >
      <color attach="background" args={["#0A0A0F"]} />
      <fog attach="fog" args={["#0A0A0F", 6, 18]} />

      {/* Key warm light — desk lamp */}
      <spotLight
        position={[2.8, 4, 2]}
        angle={0.55}
        penumbra={0.9}
        intensity={28}
        color="#ffd9a8"
        distance={14}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Cool fill */}
      <ambientLight intensity={0.18} color="#7080a8" />
      <hemisphereLight args={["#3a3a55", "#0a0a0f", 0.25]} />

      <Suspense fallback={null}>
        <Desk />
        <Laptop scrollRef={scrollRef} />
        <Dust count={180} />
      </Suspense>

      <CameraRig scrollRef={scrollRef} />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.7} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.15} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
};
