import { Canvas } from '@react-three/fiber';
import { useRef, Suspense } from 'react';
import { useScroll } from '@/hooks/useScroll';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import SceneManager from '@/components/scenes/SceneManager';
import Postprocessing from '@/components/three/Postprocessing';

export default function PortfolioCanvas() {
  const scrollProgress = useScroll();
  const isMobile = useBreakpoint();

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      <Canvas
        shadows
        camera={{ position: [0, 1.5, 8], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        dpr={isMobile.current ? 1 : [1, 2]}
      >
        <Suspense fallback={null}>
          <SceneManager scrollProgress={scrollProgress} />
          {!isMobile.current && <Postprocessing />}
        </Suspense>
      </Canvas>
    </div>
  );
}
