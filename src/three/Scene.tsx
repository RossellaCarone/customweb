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

    // Phase A — approach desk (0 → 0.15)
    // Phase B — settle in front of laptop (0.15 → 0.4)
    // Phase C — push INTO the screen (0.4 → 0.55), camera ends just in front
    //           of the display so the screen content fills the viewport
    // Phase D — hold inside (0.55 → 0.78) for the gallery
    // Phase E — pull back out (0.78 → 0.9)

    let z: number, y: number, tiltX: number;

    if (s < 0.4) {
      z = mapRange(s, 0, 0.4, 5.2, 2.6);
      y = mapRange(s, 0, 0.4, 1.6, 0.95);
      tiltX = mapRange(s, 0, 0.4, -0.18, -0.05);
    } else if (s < 0.78) {
      // Long, eased push-in distributed across the entire gallery range
      // so the camera move feels like one continuous breath instead of a
      // sudden zoom that doesn't match the screen content swap.
      const k = Math.max(0, Math.min(1, (s - 0.4) / 0.3)); // 0.40 → 0.70
      const eased = k * k * (3 - 2 * k); // smoothstep
      z = 2.6 + (1.4 - 2.6) * eased;
      y = 0.95 + (1.0 - 0.95) * eased;
      tiltX = -0.05 + (0 - -0.05) * eased;
    } else {
      // Pull back out
      z = mapRange(s, 0.78, 0.92, 1.4, 3.2);
      y = mapRange(s, 0.78, 0.92, 1.05, 1.1);
      tiltX = mapRange(s, 0.78, 0.92, 0, -0.08);
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.06);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, y, 0.06);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, z, 0.06);
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, tiltX, 0.06);
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
