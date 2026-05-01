import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Project } from "@/data/projects";

const SCREEN_W = 1600;
const SCREEN_H = 1000;

interface ScreenTextureOptions {
  projects: Project[];
  /** Ref to global scroll progress 0..1 */
  scrollRef: React.MutableRefObject<number>;
  /** Scroll range where slideshow plays (laptop opening) */
  slideshowRange: [number, number];
  /** Scroll range where gallery plays (immersive) */
  galleryRange: [number, number];
  intervalMs?: number;
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
  intervalMs = 4200,
}: ScreenTextureOptions) {
  const [assets, setAssets] = useState<LoadedAssets | null>(null);
  const slideshowIdxRef = useRef(0);
  const lastSwapRef = useRef(performance.now());

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

    /* ---------- MODE A: SLIDESHOW ---------- */
    const renderSlideshow = (t: number) => {
      const elapsed = t - lastSwapRef.current;
      const fade = Math.min(1, elapsed / 700);

      ctx.fillStyle = "#0A0A0F";
      ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

      const imgs = assets.screenshots;
      const cur = imgs[slideshowIdxRef.current % imgs.length];
      const prev = imgs[(slideshowIdxRef.current - 1 + imgs.length) % imgs.length];

      if (fade < 1 && prev !== cur) drawCover(prev, 0, 0, SCREEN_W, SCREEN_H, 1 - fade);
      drawCover(cur, 0, 0, SCREEN_W, SCREEN_H, fade);

      drawScanlines();

      if (elapsed > intervalMs) {
        slideshowIdxRef.current = (slideshowIdxRef.current + 1) % imgs.length;
        lastSwapRef.current = t;
      }
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
     * Long crossfade window between slideshow and gallery so the
     * content swap feels like a slow dissolve, not a cut.
     * The window is anchored just before galleryRange[0] and ends
     * shortly after, giving ~14% of scroll for the blend.
     */
    const FADE_BEFORE = 0.06; // start fading IN gallery this much before g0
    const FADE_AFTER = 0.08;  // finish fading OUT slideshow this much after g0

    const render = (t: number) => {
      const s = scrollRef.current;
      const g0 = galleryRange[0];
      const fadeStart = g0 - FADE_BEFORE;
      const fadeEnd = g0 + FADE_AFTER;

      if (s <= fadeStart) {
        renderSlideshow(t);
      } else if (s >= fadeEnd) {
        renderGallery(true);
      } else {
        const k = (s - fadeStart) / (fadeEnd - fadeStart);
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
  }, [assets, ctx, texture, intervalMs, projects, scrollRef, galleryRange, slideshowRange]);

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
