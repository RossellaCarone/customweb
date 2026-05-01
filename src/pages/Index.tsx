import { useEffect, useState } from "react";
import { Preloader } from "@/components/Preloader";
import { Scene } from "@/three/Scene";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import { mapRange } from "@/utils/mapRange";

/**
 * CUSTOM WEB — Scenes 0–3.
 *  0  Preloader
 *  1  Hero (0–0.10)        scrivania, brand
 *  2  Laptop opens (0.10–0.40)
 *  3  Immersive gallery (0.42–0.78)  — content rendered into the screen texture
 *     with camera pushing INTO the display.
 *  Outro (0.78–1.0)
 */
const Index = () => {
  const [loaded, setLoaded] = useState(false);
  const { progress, progressRef } = useLenisScroll();

  useEffect(() => {
    document.title = "Custom Web — Web Designer & Developer";
  }, []);

  // Derived overlay opacities
  const heroOpacity = mapRange(progress, 0, 0.08, 1, 0);
  const heroLineOpacity = mapRange(progress, 0.04, 0.12, 1, 0);
  const quoteOpacity =
    mapRange(progress, 0.18, 0.26, 0, 1) * mapRange(progress, 0.36, 0.42, 1, 0);
  const indicatorOpacity = mapRange(progress, 0, 0.04, 1, 0);
  const sceneOpacity = mapRange(progress, 0.88, 0.985, 1, 0);
  const bridgeMix = mapRange(progress, 0.88, 0.975, 0, 1);
  const bridgeEase = bridgeMix * bridgeMix * (3 - 2 * bridgeMix);
  const bridgeOpacity = bridgeEase * 0.82;
  const laptopExplosion =
    mapRange(progress, 0.9, 0.975, 0, 1) * mapRange(progress, 0.975, 0.998, 1, 0);
  const blackMix = mapRange(progress, 0.92, 0.998, 0, 1);
  const blackScreenOpacity = blackMix * blackMix * (3 - 2 * blackMix);

  // Motion blur vignette during zoom
  const zoomBlur = mapRange(progress, 0.40, 0.46, 0, 1) * mapRange(progress, 0.46, 0.52, 1, 0);

  return (
    <>
      {!loaded && <Preloader onComplete={() => setLoaded(true)} name="CUSTOM WEB" />}
         
      <Scene scrollRef={progressRef} opacity={sceneOpacity} />

      {/* Single smooth tonal bridge from laptop to black */}
      <div
        className="pointer-events-none fixed inset-0 z-[28]"
        style={{
          opacity: bridgeOpacity,
          background: "radial-gradient(ellipse at center, rgba(10,10,15,0.58) 0%, rgba(10,10,15,0.95) 85%)",
        }}
      />

      <div
        className="pointer-events-none fixed inset-0 z-[29]"
        style={{
          opacity: blackScreenOpacity * 0.45,
          background: "linear-gradient(180deg, rgba(6,7,10,0.25) 0%, rgba(6,7,10,0.75) 100%)",
        }}
      />

      <div
        className="pointer-events-none fixed inset-0 z-[34]"
        style={{
          opacity: laptopExplosion * 0.38,
          background:
            "radial-gradient(ellipse at center, rgba(200,169,110,0.22) 0%, rgba(10,10,15,0.12) 42%, rgba(10,10,15,0.96) 100%)",
          transform: `scale(${1 + laptopExplosion * 0.16})`,
          transformOrigin: "center center",
        }}
      />

      <div
        className="pointer-events-none fixed inset-0 z-[36] bg-black"
        style={{ opacity: blackScreenOpacity }}
      />

      {/* Top-left brand */}
      <header className="fixed left-6 top-6 z-40 flex items-center gap-3 font-mono text-[10px] tracking-mono-xwide text-foreground/70 sm:text-xs">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold animate-drift" />
        <span>CUSTOM · WEB</span>
      </header>

      {/* Top-right status */}
      <div className="fixed right-6 top-6 z-40 font-mono text-[10px] tracking-mono-xwide text-muted-foreground sm:text-xs">
        <span className="text-gold">●</span> <span>DISPONIBILE · NUOVI PROGETTI</span>
      </div>

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
          siti web su misura · il valore è nei dettagli
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

      {/* Filosofia quote (Scene 2) */}
      <aside
        className="pointer-events-none fixed left-6 top-1/2 z-30 max-w-xs -translate-y-1/2 sm:left-12 md:max-w-sm lg:left-20"
        style={{ opacity: quoteOpacity }}
      >
        <p className="font-narrative text-xl italic leading-snug text-foreground/90 sm:text-2xl md:text-3xl">
          Un sito non si guarda.
          <br />
          <span className="text-gold">Si vive.</span>
        </p>
      </aside>


      {/* Right-side scene index */}
      <nav className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 font-mono text-[10px] tracking-mono-wide text-muted-foreground md:flex">
        {[
          { id: "01", label: "ENTRATA", at: 0.0, until: 0.1 },
          { id: "02", label: "STUDIO", at: 0.1, until: 0.5 },
          { id: "03", label: "VISIONE", at: 0.5, until: 0.95 },
          { id: "04", label: "BLACKOUT", at: 0.95, until: 1.0 },
        ].map((s) => {
          const active = progress >= s.at && progress < s.until;
          return (
            <div key={s.id} className="flex items-center gap-3">
              <span className={active ? "text-gold" : ""}>{s.id}</span>
              <div className="relative h-px w-8 bg-border">
                <div
                  className="absolute inset-y-0 left-0 bg-gold transition-all duration-500"
                  style={{ width: active ? "100%" : "0%" }}
                />
              </div>
              <span className={active ? "text-foreground" : ""}>{s.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Motion blur vignette — dark rim that pulses during zoom */}
      <div
        className="pointer-events-none fixed inset-0 z-49"
        style={{
          opacity: zoomBlur * 0.7,
          background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Long page that creates scroll length */}
      <main className="relative z-10" aria-hidden="true">
        <div style={{ height: "760vh" }} />
      </main>
    </>
  );
};

export default Index;
