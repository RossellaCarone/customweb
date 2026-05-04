import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mapRange } from "@/utils/mapRange";

interface PortalProps {
  scrollRef: React.MutableRefObject<number>;
}

/**
 * A monumental stone arch the camera flies through to leave the
 * "atelier" stage and enter the orbiting projects stage.
 * Acts as a visual gateway in the continuous 3D world.
 */
export const Portal = ({ scrollRef }: PortalProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  const arcShape = useMemo(() => {
    const s = new THREE.Shape();
    const W = 6;
    const H = 9;
    const r = W / 2;
    s.moveTo(-W / 2, 0);
    s.lineTo(-W / 2, H - r);
    s.absarc(0, H - r, r, Math.PI, 0, true);
    s.lineTo(W / 2, 0);
    s.lineTo(-W / 2, 0);

    // hole
    const hole = new THREE.Path();
    const w = W - 1.4;
    const h = H - 1.0;
    const hr = w / 2;
    hole.moveTo(-w / 2, 0.7);
    hole.lineTo(-w / 2, h - hr + 0.7);
    hole.absarc(0, h - hr + 0.7, hr, Math.PI, 0, true);
    hole.lineTo(w / 2, 0.7);
    hole.lineTo(-w / 2, 0.7);
    s.holes.push(hole);
    return s;
  }, []);

  useFrame(({ clock }) => {
    const s = scrollRef.current;
    const visibility = mapRange(s, 0.34, 0.44, 0, 1) * mapRange(s, 0.54, 0.66, 1, 0);

    if (groupRef.current) {
      groupRef.current.visible = visibility > 0.01;
    }

    if (!innerRef.current) return;
    const m = innerRef.current.material as THREE.MeshBasicMaterial;
    m.opacity = (0.14 + Math.sin(clock.getElapsedTime() * 0.8) * 0.04) * visibility;
  });

  return (
    <group ref={groupRef} position={[0, 0, -10]}>
      {/* Stone frame */}
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={[arcShape, { depth: 0.6, bevelEnabled: false }]} />
        <meshStandardMaterial color="#1a1a22" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Inner glow plane */}
      <mesh ref={innerRef} position={[0, 4.0, -0.2]}>
        <planeGeometry args={[5, 8]} />
        <meshBasicMaterial color="#C8A96E" transparent opacity={0.2} depthWrite={false} />
      </mesh>

      {/* Light cast forward */}
      <pointLight position={[0, 4, 1]} color="#C8A96E" intensity={5} distance={12} decay={2} />
    </group>
  );
};
