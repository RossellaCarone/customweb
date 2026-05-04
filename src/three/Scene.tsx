import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
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

const IS_MOBILE =
  typeof navigator !== "undefined" &&
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// ── Post-processing ──────────────────────────────────────────────────────────
const FxGate = ({
  scrollRef,
  tier,
}: {
  scrollRef: React.MutableRefObject<number>;
  tier: string;
}) => {
  if (IS_MOBILE && tier === "low") return null;
  return <FxGateInner scrollRef={scrollRef} tier={tier} />;
};

const FxGateInner = ({
  scrollRef,
  tier,
}: {
  scrollRef: React.MutableRefObject<number>;
  tier: string;
}) => {
  const [fxEnabled, setFxEnabled] = useState(true);

  useFrame(() => {
    const shouldEnable = scrollRef.current <= 0.78;
    if (shouldEnable !== fxEnabled) setFxEnabled(shouldEnable);
  });

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {fxEnabled ? (
        <>
          <Bloom
            intensity={tier === "high" ? 0.38 : 0.24}
            luminanceThreshold={0.78}
            luminanceSmoothing={0.4}
            mipmapBlur
          />
          {tier === "high" && !IS_MOBILE && (
            <Noise opacity={0.012} blendFunction={BlendFunction.OVERLAY} />
          )}
          <Vignette eskil={false} offset={0.18} darkness={0.9} />
        </>
      ) : (
        <></>
      )}
    </EffectComposer>
  );
};

// ── Camera flight ────────────────────────────────────────────────────────────
const CameraFlight = ({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) => {
  const wasPortraitRef = useRef<boolean | null>(null);

  useFrame(({ camera, size }) => {
    const s = scrollRef.current;

    let px = 0, py = 1.6, pz = 5.2, rx = -0.18, ry = 0, fov = 38;
    let cameraLerp = 0.07;

    if (s < 0.4) {
      pz = mapRange(s, 0, 0.4, 5.2, 2.7);
      py = mapRange(s, 0, 0.4, 1.6, 1.0);
      rx = mapRange(s, 0, 0.4, -0.18, -0.04);
    } else if (s < 0.5) {
      const k = (s - 0.4) / 0.1;
      const e = k * k * (3 - 2 * k);
      pz = 2.7 + (2.0 - 2.7) * e;
      py = 1.0;
      rx = -0.04 + (0.0 - -0.04) * e;
    } else if (s < 0.58) {
      const k = (s - 0.5) / 0.08;
      const e = k * k * (3 - 2 * k);
      pz = 2.0 + (-9.5 - 2.0) * e;
      py = 1.0 + (1.6 - 1.0) * e;
      rx = 0;
    } else if (s < 0.88) {
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
      const k = (s - 0.88) / 0.12;
      const e = k * k * (3 - 2 * k);
      pz = -22.0 + (-28.2 - -22.0) * e;
      py = 1.6 + (2.05 - 1.6) * e;
      px = Math.sin(k * Math.PI) * 0.18;
      rx = -0.015 + (0 - -0.015) * e;
      fov = 38;
    }

    const aspect = size.width / size.height;
    const isPortrait = aspect < 1;
    const orientationChanged =
      wasPortraitRef.current !== null && wasPortraitRef.current !== isPortrait;
    wasPortraitRef.current = isPortrait;
    const portraitBoost        = aspect < 1 ? mapRange(aspect, 1, 0.55, 0, 1) : 0;
    const contactProgress      = mapRange(s, 0.88, 1, 0, 1);
    const contactMobileZoom    = IS_MOBILE && aspect < 1 ? portraitBoost * contactProgress : 0;
    const portraitZOffset      = portraitBoost * 2.2;
    const portraitFovOffset    = portraitBoost * 14;
    const contactMobileZOffset  = contactMobileZoom * -1.9;
    const contactMobileFovOffset = contactMobileZoom * -10.5;
    const blend = orientationChanged ? 1 : cameraLerp;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, px, blend);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, py, blend);
    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      pz + portraitZOffset + contactMobileZOffset,
      blend
    );
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, rx, blend);
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, ry, blend);
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = THREE.MathUtils.lerp(
      cam.fov,
      fov + portraitFovOffset + contactMobileFovOffset,
      blend
    );
    cam.updateProjectionMatrix();
  });

  return null;
};

// ── Scene ────────────────────────────────────────────────────────────────────
export const Scene = ({ scrollRef }: SceneProps) => {
  const tier = usePerfTier();

  const castShadows = tier === "high" && !IS_MOBILE;
  const fogFar = IS_MOBILE ? 35 : 50;

  return (
    <Canvas
      shadows={castShadows}
      dpr={[1, 2]}
      camera={{ position: [0, 1.6, 5.2], fov: 38, near: 0.5, far: 60 }}
      gl={{
        antialias: !IS_MOBILE,
        powerPreference: "high-performance",
      }}
      style={{ position: "fixed", inset: 0 }}
    >
      {/* DPR adattivo: parte da 2x e si abbassa automaticamente se l'FPS cala */}
      <AdaptiveDpr pixelated />
      {/* Disabilita pointer events durante il movimento per guadagnare frame */}
      <AdaptiveEvents />

      <color attach="background" args={["#06060A"]} />
      <fog attach="fog" args={["#06060A", 8, fogFar]} />

      <spotLight
        position={[2.8, 4, 2]}
        angle={0.55}
        penumbra={0.9}
        intensity={28}
        color="#ffd9a8"
        distance={14}
        castShadow={castShadows}
        shadow-mapSize={[512, 512]}
      />
      <ambientLight intensity={0.18} color="#7080a8" />
      <hemisphereLight args={["#3a3a55", "#0a0a0f", 0.25]} />

      <Suspense fallback={null}>
        <Floor tier={tier} />
        <Desk />
        <Laptop scrollRef={scrollRef} castShadows={castShadows} />
        <ProjectMonoliths scrollRef={scrollRef} range={[0.58, 0.88]} />
        <ContactObelisk scrollRef={scrollRef} range={[0.88, 1.0]} />
        {(!IS_MOBILE || tier !== "low") && <Fireflies tier={tier} />}
      </Suspense>

      <CameraFlight scrollRef={scrollRef} />
      <FxGate scrollRef={scrollRef} tier={tier} />
    </Canvas>
  );
};