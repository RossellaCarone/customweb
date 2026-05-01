import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ScreenCanvasProps {
  screenshots: string[];
  /** interval in ms between slides */
  interval?: number;
}

/**
 * ScreenCanvas — creates a CanvasTexture that crossfades between
 * screenshot images. Attach as a map to the screen PlaneGeometry.
 */
export default function ScreenCanvas({ screenshots, interval = 3000 }: ScreenCanvasProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const { gl } = useThree();

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 800;
    canvasRef.current = canvas;

    const texture = new THREE.CanvasTexture(canvas);
    textureRef.current = texture;

    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).map = texture;
      (meshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }

    const ctx = canvas.getContext('2d')!;
    const images: HTMLImageElement[] = [];
    let loaded = 0;
    let current = 0;
    let alpha = 1;
    let fading = false;

    const draw = () => {
      if (images.length === 0) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = alpha;
      ctx.drawImage(images[current], 0, 0, canvas.width, canvas.height);
      texture.needsUpdate = true;
    };

    screenshots.forEach((src, i) => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (loaded === screenshots.length) draw();
      };
      img.src = src;
      images[i] = img;
    });

    const tick = setInterval(() => {
      if (images.length < 2 || fading) return;
      fading = true;
      const next = (current + 1) % images.length;
      let a = 1;
      const fade = setInterval(() => {
        a -= 0.05;
        if (a <= 0) {
          current = next;
          alpha = 1;
          clearInterval(fade);
          fading = false;
        } else {
          alpha = a;
        }
        draw();
      }, 16);
    }, interval);

    return () => {
      clearInterval(tick);
      texture.dispose();
    };
  }, [screenshots, interval]);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1.4, 0.875]} />
      <meshStandardMaterial
        emissive={new THREE.Color(0x88aaff)}
        emissiveIntensity={0.15}
        toneMapped={false}
      />
    </mesh>
  );
}
