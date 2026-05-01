import { useEffect, useState } from "react";
import { Preloader } from "@/components/Preloader";
import { Scene } from "@/three/Scene";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import { mapRange } from "@/utils/mapRange";
import { projects } from "@/data/projects";

/**
 * Studio Notturno — Scenes 0–3.
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
    document.title = "Studio Notturno — Web Designer & Developer";
  }, []);

  // Derived overlay opacities
  const heroOpacity = mapRange(progress, 0, 0.08, 1, 0);
  const heroLineOpacity = mapRange(progress, 0.04, 0.12, 1, 0);
  const quoteOpacity =
    mapRange(progress, 0.18, 0.26, 0, 1) * mapRange(progress, 0.36, 0.42, 1, 0);
  const indicatorOpacity = mapRange(progress, 0, 0.04, 1, 0);
  const galleryHudOpacity =
    mapRange(progress, 0.46, 0.52, 0, 1) * mapRange(progress, 0.74, 0.78, 1, 0);
  const outroOpacity = mapRange(progress, 0.86, 0.94, 0, 1);

  // Active project index for HUD
  const galleryProgress = Math.max(0, Math.min(1, (progress - 0.42) / (0.78 - 0.42)));
  const activeIdx = Math.min(
    projects.length - 1,
    Math.floor(galleryProgress * projects.length)
  );
  const activeProject = projects[activeIdx];

  return (
    <>
      {!loaded && <Preloader onComplete={() => setLoaded(true)} name="STUDIO NOTTURNO" />}

      <Scene scrollRef={progressRef} />

      {/* Top-left brand */}
      <header className="fixed left-6 top-6 z-40 flex items-center gap-3 font-mono text-[10px] tracking-mono-xwide text-foreground/70 sm:text-xs">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold animate-drift" />
        <span>STUDIO · NOTTURNO</span>
      </header>

      {/* Top-right status */}
      <div className="fixed right-6 top-6 z-40 font-mono text-[10px] tracking-mono-xwide text-muted-foreground sm:text-xs">
        <span className="text-gold">●</span> <span>DISPONIBILE · 2026</span>
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
          Studio
          <br />
          <em className="font-narrative italic text-gold">Notturno</em>
        </h1>
        <p
          className="mt-8 max-w-md font-mono text-[10px] tracking-mono-wide text-muted-foreground sm:text-xs"
          style={{ opacity: heroLineOpacity }}
        >
          web designer &amp; developer · siti su misura, fatti con cura maniacale
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
        <p className="mb-3 font-mono text-[10px] tracking-mono-xwide text-gold">— FILOSOFIA</p>
        <p className="font-narrative text-xl italic leading-snug text-foreground/90 sm:text-2xl md:text-3xl">
          “Ogni sito che costruisco è uno strumento.
          <br />
          <span className="text-gold">Preciso. Veloce. Fatto per durare.</span>”
        </p>
      </aside>

      {/* Gallery HUD (Scene 3) — minimal frame around the display */}
      <div
        className="pointer-events-none fixed inset-0 z-30 flex items-end justify-between px-6 pb-8 sm:px-10 sm:pb-12"
        style={{ opacity: galleryHudOpacity }}
      >
        {/* Bottom-left: active project meta */}
        <div className="flex flex-col gap-1 font-mono text-[10px] tracking-mono-xwide text-muted-foreground sm:text-xs">
          <span className="text-gold">— GALLERIA · {activeProject.index} / {String(projects.length).padStart(2, "0")}</span>
          <span>{activeProject.client.toUpperCase()}</span>
        </div>

        {/* Bottom-right: live link */}
        <a
          href={activeProject.url}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto group flex items-center gap-3 font-mono text-[10px] tracking-mono-xwide text-foreground sm:text-xs"
        >
          <span className="transition-colors group-hover:text-gold">VISITA SITO LIVE</span>
          <span className="text-ember transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>

      {/* Right-side scene index */}
      <nav className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 font-mono text-[10px] tracking-mono-wide text-muted-foreground md:flex">
        {[
          { id: "01", label: "ENTRATA", at: 0.0, until: 0.1 },
          { id: "02", label: "STUDIO", at: 0.1, until: 0.42 },
          { id: "03", label: "GALLERIA", at: 0.42, until: 0.78 },
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

      {/* Outro fade-in */}
      <div
        className="pointer-events-none fixed inset-0 z-20 bg-background"
        style={{ opacity: outroOpacity }}
      />

      {/* Long page that creates scroll length */}
      <main className="relative z-10" aria-hidden="true">
        <div style={{ height: "700vh" }} />
        <footer className="relative z-30 flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-background px-6 py-20 text-center">
          <p className="font-mono text-[10px] tracking-mono-xwide text-gold">— PARLIAMONE</p>
          <p className="font-display text-3xl text-foreground sm:text-5xl">
            Hai un progetto in mente?
          </p>
          <a
            href="mailto:hello@studionotturno.com"
            className="pointer-events-auto font-mono text-sm tracking-mono-wide text-gold underline-offset-4 hover:underline"
          >
            hello@studionotturno.com
          </a>
          <p className="mt-6 font-mono text-[10px] tracking-mono-xwide text-muted-foreground">
            © 2026 · STUDIO NOTTURNO · FATTO CON CURA MANIACALE
          </p>
        </footer>
      </main>
    </>
  );
};

export default Index;
