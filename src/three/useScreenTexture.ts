import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import type { Project } from "@/data/projects";

const SCREEN_W = 1600;
const SCREEN_H = 1000;

interface ScreenTextureOptions {
  projects: Project[];
  /** Ref to global scroll progress 0..1 */
  scrollRef: React.MutableRefObject<number>;
  /** Scroll range where the laptop opens (light only, no slideshow yet) */
  openingRange: [number, number];
  /** Scroll range where the slideshow plays sequentially (no loop) */
  slideshowRange: [number, number];
  /** Scroll range where the "value proposition" pitch screen plays */
  pitchRange: [number, number];
  /** After this scroll the screen content is replaced by the HTML overlay,
   *  so we can stop drawing project frames. */
  fadeOutAt: number;
  /** Optional perf hint to reduce refresh rate. */
  lowPower?: boolean;
}

interface LoadedAssets {
  screenshots: HTMLImageElement[];
}

/**
 * Builds a CanvasTexture for the laptop's display.
 * Sequence (no loop):
 *   openingRange   : dark "boot" + brand logo
 *   slideshowRange : project screenshots one after the other (LDS → DDP)
 *   pitchRange     : value proposition pitch ("Sito su misura per il tuo business")
 *   > fadeOutAt    : screen fades to deep black so the HTML overlay can take over
 */
export function useScreenTexture({
  projects,
  scrollRef,
  openingRange,
  slideshowRange,
  pitchRange,
  fadeOutAt,
  lowPower = false,
}: ScreenTextureOptions) {
  const [assets, setAssets] = useState<LoadedAssets | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      projects.map(
        (p) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = p.screenshot;
          })
      )
    ).then((screenshots) => {
      if (!cancelled) setAssets({ screenshots });
    });
    return () => {
      cancelled = true;
    };
  }, [projects]);

  const { canvas, ctx, texture } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = SCREEN_W;
    canvas.height = SCREEN_H;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#0A0A0F";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 8;
    return { canvas, ctx, texture };
  }, []);

  useEffect(() => {
    if (!assets) return;
    let raf = 0;
    let frame = 0;

    /* ---------- helpers ---------- */
    const drawContain = (
      img: HTMLImageElement,
      x: number,
      y: number,
      w: number,
      h: number,
      alpha = 1
    ) => {
      const ir = img.width / img.height;
      const cr = w / h;
      let dw, dh, dx, dy;
      if (ir > cr) {
        dw = w;
        dh = w / ir;
        dx = x;
        dy = y + (h - dh) / 2;
      } else {
        dh = h;
        dw = h * ir;
        dx = x + (w - dw) / 2;
        dy = y;
      }
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
      ctx.globalAlpha = 1;
    };

    const drawScanlines = (alpha = 0.035) => {
      ctx.fillStyle = `rgba(120, 160, 220, ${alpha})`;
      for (let y = 0; y < SCREEN_H; y += 3) ctx.fillRect(0, y, SCREEN_W, 1);
    };

    const smoothstep = (k: number) => {
      const t = Math.max(0, Math.min(1, k));
      return t * t * (3 - 2 * t);
    };

    const clearBg = () => {
      ctx.fillStyle = "#0A0A0F";
      ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    };

    /* ---------- A. opening / boot ---------- */
    const renderOpening = (k: number) => {
      // k: 0 = closed (won't be visible), 1 = fully open
      clearBg();
      // Soft brand mark fading in
      const a = smoothstep(k);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = "#C8A96E";
      ctx.font = "300 22px 'DM Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("CUSTOM · WEB", SCREEN_W / 2, SCREEN_H / 2 - 20);
      ctx.fillStyle = "#9a9aa3";
      ctx.font = "300 14px 'DM Mono', monospace";
      ctx.fillText("loading portfolio …", SCREEN_W / 2, SCREEN_H / 2 + 18);
      ctx.restore();
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      drawScanlines();
    };

    /* ---------- B. sequential slideshow (no loop) ----------
     * Splits slideshowRange into N equal slots, one per project.
     * Inside each slot: short fade-in, hold, short fade-out.
     */
    const renderSlideshow = (s: number) => {
      const [s0, s1] = slideshowRange;
      const local = (s - s0) / (s1 - s0); // 0..1
      const N = projects.length;
      const slot = 1 / N;
      const idxF = local / slot;
      const idx = Math.max(0, Math.min(N - 1, Math.floor(idxF)));
      const within = idxF - idx; // 0..1 inside this project's slot

      // fade curve inside slot: in (0..0.1) hold (0.1..0.9) out (0.9..1)
      let alpha = 1;
      if (within < 0.1) alpha = smoothstep(within / 0.1);
      else if (within > 0.9) alpha = smoothstep((1 - within) / 0.1);

      clearBg();

      const img = assets.screenshots[idx];
      if (img) drawContain(img, 0, 0, SCREEN_W, SCREEN_H, alpha);

      drawScanlines();
    };

    /* ---------- C. value proposition pitch ---------- */
    const pitchLines = [
      { gold: "—", text: "UN SITO COSTRUITO" },
      { gold: null, text: "su misura per il" },
      { gold: null, text: "tuo business." },
    ];
    const pitchPoints = [
      "Ogni progetto nasce da strategia e ricerca",
      "Ogni scelta è guidata da obiettivi di business",
      "Ogni dettaglio valorizza i tuoi contenuti",
      "Ogni fase è chiara, dal concept al lancio",
    ];

    const renderPitch = (k: number) => {
      clearBg();

      // Subtle gold radial glow
      const grad = ctx.createRadialGradient(
        SCREEN_W * 0.7,
        SCREEN_H * 0.4,
        0,
        SCREEN_W * 0.7,
        SCREEN_H * 0.4,
        SCREEN_W * 0.7
      );
      grad.addColorStop(0, "rgba(200, 169, 110, 0.18)");
      grad.addColorStop(1, "rgba(10, 10, 15, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

      const ease = smoothstep(k);
      const yOffset = (1 - ease) * 40;
      ctx.save();
      ctx.globalAlpha = ease;
      ctx.translate(0, -yOffset);

      // Eyebrow
      ctx.fillStyle = "#C8A96E";
      ctx.font = "300 22px 'DM Mono', monospace";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("— LA PROPOSTA", 80, 140);

      // Headline (large serif)
      ctx.fillStyle = "#F0EBE1";
      ctx.font = "300 110px 'Cormorant Garamond', serif";
      ctx.fillText("Il sito web", 80, 280);
      ctx.fillStyle = "#F0EBE1";
      ctx.fillText("su misura", 80, 400);
      ctx.fillStyle = "#C8A96E";
      ctx.font = "italic 300 110px 'Cormorant Garamond', serif";
      ctx.fillText("per il tuo business.", 80, 520);

      // Bullets
      ctx.fillStyle = "#1a1814";
      ctx.font = "300 24px 'Fraunces', serif";
      pitchPoints.forEach((p, i) => {
        const yy = 640 + i * 44;
        ctx.fillStyle = "#C8A96E";
        ctx.fillText("·", 80, yy);
        ctx.fillStyle = "#cfc7b8";
        ctx.font = "300 36px 'Fraunces', serif"; // <-- più grande per il testo
        ctx.fillText(p, 110, yy);
      });

      // CTA hint
      ctx.restore();
      drawScanlines(0.025);
    };

    /* ---------- LOOP ---------- */
    const render = () => {
      frame += 1;
      const shouldSkip = lowPower && frame % 2 === 0;
      if (shouldSkip) {
        raf = requestAnimationFrame(render);
        return;
      }

      const s = scrollRef.current;
      const [o0, o1] = openingRange;
      const [s0, s1] = slideshowRange;
      const [p0, p1] = pitchRange;

      // Global fade-out as we approach fullscreen handoff
      const out = s >= fadeOutAt ? 1 : 0;

      if (s < o1) {
        const k = (s - o0) / (o1 - o0);
        renderOpening(k);
      } else if (s < s0) {
        // brief gap → keep opening final state
        renderOpening(1);
      } else if (s < s1) {
        renderSlideshow(s);
      } else if (s < p0) {
        // hold last slideshow frame (won't be visible long)
        renderSlideshow(s1 - 0.0001);
      } else if (s < p1) {
        const k = (s - p0) / (p1 - p0);
        renderPitch(k);
      } else {
        renderPitch(1);
      }

      if (out > 0) {
        ctx.save();
        ctx.globalAlpha = out;
        ctx.fillStyle = "#0A0A0F";
        ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
        ctx.restore();
      }

      texture.needsUpdate = true;
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [
    assets,
    ctx,
    texture,
    projects,
    scrollRef,
    openingRange,
    slideshowRange,
    pitchRange,
    fadeOutAt,
    lowPower,
  ]);

  return texture;
}
