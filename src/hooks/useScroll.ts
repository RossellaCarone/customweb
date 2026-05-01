import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * useScroll — initialises Lenis smooth scroll once,
 * returns a ref with scroll progress (0–1).
 */
export function useScroll() {
  const progress = useRef(0);

  useEffect(() => {
    if (lenisInstance) return; // already initialised

    lenisInstance = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenisInstance.on('scroll', ({ progress: p }: { progress: number }) => {
      progress.current = p;
    });

    function raf(time: number) {
      lenisInstance?.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenisInstance?.destroy();
      lenisInstance = null;
    };
  }, []);

  return progress;
}
