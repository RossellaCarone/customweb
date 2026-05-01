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
  opacity?: number;
}

/**
 * Cinematic camera rig — pulls in toward desk, then tilts to focus on screen.
 */
const CameraRig = ({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) => {
  useFrame(({ camera }) => {
    const s = scrollRef.current;

    // Phase A — approach desk (0 → 0.40)
    // Phase C — hold on laptop screen while content scrolls (0.40 → 0.92)
    // Phase D — zoom INTO the screen only after manifesto appears (0.92 → 0.98)

    let z: number, y: number, tiltX: number, fov: number;

    if (s < 0.4) {
      z = mapRange(s, 0, 0.4, 5.2, 2.6);
      y = mapRange(s, 0, 0.4, 1.6, 0.95);
      tiltX = mapRange(s, 0, 0.4, -0.18, -0.05);
      fov = 38;
    } else if (s < 0.92) {
      z = mapRange(s, 0.4, 0.92, 2.6, 2.2);
      y = mapRange(s, 0.4, 0.92, 0.95, 0.98);
      tiltX = mapRange(s, 0.4, 0.92, -0.05, -0.02);
      fov = 36;
    } else if (s < 0.98) {
      // Fast punch-in starts only after laptop manifesto frame
      const k = Math.max(0, Math.min(1, (s - 0.92) / 0.06));
      const eased = k * k * k; // cubic ease-in — starts slow, slams in
      z = 2.2 + (1.35 - 2.2) * eased;
      y = 0.98 + (1.02 - 0.98) * eased;
      tiltX = -0.02 + (0.0 - -0.02) * eased;
      fov = 36 + (28 - 36) * eased;
    } else {
      // End state: stay pushed in
      z = 1.35;
      y = 1.02;
      tiltX = 0;
      fov = 28;
    }

    // Lerp factor: much higher during zoom phase for snappiness, normal otherwise
    const inZoom = s >= 0.92 && s < 0.98;
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

export const Scene = ({ scrollRef, opacity = 1 }: SceneProps) => {
  return (
    <Canvas
      shadows
      dpr={[1, 1.25]}
      camera={{ position: [0, 1.6, 5.2], fov: 38, near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ position: "fixed", inset: 0, opacity }}
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
        shadow-mapSize={[512, 512]}
      />
      {/* Cool fill */}
      <ambientLight intensity={0.18} color="#7080a8" />
      <hemisphereLight args={["#3a3a55", "#0a0a0f", 0.25]} />

      <Suspense fallback={null}>
        <Desk />
        <Laptop scrollRef={scrollRef} />
        <Dust count={100} />
      </Suspense>

      <CameraRig scrollRef={scrollRef} />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.45} luminanceThreshold={0.72} luminanceSmoothing={0.22} />
        <Vignette eskil={false} offset={0.15} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  );
};
