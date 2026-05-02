import { useEffect, useMemo, useState } from "react";
import { Preloader } from "@/components/Preloader";
import { Scene } from "@/three/Scene";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "sent" | "error">("idle");
  const [formValues, setFormValues] = useState({ name: "", email: "", message: "" });
  const [glow, setGlow] = useState({ x: 50, y: 35, active: false });
  const isMobile = useIsMobile();
  const { progress, progressRef } = useLenisScroll();

  const particles = useMemo(
    () =>
      Array.from({ length: isMobile ? 8 : 18 }, (_, i) => ({
        left: `${8 + (i % 6) * 16 + (i % 2) * 3}%`,
        top: `${10 + Math.floor(i / 6) * 28 + (i % 3) * 4}%`,
        delay: `${(i * 0.37).toFixed(2)}s`,
        duration: `${4.8 + (i % 5) * 1.25}s`,
      })),
    [isMobile]
  );

  useEffect(() => {
    document.title = "Custom Web — Web Designer & Developer";

    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.history.scrollRestoration = previousRestoration;
      window.removeEventListener("pageshow", onPageShow);
    };
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
  const contactMix = mapRange(progress, 0.94, 0.998, 0, 1);
  const contactOpacity = contactMix * contactMix * (3 - 2 * contactMix);
  const contactLift = mapRange(progress, 0.94, 0.998, 24, 0);

  // Motion blur vignette during zoom
  const zoomBlur = mapRange(progress, 0.40, 0.46, 0, 1) * mapRange(progress, 0.46, 0.52, 1, 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitState("idle");

    try {
      const payload = new FormData();
      payload.append("name", formValues.name);
      payload.append("email", formValues.email);
      payload.append("message", formValues.message);

      const res = await fetch("https://formspree.io/f/mwvyvpqw", {
        method: "POST",
        body: payload,
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("submit failed");

      setSubmitState("sent");
      setFormValues({ name: "", email: "", message: "" });
      window.setTimeout(() => setSubmitState("idle"), 3200);
    } catch {
      setSubmitState("error");
      window.setTimeout(() => setSubmitState("idle"), 3200);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {!loaded && <Preloader onComplete={() => setLoaded(true)} name="CUSTOM WEB" />}
         
      <Scene scrollRef={progressRef} opacity={sceneOpacity} isMobile={isMobile} />

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

      {/* Final contact panel */}
      <section
        className="fixed inset-0 z-[50] overflow-y-auto"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setGlow({ x, y, active: true });
        }}
        onMouseLeave={() => setGlow((g) => ({ ...g, active: false }))}
        style={{
          opacity: isMobile ? 1 : contactOpacity,
          pointerEvents: isMobile ? "auto" : contactOpacity > 0.2 ? "auto" : "none",
          transform: isMobile ? "translateY(0px)" : `translateY(${contactLift}px)`,
          transition: "opacity 160ms linear, transform 220ms var(--ease-soft)",
        }}
      >
        <div
          className="min-h-full"
          style={{
            background:
              "radial-gradient(1200px 760px at 80% 86%, rgba(95,17,17,0.26) 0%, rgba(10,10,15,0) 58%), linear-gradient(165deg, #06070D 0%, #090B12 52%, #07080E 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              opacity: glow.active ? 0.45 : 0.18,
              transition: "opacity 240ms ease",
              background: `radial-gradient(460px 300px at ${glow.x}% ${glow.y}%, rgba(200,169,110,0.22), rgba(200,169,110,0.04) 45%, transparent 72%)`,
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[52%] z-0 overflow-hidden">
            {particles.map((p, i) => (
              <span
                key={i}
                className="contact-particle"
                style={{
                  left: p.left,
                  top: p.top,
                  animationDelay: p.delay,
                  animationDuration: p.duration,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[760px] flex-col px-5 pb-8 pt-12 sm:px-8 sm:pb-10 sm:pt-14">
            <p className="font-mono text-[11px] uppercase tracking-mono-xwide text-gold sm:text-xs">
              - PARLIAMONE
            </p>

            <h2 className="contact-title mt-4 font-display text-[clamp(1.8rem,8.2vw,3.95rem)] font-light leading-[0.94] tracking-tight text-foreground">
              <span className="contact-line">Hai un progetto</span>
              <br />
              <em className="contact-line contact-line-gold font-narrative italic text-gold">in mente?</em>
            </h2>

            <p className="contact-lead mt-4 max-w-[36rem] font-narrative text-[clamp(0.92rem,3.4vw,1.48rem)] leading-[1.26] text-foreground/96">
              Una mail, due righe sull'idea, e fissiamo una chiamata. Niente moduli inutili,
              niente attese. Risposta entro 24 ore lavorative.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2.5 font-mono text-[clamp(0.74rem,1.6vw,0.98rem)] tracking-[0.13em] text-foreground/58 sm:mt-8 sm:gap-x-8 sm:gap-y-3 sm:tracking-[0.16em]">
              <a
                className="contact-link-motion text-gold transition-colors duration-300 hover:text-ember"
                href="mailto:hello@studionotturno.com"
              >
                <span className="mr-3 text-ember">-&gt;</span>
                hello@studionotturno.com
              </a>
              <a className="contact-link-motion transition-colors duration-300 hover:text-foreground" href="#">
                WhatsApp
              </a>
              <a className="contact-link-motion transition-colors duration-300 hover:text-foreground" href="#">
                LinkedIn
              </a>
            </div>

            <form className="mt-7 flex max-w-[760px] flex-1 flex-col sm:mt-9" onSubmit={handleSubmit}>
              {submitState === "idle" ? (
                <>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                    <label className="group">
                      <span className="font-mono text-[clamp(0.88rem,2.1vw,1.12rem)] tracking-[0.03em] text-foreground/58">Nome</span>
                      <input
                        type="text"
                        name="name"
                        value={formValues.name}
                        onChange={(e) => setFormValues((v) => ({ ...v, name: e.target.value }))}
                        required
                        className="mt-2 w-full border-b border-foreground/18 bg-transparent pb-2.5 font-narrative text-[clamp(0.95rem,2.3vw,1.2rem)] text-foreground outline-none transition-colors duration-300 placeholder:text-foreground/25 focus:border-gold"
                        placeholder=""
                      />
                    </label>

                    <label className="group">
                      <span className="font-mono text-[clamp(0.88rem,2.1vw,1.12rem)] tracking-[0.03em] text-foreground/58">Email</span>
                      <input
                        type="email"
                        name="email"
                        value={formValues.email}
                        onChange={(e) => setFormValues((v) => ({ ...v, email: e.target.value }))}
                        required
                        className="mt-2 w-full border-b border-foreground/18 bg-transparent pb-2.5 font-narrative text-[clamp(0.95rem,2.3vw,1.2rem)] text-foreground outline-none transition-colors duration-300 placeholder:text-foreground/25 focus:border-gold"
                        placeholder=""
                      />
                    </label>
                  </div>

                  <label className="mt-5 sm:mt-8">
                    <textarea
                      name="message"
                      rows={isMobile ? 2 : 3}
                      value={formValues.message}
                      onChange={(e) => setFormValues((v) => ({ ...v, message: e.target.value }))}
                      required
                      className="w-full resize-none border-b border-foreground/18 bg-transparent pb-3.5 font-mono text-[clamp(0.88rem,2.05vw,1.15rem)] leading-[1.34] tracking-[0.02em] text-foreground/56 outline-none transition-colors duration-300 placeholder:text-foreground/40 focus:border-gold"
                      placeholder="Raccontami il tuo progetto in 2 righe..."
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 inline-flex w-full items-center justify-between border border-gold/45 px-5 py-3 font-mono text-[clamp(0.74rem,1.45vw,0.95rem)] uppercase tracking-[0.15em] text-gold transition-colors duration-300 hover:border-gold hover:text-foreground sm:mt-5 sm:w-[22rem] sm:px-6 sm:py-4 sm:tracking-[0.18em]"
                  >
                    <span>{isSubmitting ? "Invio in corso..." : "Invia messaggio"}</span>
                    <span className="text-ember">-&gt;</span>
                  </button>
                </>
              ) : (
                <div
                  className={`flex min-h-[360px] w-full flex-1 items-center justify-center border bg-black/20 px-8 py-10 text-center animate-fade-up ${
                    submitState === "sent" ? "border-gold/35" : "border-ember/35"
                  }`}
                >
                  <div className="max-w-2xl">
                    <p
                      className={`font-display text-[clamp(2rem,5vw,3.4rem)] leading-none ${
                        submitState === "sent" ? "text-gold" : "text-ember"
                      }`}
                    >
                      {submitState === "sent" ? "Messaggio inviato" : "Invio non riuscito"}
                    </p>
                    <p className="mt-4 font-mono text-[clamp(0.9rem,1.2vw,1.05rem)] tracking-[0.12em] text-foreground/68">
                      {submitState === "sent"
                        ? "Grazie. Ti rispondo a breve, il form torna disponibile tra pochi secondi."
                        : "C'e stato un problema temporaneo. Il form torna disponibile tra pochi secondi."}
                    </p>
                  </div>
                </div>
              )}
            </form>

            <footer className="mt-7 flex flex-wrap items-end justify-between gap-3 border-t border-transparent pt-3.5 font-mono text-[clamp(0.62rem,1.05vw,0.84rem)] uppercase tracking-[0.12em] text-gold/88 sm:mt-10 sm:gap-4 sm:pt-5 sm:tracking-[0.18em]">
              <span>&copy; 2026 . Studio Notturno</span>
              <span>Disponibile . 2026</span>
            </footer>
          </div>
        </div>
      </section>

      {/* Top-left brand */}
      <header className="fixed left-6 top-6 z-40 flex items-center gap-3 font-mono text-[10px] tracking-mono-xwide text-foreground/70 sm:text-xs">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold animate-drift" />
        <span>CUSTOM · WEB</span>
      </header>

      {/* Top-right status */}
      <div className="fixed right-6 top-6 z-40 hidden font-mono text-[10px] tracking-mono-xwide text-muted-foreground sm:block sm:text-xs">
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
        <div style={{ height: isMobile ? "460vh" : "760vh" }} />
      </main>
    </>
  );
};

export default Index;
