import { useEffect, useState } from "react";
import { Preloader } from "@/components/Preloader";
import { Scene } from "@/three/Scene";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import { mapRange } from "@/utils/mapRange";

/**
 * Custom Web  — single continuous 3D world.
 * The camera flies through one space; HTML overlays are minimal
 * (brand chrome + hero text) so the experience feels immersive.
 */
const Index = () => {
  const [loaded, setLoaded] = useState(false);
  const [portraitMobile, setPortraitMobile] = useState(false);
  const { progress, progressRef } = useLenisScroll();

  useEffect(() => {
    const check = () => {
      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      setPortraitMobile(isMobile && window.innerHeight > window.innerWidth);
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  useEffect(() => {
    document.title = "Custom Web — Web Designer & Developer";
  }, []);

  const heroOpacity = mapRange(progress, 0, 0.08, 1, 0);
  const heroLineOpacity = mapRange(progress, 0.04, 0.12, 1, 0);
  const indicatorOpacity = mapRange(progress, 0, 0.04, 1, 0);

  // Filosofia visible during opening + slideshow only
  const quoteOpacity =
    mapRange(progress, 0.14, 0.2, 0, 1) * mapRange(progress, 0.3, 0.36, 1, 0);

  return (
    <>
      {!loaded && (
        <Preloader
          onComplete={() => setLoaded(true)}
          name="CUSTOM WEB"
          showRotateHint={portraitMobile}
        />
      )}

      <Scene scrollRef={progressRef} />


      {/* HERO */}
      <section
        className="pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity: heroOpacity }}
      >
        <p className="mb-6 font-mono text-[10px] uppercase tracking-mono-xwide text-gold sm:text-xs fade-up">
          — Atelier digitale —
        </p>
        <h1 className="font-display text-[14vw] font-light leading-[0.92] tracking-tight text-foreground sm:text-[10vw] md:text-[8vw] lg:text-[7rem] fade-up">
          Custom
          <br />
          <em className="font-narrative italic text-gold">Web</em>
        </h1>
        <p
          className="mt-8 max-w-md font-mono text-[10px] tracking-mono-wide text-muted-foreground sm:text-xs"
          style={{ opacity: heroLineOpacity }}
        >
          web designer &amp; developer · il valore è nei dettagli
        </p>
      </section>

      {/* Scroll indicator */}
      <div
        className="pointer-events-none fixed bottom-8 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] tracking-mono-xwide text-muted-foreground"
        style={{ opacity: indicatorOpacity }}
      >
        <span>SCORRI</span>
        <div className="relative h-10 w-px overflow-hidden bg-border">
          <div className="absolute inset-x-0 top-0 h-4 animate-[drift_1.6s_ease-in-out_infinite] bg-gold" />
        </div>
      </div>

      {/* Filosofia quote */}
      <aside
        className={`pointer-events-none fixed z-30 ${
          portraitMobile
            ? "left-1/2 top-[28%] max-w-[84vw] -translate-x-1/2 text-center"
            : "left-6 top-1/2 max-w-xs -translate-y-1/2 sm:left-12 md:max-w-sm lg:left-20"
        }`}
        style={{ opacity: quoteOpacity }}
      >
        <p className="font-narrative text-xl italic leading-snug text-foreground/90 sm:text-2xl md:text-3xl">
          Un sito non si guarda.
          <br />
          <span className="text-gold">Si vive.</span>
        </p>
      </aside>

      {/* Long page that creates scroll length */}
      <main className="relative z-10 pointer-events-none" aria-hidden="true">
        <div style={{ height: "950vh" }} />
      </main>
    </>
  );
};

export default Index;
