import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mapRange } from "@/utils/mapRange";
import { useScreenTexture } from "./useScreenTexture";
import { projects } from "@/data/projects";
import { usePerfTier } from "./usePerf";

interface LaptopProps {
  scrollRef: React.MutableRefObject<number>;
}

/**
 * Procedural laptop.
 * Timeline:
 *   0.10–0.22  lid opens
 *   0.22–0.40  sequential slideshow (LDS → DDP, no loop)
 *   0.40–0.54  pitch screen "Sito su misura"
 *   0.50–0.58  laptop scales up so its screen fills the viewport,
 *              while a global HTML overlay fades in (handled in Index.tsx).
 */
export const Laptop = ({ scrollRef }: LaptopProps) => {
  const lidGroup = useRef<THREE.Group>(null);
  const monitorLight = useRef<THREE.PointLight>(null);
  const root = useRef<THREE.Group>(null);
  const tier = usePerfTier();

  const screenTexture = useScreenTexture({
    projects,
    scrollRef,
    openingRange: [0.1, 0.22],
    slideshowRange: [0.22, 0.40],
    pitchRange: [0.40, 0.54],
    fadeOutAt: 0.58, // fades to black around the handoff
    lowPower: tier === "low",
  });

  useFrame(() => {
    const s = scrollRef.current;

    // Lid opening
    if (lidGroup.current) {
      const target = mapRange(s, 0.1, 0.22, Math.PI / 2, -0.35);
      lidGroup.current.rotation.x = THREE.MathUtils.lerp(
        lidGroup.current.rotation.x,
        target,
        0.1
      );
    }

    // Monitor glow
    if (monitorLight.current) {
      const i = mapRange(s, 0.18, 0.28, 0, 1.6);
      // Fade glow as we hand off to fullscreen overlay
      const out = mapRange(s, 0.54, 0.6, 1, 0);
      monitorLight.current.intensity = THREE.MathUtils.lerp(
        monitorLight.current.intensity,
        i * out,
        0.1
      );
    }

    // Root: gentle approach into final position; camera flies past it later
    if (root.current) {
      const z = mapRange(s, 0, 0.12, -2.2, 0);
      root.current.position.z = THREE.MathUtils.lerp(root.current.position.z, z, 0.08);
      root.current.position.y = THREE.MathUtils.lerp(root.current.position.y, 0.02, 0.1);
    }
  });

  const aluminium = (
    <meshStandardMaterial color="#9a9aa3" metalness={0.85} roughness={0.35} />
  );
  const darkPlastic = (
    <meshStandardMaterial color="#0e0e14" metalness={0.2} roughness={0.7} />
  );

  return (
    <group ref={root} position={[0, 0.02, 0]}>
      {/* Base */}
      <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
        <boxGeometry args={[2.8, 0.08, 1.95]} />
        {aluminium}
      </mesh>

      <mesh position={[0, 0.085, 0.15]}>
        <boxGeometry args={[2.55, 0.005, 1.4]} />
        {darkPlastic}
      </mesh>

      <mesh position={[0, 0.086, 0.7]}>
        <boxGeometry args={[1.0, 0.003, 0.55]} />
        <meshStandardMaterial color="#7d7d85" metalness={0.7} roughness={0.45} />
      </mesh>

      <group position={[0, 0.09, 0.05]}>
        {Array.from({ length: 6 }).map((_, row) =>
          Array.from({ length: 14 }).map((_, col) => (
            <mesh
              key={`${row}-${col}`}
              position={[-1.17 + col * 0.18, 0, -0.42 + row * 0.16]}
            >
              <boxGeometry args={[0.14, 0.012, 0.13]} />
              <meshStandardMaterial color="#1a1a22" metalness={0.3} roughness={0.6} />
            </mesh>
          ))
        )}
      </group>

      {/* Lid + screen */}
      <group position={[0, 0.08, -0.95]}>
        <group ref={lidGroup} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow position={[0, 0.925, -0.035]}>
            <boxGeometry args={[2.8, 1.85, 0.06]} />
            {aluminium}
          </mesh>
          <mesh position={[0, 0.925, -0.004]}>
            <boxGeometry args={[2.78, 1.83, 0.004]} />
            <meshStandardMaterial color="#050507" />
          </mesh>
          <mesh position={[0, 0.925, 0.001]}>
            <planeGeometry args={[2.55, 1.6]} />
            <meshBasicMaterial map={screenTexture} toneMapped={false} />
          </mesh>
          <mesh position={[0, 1.78, 0.002]}>
            <circleGeometry args={[0.012, 16]} />
            <meshStandardMaterial color="#000" />
          </mesh>
        </group>
      </group>

      <pointLight
        ref={monitorLight}
        position={[0, 0.9, -0.3]}
        color="#9ec4ff"
        intensity={0}
        distance={4}
        decay={2}
      />
    </group>
  );
};
