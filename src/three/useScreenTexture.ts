import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Project } from "@/data/projects";

const SCREEN_W = 1280;
const SCREEN_H = 800;
const TARGET_FPS = 30;
const FRAME_MS = 1000 / TARGET_FPS;

interface ScreenTextureOptions {
  projects: Project[];
  /** Ref to global scroll progress 0..1 */
  scrollRef: React.MutableRefObject<number>;
  /** Scroll range where slideshow plays (laptop opening) */
  slideshowRange: [number, number];
  /** Scroll range where gallery plays (immersive) */
  galleryRange: [number, number];
}

interface LoadedAssets {
  screenshots: HTMLImageElement[];
}

/**
 * Builds a CanvasTexture that swaps between two modes driven by global scroll:
 *  • slideshow: simple cross-fade of screenshots while the laptop opens
 *  • gallery:   editorial composition per project, with scroll-driven vertical pan
 *               and crossfade between projects — the "immersive" Scene 3
 */
export function useScreenTexture({
  projects,
  scrollRef,
  slideshowRange,
  galleryRange,
}: ScreenTextureOptions) {
  const [assets, setAssets] = useState<LoadedAssets | null>(null);
  const lastRenderRef = useRef(0);
  const pointerRef = useRef({ x: -1, y: -1, active: false });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pointerRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
      };
    };

    const onLeave = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Load all screenshots
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

    const drawCover = (
      img: HTMLImageElement,
      x: number,
      y: number,
      w: number,
      h: number,
      alpha = 1
    ) => {
      const ir = img.width / img.height;
      const cr = w / h;
      let dw = w;
      let dh = h;
      let dx = x;
      let dy = y;
      if (ir > cr) {
        dh = h;
        dw = h * ir;
        dx = x + (w - dw) / 2;
      } else {
        dw = w;
        dh = w / ir;
        dy = y + (h - dh) / 2;
      }
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
      ctx.globalAlpha = 1;
    };

    const drawScanlines = () => {
      ctx.fillStyle = "rgba(120, 160, 220, 0.035)";
      for (let y = 0; y < SCREEN_H; y += 3) {
        ctx.fillRect(0, y, SCREEN_W, 1);
      }
    };

    const drawManifesto = (alpha = 1, t = 0) => {
      ctx.save();
      ctx.globalAlpha = alpha;

      // Mini hero inside laptop screen
      ctx.fillStyle = "#0A0A0F";
      ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, SCREEN_H);
      bgGrad.addColorStop(0, "#0A0A0F");
      bgGrad.addColorStop(1, "#11131A");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

      const halo = ctx.createRadialGradient(
        SCREEN_W * 0.8,
        SCREEN_H * 0.16,
        10,
        SCREEN_W * 0.8,
        SCREEN_H * 0.16,
        420
      );
      halo.addColorStop(0, "rgba(200,169,110,0.22)");
      halo.addColorStop(1, "rgba(200,169,110,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

      // Header bar
      ctx.strokeStyle = "rgba(240,235,225,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(70, 78);
      ctx.lineTo(SCREEN_W - 70, 78);
      ctx.stroke();

      ctx.fillStyle = "rgba(240,235,225,0.8)";
      ctx.font = "400 16px 'DM Mono', monospace";
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.fillText("CUSTOM WEB", 70, 50);
      ctx.textAlign = "right";
      ctx.fillText("WEB EXPERIENCE DESIGN", SCREEN_W - 70, 50);

      // Hero copy
      ctx.textAlign = "left";
      ctx.fillStyle = "#F0EBE1";
      ctx.font = "300 italic 72px 'Cormorant Garamond', serif";
      ctx.fillText("Il sito web su misura", 84, 220);
      ctx.fillText("per il tuo", 84, 302);

      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.font = "400 italic 102px 'Cormorant Garamond', serif";
      ctx.fillText("Business", 87, 390);
      ctx.fillStyle = "#B9975B";
      ctx.fillText("Business", 84, 386);

      ctx.fillStyle = "rgba(240,235,225,0.82)";
      ctx.font = "300 20px 'Fraunces', serif";
      wrapText(
        ctx,
        "Una presenza digitale costruita per posizionare il tuo brand con chiarezza, aumentare la fiducia al primo sguardo e guidare l'utente fino al contatto.",
        88,
        452,
        620,
        31
      );

      ctx.fillStyle = "rgba(240,235,225,0.58)";
      ctx.font = "400 13px 'DM Mono', monospace";
      ctx.fillText("Strategia · Identita` · Conversione", 88, 596);

      // Right feature blocks
      const cards = [
        {
          title: "POSIZIONAMENTO",
          text: "Proposta di valore leggibile subito, con gerarchia chiara e focus sul tuo vantaggio.",
        },
        {
          title: "FIDUCIA",
          text: "Design editoriale, tono coerente e dettagli premium che rendono il brand autorevole.",
        },
        {
          title: "RISULTATI",
          text: "Percorso orientato all'azione: meno dispersione, piu` richieste qualificate.",
        },
      ];
      const px = pointerRef.current.active
        ? (pointerRef.current.x / window.innerWidth) * SCREEN_W
        : -1;
      const py = pointerRef.current.active
        ? (pointerRef.current.y / window.innerHeight) * SCREEN_H
        : -1;

      let hoveredCard = -1;
      const cardX = 824;
      const cardW = 380;
      const cardH = 154;
      const revealBase = Math.max(0, Math.min(1, (alpha - 0.15) / 0.85));

      cards.forEach((_, i) => {
        const y = 176 + i * 178;
        if (px >= cardX && px <= cardX + cardW && py >= y && py <= y + cardH) {
          hoveredCard = i;
        }
      });

      cards.forEach((card, i) => {
        const reveal = Math.max(0, Math.min(1, (revealBase - i * 0.18) / 0.42));
        const y =
          176 +
          i * 178 +
          (1 - reveal) * 28 +
          Math.sin(t * 0.0018 + i * 0.9) * 4 * reveal;
        const isActive = i === hoveredCard;

        ctx.save();
        ctx.globalAlpha = 0.15 + reveal * 0.85;

        ctx.fillStyle = isActive ? "rgba(18,20,28,0.62)" : "rgba(12,14,20,0.48)";
        ctx.fillRect(cardX, y, cardW, cardH);
        ctx.strokeStyle = isActive ? "rgba(200,169,110,0.45)" : "rgba(240,235,225,0.12)";
        ctx.strokeRect(cardX, y, cardW, cardH);
        if (isActive) {
          ctx.fillStyle = "rgba(200,169,110,0.92)";
          ctx.fillRect(cardX + 10, y + 16, 2, cardH - 32);
        }

        ctx.fillStyle = "#C8A96E";
        ctx.font = "400 10px 'DM Mono', monospace";
        ctx.textAlign = "left";
        drawTrackedText(ctx, card.title, cardX + 26, y + 29, 1.8);

        ctx.fillStyle = "rgba(240,235,225,0.88)";
        ctx.font = "300 19px 'Fraunces', serif";
        wrapText(ctx, card.text, cardX + 26, y + 63, cardW - 52, 27);

        ctx.restore();
      });

      // Footer hint
      ctx.fillStyle = "rgba(240,235,225,0.55)";
      ctx.font = "400 12px 'DM Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText("SCORRI PER ENTRARE", SCREEN_W - 70, SCREEN_H - 44);

      ctx.textAlign = "left";
      drawScanlines();
      ctx.restore();
    };

    /* ---------- MODE A: SCROLL SHOWCASE ---------- */
    const renderSlideshow = (t: number) => {
      const s = scrollRef.current;
      const [s0, s1] = slideshowRange;
      const local = Math.max(0, Math.min(1, (s - s0) / (s1 - s0)));

      ctx.fillStyle = "#0A0A0F";
      ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

      const imgs = assets.screenshots;
      const first = imgs[0];
      const second = imgs[Math.min(1, imgs.length - 1)];

      if (local < 0.36) {
        drawCover(first, 0, 0, SCREEN_W, SCREEN_H, 1);
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
        drawScanlines();
        return;
      }

      if (local < 0.72) {
        const p = (local - 0.36) / (0.72 - 0.36);
        const cross = Math.max(0, Math.min(1, p / 0.32));
        drawCover(first, 0, 0, SCREEN_W, SCREEN_H, 1 - cross);
        drawCover(second, 0, 0, SCREEN_W, SCREEN_H, Math.max(cross, 0.001));
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
        drawScanlines();
        return;
      }

      const p = Math.max(0, Math.min(1, (local - 0.72) / 0.16));
      drawCover(second, 0, 0, SCREEN_W, SCREEN_H, 1 - p);
      drawManifesto(p, t);
    };

    /* ---------- MODE B: GALLERY ---------- */
    const PAD = 80;

    const drawProject = (
      project: Project,
      img: HTMLImageElement,
      pan: number, // 0..1 vertical scroll WITHIN the project
      alpha: number
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;

      // Background
      ctx.fillStyle = "#0A0A0F";
      ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

      // ---- Top meta bar ----
      ctx.fillStyle = "#C8A96E";
      ctx.font = "300 22px 'DM Mono', monospace";
      ctx.textBaseline = "top";
      ctx.fillText(`— PROGETTO ${project.index}`, PAD, PAD);

      ctx.fillStyle = "#9a9aa3";
      ctx.font = "300 18px 'DM Mono', monospace";
      ctx.fillText(project.category.toUpperCase(), PAD, PAD + 36);

      ctx.textAlign = "right";
      ctx.fillStyle = "#9a9aa3";
      ctx.fillText(project.year, SCREEN_W - PAD, PAD);
      ctx.fillText(project.url.replace(/^https?:\/\//, ""), SCREEN_W - PAD, PAD + 36);
      ctx.textAlign = "left";

      // ---- Giant index number (background watermark) ----
      ctx.fillStyle = "rgba(200, 169, 110, 0.06)";
      ctx.font = "600 720px 'Cormorant Garamond', serif";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(project.index, SCREEN_W / 2, SCREEN_H / 2 + 40);
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      // ---- Title (left column) ----
      const titleY = 220 + (1 - pan) * -20; // tiny parallax
      ctx.fillStyle = "#F0EBE1";
      ctx.font = "300 96px 'Cormorant Garamond', serif";
      // Wrap title at ~12 chars
      const words = project.title.split(" ");
      let line = "";
      let yy = titleY;
      const lines: string[] = [];
      for (const w of words) {
        const test = line ? line + " " + w : w;
        if (test.length > 14) {
          lines.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      lines.forEach((ln, i) => {
        ctx.fillText(ln, PAD, yy + i * 96);
      });

      // Italic gold subtitle
      ctx.fillStyle = "#C8A96E";
      ctx.font = "italic 300 36px 'Cormorant Garamond', serif";
      ctx.fillText(project.client, PAD, yy + lines.length * 96 + 16);

      // Blurb
      ctx.fillStyle = "#cfc7b8";
      ctx.font = "300 22px 'Fraunces', serif";
      const blurbY = yy + lines.length * 96 + 80;
      wrapText(ctx, project.blurb, PAD, blurbY, 560, 32);

      // Stack chips
      ctx.font = "400 14px 'DM Mono', monospace";
      ctx.fillStyle = "#9a9aa3";
      let cx = PAD;
      const cy = blurbY + 110;
      ctx.fillText("STACK", PAD, cy - 28);
      project.stack.forEach((s) => {
        const w = ctx.measureText(s).width + 28;
        ctx.strokeStyle = "rgba(200, 169, 110, 0.4)";
        ctx.lineWidth = 1;
        ctx.strokeRect(cx, cy, w, 32);
        ctx.fillStyle = "#F0EBE1";
        ctx.fillText(s, cx + 14, cy + 9);
        cx += w + 10;
      });

      // ---- Right column: device mockup with screenshot ----
      const mockX = 880;
      const mockW = 640;
      const mockH = 400;
      // Pan-driven Y so the mockup drifts up as you scroll within project
      const mockY = 240 + (pan - 0.5) * 80;

      // Mockup frame
      ctx.fillStyle = "#1a1a22";
      roundedRect(ctx, mockX - 16, mockY - 16, mockW + 32, mockH + 32, 12);
      ctx.fill();

      // Browser bar
      ctx.fillStyle = "#0e0e14";
      roundedRect(ctx, mockX, mockY, mockW, 28, 4);
      ctx.fill();
      ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(mockX + 14 + i * 18, mockY + 14, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = "#9a9aa3";
      ctx.font = "300 13px 'DM Mono', monospace";
      ctx.fillText(project.url.replace(/^https?:\/\//, ""), mockX + 80, mockY + 8);

      // Screenshot inside the mockup (pan vertically within the image)
      ctx.save();
      ctx.beginPath();
      ctx.rect(mockX, mockY + 28, mockW, mockH - 28);
      ctx.clip();
      const ir = img.width / img.height;
      const dw = mockW;
      const dh = dw / ir;
      // pan: 0 = top, 1 = bottom of image
      const maxPan = Math.max(0, dh - (mockH - 28));
      const dy = mockY + 28 - pan * maxPan;
      ctx.drawImage(img, mockX, dy, dw, dh);
      ctx.restore();

      // ---- Bottom: visit cue ----
      ctx.fillStyle = "#FF4D2E";
      ctx.font = "400 16px 'DM Mono', monospace";
      ctx.fillText("→ VISITA IL SITO LIVE", PAD, SCREEN_H - PAD - 16);

      // Scanlines overlay
      drawScanlines();

      ctx.restore();
    };

    const renderGallery = (clearBg = true) => {
      const s = scrollRef.current;
      const [g0, g1] = galleryRange;
      const local = Math.max(0, Math.min(1, (s - g0) / (g1 - g0)));
      const N = projects.length;
      const pos = local * N;
      const idx = Math.min(N - 1, Math.floor(pos));
      const within = pos - idx;

      const FADE = 0.2;
      const next = Math.min(N - 1, idx + 1);
      const fadeAlpha =
        within > 1 - FADE && next !== idx ? (within - (1 - FADE)) / FADE : 0;

      if (clearBg) {
        ctx.fillStyle = "#0A0A0F";
        ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
      }

      drawProject(projects[idx], assets.screenshots[idx], within, 1);
      if (fadeAlpha > 0) {
        drawProject(projects[next], assets.screenshots[next], 0, fadeAlpha);
      }
    };

    /* ---------- LOOP ----------
     * Il crossfade slideshow→galleria parte DOPO la schermata fullscreen
     * intermedia, così la galleria arriva in un secondo momento.
     */
    const FADE_START = 0.995;
    const FADE_END = 1;

    const render = (t: number) => {
      const s = scrollRef.current;

      const shouldRender = s < 1;
      if (!shouldRender) {
        raf = requestAnimationFrame(render);
        return;
      }

      if (t - lastRenderRef.current < FRAME_MS) {
        raf = requestAnimationFrame(render);
        return;
      }
      lastRenderRef.current = t;

      if (s <= FADE_START) {
        renderSlideshow(t);
      } else if (s >= FADE_END) {
        renderGallery(true);
      } else {
        const k = (s - FADE_START) / (FADE_END - FADE_START);
        const eased = k * k * (3 - 2 * k);
        renderSlideshow(t);
        ctx.save();
        ctx.globalAlpha = eased;
        renderGallery(false);
        ctx.restore();
      }
      texture.needsUpdate = true;
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [assets, ctx, texture, projects, scrollRef, galleryRange, slideshowRange]);

  return texture;
}

/* ---------- helpers ---------- */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxWidth) {
      ctx.fillText(line, x, yy);
      line = w;
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawTrackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number
) {
  let xx = x;
  for (const ch of text) {
    ctx.fillText(ch, xx, y);
    xx += ctx.measureText(ch).width + tracking;
  }
}
