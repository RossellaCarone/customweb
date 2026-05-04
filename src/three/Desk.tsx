/**
 * Wooden desk surface + a few stylised props (mug, notebook, pen).
 */
export const Desk = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Desk top */}
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[14, 0.1, 6]} />
        <meshStandardMaterial color="#2a2017" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Mug */}
      <group position={[2.4, 0.2, -0.3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.18, 0.16, 0.4, 32]} />
          <meshStandardMaterial color="#1a1a22" roughness={0.6} metalness={0.2} />
        </mesh>
        <mesh position={[0.22, 0, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.08, 0.018, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#1a1a22" roughness={0.6} />
        </mesh>
      </group>

      {/* Notebook */}
      <mesh castShadow position={[-2.2, 0.04, 0.2]} rotation={[0, 0.18, 0]}>
        <boxGeometry args={[0.9, 0.06, 1.2]} />
        <meshStandardMaterial color="#3a2418" roughness={0.7} />
      </mesh>

      {/* Pen */}
      <mesh castShadow position={[-1.6, 0.075, 0.7]} rotation={[0, 0.4, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.5, 16]} />
        <meshStandardMaterial color="#c8a96e" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
};
