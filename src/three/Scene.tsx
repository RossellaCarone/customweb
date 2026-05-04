import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette, Noise, FXAA } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Laptop } from "./Laptop";
import { Desk } from "./Desk";
import { Floor } from "./Floor";
import { Fireflies } from "./Fireflies";
import { ProjectMonoliths } from "./ProjectMonoliths";
import { ContactObelisk } from "./ContactObelisk";
import { usePerfTier } from "./usePerf";
import { mapRange } from "@/utils/mapRange";

interface SceneProps {
  scrollRef: React.MutableRefObject<number>;
}

/**
 * Camera flight along a single continuous path through one 3D world:
 *   0.00 – 0.10  Wide shot of the atelier (laptop on desk)
 *   0.10 – 0.40  Closes in on the laptop screen (slideshow inside)
 *   0.40 – 0.50  Holds on the pitch screen
 *   0.50 – 0.58  Camera flies INTO the screen, through the portal arch
 *   0.58 – 0.88  Camera advances through the project monolith sequence
 *   0.90 – 1.00  Camera glides toward the contact panel
 */
const CameraFlight = ({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) => {
  useFrame(({ camera, size }) => {
    const s = scrollRef.current;

    let px = 0, py = 1.6, pz = 5.2, rx = -0.18, ry = 0, fov = 38;
    let cameraLerp = 0.07;

    if (s < 0.4) {
      // approach + zoom on laptop
      pz = mapRange(s, 0, 0.4, 5.2, 2.7);
      py = mapRange(s, 0, 0.4, 1.6, 1.0);
      rx = mapRange(s, 0, 0.4, -0.18, -0.04);
    } else if (s < 0.5) {
      // hold on pitch screen
      const k = (s - 0.4) / 0.1;
      const e = k * k * (3 - 2 * k);
      pz = 2.7 + (2.0 - 2.7) * e;
      py = 1.0;
      rx = -0.04 + (0.0 - -0.04) * e;
    } else if (s < 0.58) {
      // FLY THROUGH the portal — camera dives into screen / arch
      const k = (s - 0.5) / 0.08;
      const e = k * k * (3 - 2 * k);
      pz = 2.0 + (-9.5 - 2.0) * e; // accelerate forward
      py = 1.0 + (1.6 - 1.0) * e;
      rx = 0;
    } else if (s < 0.88) {
      // project stage: hold on each project longer before moving to the next
      cameraLerp = 0.045;
      const k = (s - 0.58) / 0.30;
      if (k < 0.38) {
        const e = mapRange(k, 0, 0.38, 0, 1);
        pz = -11.8 + (-13.2 - -11.8) * e;
      } else if (k < 0.62) {
        const e = mapRange(k, 0.38, 0.62, 0, 1);
        pz = -13.2 + (-20.6 - -13.2) * e;
      } else {
        const e = mapRange(k, 0.62, 1, 0, 1);
        pz = -20.6 + (-22.0 - -20.6) * e;
      }
      py = 1.6;
      px = 0;
      rx = -0.015;
      ry = 0;
      fov = 46;
    } else {
      // enter the contact section already at max zoom, then just glide in
      const k = (s - 0.88) / 0.12;
      const e = k * k * (3 - 2 * k);
      pz = -22.0 + (-28.2 - -22.0) * e;
      py = 1.6 + (2.05 - 1.6) * e;
      px = Math.sin(k * Math.PI) * 0.18;
      rx = -0.015 + (0 - -0.015) * e;
      fov = 38;
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, px, cameraLerp);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, py, cameraLerp);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, pz, cameraLerp);
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, rx, cameraLerp);
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, ry, cameraLerp);
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const targetFov = aspect < 1 ? (fov / Math.max(aspect, 0.55)) * 0.7 : fov;
    cam.fov = THREE.MathUtils.lerp(cam.fov, targetFov, cameraLerp);
    cam.updateProjectionMatrix();
  });
  return null;
};

export const Scene = ({ scrollRef }: SceneProps) => {
  const tier = usePerfTier();
  const disableFx = scrollRef.current > 0.78;

  return (
    <Canvas
      shadows={tier === "high"}
      dpr={tier === "low" ? [1, 1.85] : [1, 2]}
      camera={{ position: [0, 1.6, 5.2], fov: 38, near: 0.1, far: 80 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ position: "fixed", inset: 0 }}
    >
      <color attach="background" args={["#06060A"]} />
      <fog attach="fog" args={["#06060A", 8, 50]} />

      {/* Key warm light — desk lamp */}
      <spotLight
        position={[2.8, 4, 2]}
        angle={0.55}
        penumbra={0.9}
        intensity={28}
        color="#ffd9a8"
        distance={14}
        castShadow={tier === "high"}
        shadow-mapSize={[1024, 1024]}
      />
      <ambientLight intensity={0.18} color="#7080a8" />
      <hemisphereLight args={["#3a3a55", "#0a0a0f", 0.25]} />

      <Suspense fallback={null}>
        <Floor tier={tier} />
        <Desk />
        <Laptop scrollRef={scrollRef} />
        <ProjectMonoliths scrollRef={scrollRef} range={[0.58, 0.88]} />
        <ContactObelisk scrollRef={scrollRef} range={[0.88, 1.0]} />
        <Fireflies tier={tier} />
      </Suspense>

      <CameraFlight scrollRef={scrollRef} />

      <EffectComposer multisampling={0} enableNormalPass={false}>
        {!disableFx ? (
          <>
            <Bloom
              intensity={tier === "high" ? 0.38 : 0.24}
              luminanceThreshold={0.78}
              luminanceSmoothing={0.4}
              mipmapBlur
            />
            {tier === "low" && <FXAA />}
            {tier === "high" && <Noise opacity={0.012} blendFunction={BlendFunction.OVERLAY} />}
            <Vignette eskil={false} offset={0.18} darkness={0.9} />
          </>
        ) : (
          <></>
        )}
      </EffectComposer>
    </Canvas>
  );
};
