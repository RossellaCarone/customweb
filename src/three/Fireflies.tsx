import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PerfTier } from "./usePerf";

interface FirefliesProps {
  tier: PerfTier;
}

/**
 * GPU-instanced glowing motes drifting through the entire space.
 * Vertex shader animates them with sin waves so the CPU stays free.
 */
export const Fireflies = ({ tier }: FirefliesProps) => {
  const count = tier === "low" ? 220 : 820;
  const ref = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // distribute through whole journey volume
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = Math.random() * 8 - 0.5;
      positions[i * 3 + 2] = -Math.random() * 50 + 4;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color("#FFD9A8") },
        uSize: { value: tier === "low" ? 22 : 34 },
      },
      vertexShader: `
        attribute float aSeed;
        uniform float uTime;
        uniform float uSize;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          p.x += sin(uTime * 0.3 + aSeed) * 0.4;
          p.y += sin(uTime * 0.4 + aSeed * 1.7) * 0.35;
          p.z += cos(uTime * 0.25 + aSeed) * 0.3;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * (1.0 / -mv.z);
          vAlpha = 0.55 + 0.45 * sin(uTime * 1.2 + aSeed * 3.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float a = smoothstep(0.5, 0.0, d) * vAlpha;
          gl_FragColor = vec4(uColor, a);
        }
      `,
    });
    return { geometry, material };
  }, [count, tier]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime();
  });

  return <points ref={ref} geometry={geometry} material={material} />;
};
