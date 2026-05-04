import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DustProps {
  count?: number;
}

/**
 * Atmospheric dust particles drifting slowly through the studio air.
 */
export const Dust = ({ count = 240 }: DustProps) => {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = Math.random() * 6 - 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      speeds[i] = 0.05 + Math.random() * 0.15;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((_, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const pos = pts.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * delta * 0.15;
      arr[i * 3] += Math.sin(performance.now() * 0.0002 + i) * delta * 0.03;
      if (arr[i * 3 + 1] > 5.5) arr[i * 3 + 1] = -0.5;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color="#f0ebe1"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};
