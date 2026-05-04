import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";

/**
 * Mounts a single Lenis instance for smooth scroll and exposes
 * the current normalized scroll progress (0..1) plus a ref for hot reads.
 */
export function useLenisScroll() {
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const restoringRef = useRef(false);
  const lockedProgressRef = useRef(0);
  // Traccia l'ultima larghezza nota per ignorare i resize causati
  // solo dalla barra indirizzi iOS (cambiano solo l'altezza)
  const lastWidthRef = useRef(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

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
      if (restoringRef.current) return;
      progressRef.current = progress;
      setProgress(progress);
    };
    lenis.on("scroll", onScroll);

    let resizeRaf = 0;
    let resizeT1 = 0;
    let resizeT2 = 0;
    let unlockT = 0;

    const applyLockedFrame = () => {
      const safeLenis = lenis as unknown as {
        limit?: number;
        resize?: () => void;
        scrollTo: (target: number, opts?: { immediate?: boolean; force?: boolean }) => void;
      };
      safeLenis.resize?.();
      // ✅ clientHeight invece di innerHeight — stabile su iOS Safari
      const el = document.documentElement;
      const limit =
        safeLenis.limit ?? Math.max(0, el.scrollHeight - el.clientHeight);
      const targetY = Math.max(
        0,
        Math.min(limit, lockedProgressRef.current * limit)
      );
      safeLenis.scrollTo(targetY, { immediate: true, force: true });
      progressRef.current = lockedProgressRef.current;
      setProgress(lockedProgressRef.current);
    };

    const restoreFrameOnResize = () => {
      const currentWidth = window.innerWidth;

      // ✅ Ignora resize causati solo dalla barra indirizzi iOS:
      // se la larghezza non è cambiata, è la toolbar che appare/scompare
      if (currentWidth === lastWidthRef.current) return;
      lastWidthRef.current = currentWidth;

      lockedProgressRef.current = progressRef.current;
      restoringRef.current = true;
      cancelAnimationFrame(resizeRaf);
      clearTimeout(resizeT1);
      clearTimeout(resizeT2);
      clearTimeout(unlockT);
      resizeRaf = requestAnimationFrame(() => {
        applyLockedFrame();
      });
      resizeT1 = window.setTimeout(applyLockedFrame, 120);
      resizeT2 = window.setTimeout(applyLockedFrame, 280);
      unlockT = window.setTimeout(() => {
        restoringRef.current = false;
      }, 420);
    };

    const restoreFrameOnOrientation = () => {
      // orientationchange cambia sempre la larghezza — nessun filtro necessario
      lastWidthRef.current = window.innerWidth;
      lockedProgressRef.current = progressRef.current;
      restoringRef.current = true;
      cancelAnimationFrame(resizeRaf);
      clearTimeout(resizeT1);
      clearTimeout(resizeT2);
      clearTimeout(unlockT);
      resizeRaf = requestAnimationFrame(() => {
        applyLockedFrame();
      });
      resizeT1 = window.setTimeout(applyLockedFrame, 120);
      resizeT2 = window.setTimeout(applyLockedFrame, 280);
      unlockT = window.setTimeout(() => {
        restoringRef.current = false;
      }, 420);
    };

    window.addEventListener("resize", restoreFrameOnResize);
    window.addEventListener("orientationchange", restoreFrameOnOrientation);

    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(resizeRaf);
      clearTimeout(resizeT1);
      clearTimeout(resizeT2);
      clearTimeout(unlockT);
      window.removeEventListener("resize", restoreFrameOnResize);
      window.removeEventListener("orientationchange", restoreFrameOnOrientation);
      lenis.destroy();
    };
  }, []);

  return { progress, progressRef };
}