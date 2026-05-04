import { MeshReflectorMaterial } from "@react-three/drei";
import type { PerfTier } from "./usePerf";

interface FloorProps {
  tier: PerfTier;
}

/**
 * Endless dark mirror floor. The whole 3D world stands on this plane.
 * Reflections + a faint warm tint give the "atelier notturno" feel.
 */
export const Floor = ({ tier }: FloorProps) => {
  const low = tier === "low";
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      {low ? (
        <meshStandardMaterial color="#0a0a10" roughness={0.6} metalness={0.4} />
      ) : (
        <MeshReflectorMaterial
          blur={[120, 60]}
          resolution={256}
          mixBlur={0.7}
          mixStrength={0.45}
          roughness={0.88}
          depthScale={0.5}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color="#0a0a10"
          metalness={0.48}
          mirror={0.28}
        />
      )}
    </mesh>
  );
};
