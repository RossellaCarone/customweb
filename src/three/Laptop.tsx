import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mapRange } from "@/utils/mapRange";
import { useScreenTexture } from "./useScreenTexture";
import { projects } from "@/data/projects";

interface LaptopProps {
  scrollRef: React.MutableRefObject<number>;
}

/**
 * Procedural laptop: aluminium base, articulated lid, live screen.
 * Lid opens between scroll 0.10–0.40. Screen content shifts to immersive
 * gallery between 0.42–0.78.
 */
export const Laptop = ({ scrollRef }: LaptopProps) => {
  const lidGroup = useRef<THREE.Group>(null);
  const monitorLight = useRef<THREE.PointLight>(null);
  const root = useRef<THREE.Group>(null);

  const screenTexture = useScreenTexture({
    projects,
    scrollRef,
    slideshowRange: [0.24, 0.92],
    galleryRange: [0.99, 1],
  });

  useFrame(() => {
    const s = scrollRef.current;
    if (lidGroup.current) {
      // Closed: lid lies flat over keyboard (rotated forward ~90°).
      // Open: lid stands up & tilts back to ~110° from base.
      // We model: closed = +PI/2, open = -0.35 (≈ -20°, slight back tilt past vertical).
      const target = mapRange(s, 0.1, 0.4, Math.PI / 2, -0.35);
      lidGroup.current.rotation.x = THREE.MathUtils.lerp(
        lidGroup.current.rotation.x,
        target,
        0.08
      );
    }
    if (monitorLight.current) {
      // Light intensifies as screen becomes visible
      const i = mapRange(s, 0.22, 0.4, 0, 1.4);
      monitorLight.current.intensity = THREE.MathUtils.lerp(
        monitorLight.current.intensity,
        i,
        0.08
      );
    }
    if (root.current) {
      // Slight push toward camera as we approach laptop
      const z = mapRange(s, 0, 0.15, -2.2, 0);
      root.current.position.z = THREE.MathUtils.lerp(root.current.position.z, z, 0.06);
    }
  });

  // Materials
  const aluminium = (
    <meshStandardMaterial
      color="#9a9aa3"
      metalness={0.85}
      roughness={0.35}
    />
  );

  const darkPlastic = (
    <meshStandardMaterial color="#0e0e14" metalness={0.2} roughness={0.7} />
  );

  return (
    <group ref={root} position={[0, 0.02, 0]}>
      {/* Base of laptop */}
      <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
        <boxGeometry args={[2.8, 0.08, 1.95]} />
        {aluminium}
      </mesh>

      {/* Keyboard recess */}
      <mesh position={[0, 0.085, 0.15]}>
        <boxGeometry args={[2.55, 0.005, 1.4]} />
        {darkPlastic}
      </mesh>

      {/* Trackpad */}
      <mesh position={[0, 0.086, 0.7]}>
        <boxGeometry args={[1.0, 0.003, 0.55]} />
        <meshStandardMaterial color="#7d7d85" metalness={0.7} roughness={0.45} />
      </mesh>

      {/* Keyboard keys grid */}
      <group position={[0, 0.09, 0.05]}>
        {Array.from({ length: 6 }).map((_, row) =>
          Array.from({ length: 14 }).map((_, col) => (
            <mesh
              key={`${row}-${col}`}
              position={[
                -1.17 + col * 0.18,
                0,
                -0.42 + row * 0.16,
              ]}
            >
              <boxGeometry args={[0.14, 0.012, 0.13]} />
              <meshStandardMaterial
                color="#1a1a22"
                metalness={0.3}
                roughness={0.6}
              />
            </mesh>
          ))
        )}
      </group>

      {/* Hinge axis at back of base — lid pivots around X here */}
      <group position={[0, 0.08, -0.95]}>
        <group ref={lidGroup} rotation={[Math.PI / 2, 0, 0]}>
          {/* Everything inside extends UP from the hinge (positive Y) */}
          {/* Lid back (outer shell) */}
          <mesh castShadow position={[0, 0.925, -0.035]}>
            <boxGeometry args={[2.8, 1.85, 0.06]} />
            {aluminium}
          </mesh>
          {/* Bezel frame */}
          <mesh position={[0, 0.925, -0.004]}>
            <boxGeometry args={[2.78, 1.83, 0.004]} />
            <meshStandardMaterial color="#050507" />
          </mesh>
          {/* Screen — IN FRONT of bezel, brighter so visible from start */}
          <mesh position={[0, 0.925, 0.001]}>
            <planeGeometry args={[2.55, 1.6]} />
            <meshBasicMaterial map={screenTexture} toneMapped={false} />
          </mesh>
          {/* Camera notch */}
          <mesh position={[0, 1.78, 0.002]}>
            <circleGeometry args={[0.012, 16]} />
            <meshStandardMaterial color="#000" />
          </mesh>
        </group>
      </group>

      {/* Monitor glow light — points down/forward onto the desk */}
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
