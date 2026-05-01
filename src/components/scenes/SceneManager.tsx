import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mapRange } from '@/utils/mapRange';
import Laptop from '@/components/three/Laptop';
import ParticleDust from '@/components/three/ParticleDust';

interface SceneManagerProps {
  scrollProgress: React.MutableRefObject<number>;
}

export default function SceneManager({ scrollProgress }: SceneManagerProps) {
  const cameraGroupRef = useRef<THREE.Group>(null!);

  useFrame(({ camera }) => {
    const p = scrollProgress.current;

    // Scene 1 (0–15%): camera advances toward desk from z=8 to z=3
    const camZ = mapRange(p, 0, 0.15, 8, 3);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, camZ, 0.04);

    // Scene 2 (15–40%): camera lowers and zooms to laptop-level
    const camY = mapRange(p, 0.15, 0.40, 1.5, 0.5);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, camY, 0.04);
  });

  return (
    <group ref={cameraGroupRef}>
      <ParticleDust count={120} />
      <Laptop scrollProgress={scrollProgress} />

      {/* Desk surface */}
      <mesh position={[0, -0.22, 0]} receiveShadow>
        <boxGeometry args={[5, 0.06, 3]} />
        <meshStandardMaterial color="#1a1208" metalness={0.0} roughness={0.85} />
      </mesh>

      {/* Key light — warm, from upper-left */}
      <directionalLight
        position={[-3, 4, 3]}
        intensity={1.2}
        color="#fff5e0"
        castShadow
      />
      {/* Ambient fill */}
      <ambientLight intensity={0.15} color="#2A2A3A" />
      {/* Rim light — cool back */}
      <directionalLight
        position={[2, 2, -4]}
        intensity={0.4}
        color="#4466aa"
      />
    </group>
  );
}
