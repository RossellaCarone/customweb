import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";

/**
 * Mounts a single Lenis instance for smooth scroll and exposes
 * the current normalized scroll progress (0..1) plus a ref for hot reads.
 */
export function useLenisScroll() {
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const resetToTop = () => {
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true, force: true });
      progressRef.current = 0;
      setProgress(0);
    };

    const t1 = window.setTimeout(resetToTop, 0);
    const t2 = window.setTimeout(resetToTop, 120);
    const t3 = window.setTimeout(resetToTop, 420);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const onScroll = ({ progress }: { progress: number }) => {
      progressRef.current = progress;
      setProgress(progress);
    };
    lenis.on("scroll", onScroll);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return { progress, progressRef };
}
