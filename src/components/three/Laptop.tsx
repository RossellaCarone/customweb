import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mapRange } from '@/utils/mapRange';

interface LaptopProps {
  scrollProgress: React.MutableRefObject<number>;
}

/**
 * Laptop — placeholder geometry (BoxGeometry for base + lid).
 * The lid rotates on its X axis driven by scroll progress.
 * Pivot is offset so rotation happens at the hinge (back edge of lid).
 *
 * Replace with a real .glb in Sprint 2.
 */
export default function Laptop({ scrollProgress }: LaptopProps) {
  const lidRef = useRef<THREE.Group>(null!);
  const screenLightRef = useRef<THREE.PointLight>(null!);

  useFrame(() => {
    const p = scrollProgress.current;

    // lid rotation: 0 (closed) → -1.92 rad (~110°) at scroll 40%
    const targetRotation = mapRange(p, 0.15, 0.40, 0, -1.92);
    lidRef.current.rotation.x = THREE.MathUtils.lerp(
      lidRef.current.rotation.x,
      targetRotation,
      0.05
    );

    // screen glow intensity tied to how open the lid is
    const openness = mapRange(p, 0.20, 0.40, 0, 1);
    screenLightRef.current.intensity = THREE.MathUtils.lerp(
      screenLightRef.current.intensity,
      openness * 2.5,
      0.05
    );
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Base — keyboard half */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.4, 0.1, 1.6]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Trackpad */}
      <mesh position={[0, 0.06, 0.35]}>
        <boxGeometry args={[0.7, 0.01, 0.45]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Lid group — pivot is at hinge (back edge, y=0.05, z=-0.8) */}
      <group
        ref={lidRef}
        position={[0, 0.05, -0.8]}
      >
        {/* Lid body — offset forward so it rotates from hinge */}
        <mesh position={[0, 0, 0.8]}>
          <boxGeometry args={[2.4, 0.08, 1.6]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Screen bezel (inset) */}
        <mesh position={[0, 0.045, 0.8]}>
          <boxGeometry args={[2.2, 0.01, 1.4]} />
          <meshStandardMaterial color="#111111" />
        </mesh>

        {/* Screen glow light — sits just in front of screen surface */}
        <pointLight
          ref={screenLightRef}
          position={[0, 0.1, 0.85]}
          color="#88aaff"
          intensity={0}
          distance={3}
          decay={2}
        />
      </group>
    </group>
  );
}
