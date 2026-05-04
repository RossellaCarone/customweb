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
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

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

    let resizeRaf = 0;
    const restoreFrameOnResize = () => {
      const savedProgress = progressRef.current;
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        const limit =
          (lenis as unknown as { limit?: number }).limit ??
          Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const targetY = Math.max(0, Math.min(limit, savedProgress * limit));
        lenis.scrollTo(targetY, { immediate: true, force: true });
      });
    };

    window.addEventListener("resize", restoreFrameOnResize);
    window.addEventListener("orientationchange", restoreFrameOnResize);

    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", restoreFrameOnResize);
      window.removeEventListener("orientationchange", restoreFrameOnResize);
      lenis.destroy();
    };
  }, []);

  return { progress, progressRef };
}
