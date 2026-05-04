import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mapRange } from "@/utils/mapRange";
import { projects, type Project } from "@/data/projects";

interface MonolithsProps {
  scrollRef: React.MutableRefObject<number>;
  /** Scroll window in which the project sequence is the focus. */
  range: [number, number];
}

const STAGE_Z = -18;
const STAGE_Y = 1.6;
const FRONT_Z = 0;
const MONOLITH_SPACING = 8.4;
const VIDEO_PANEL_WIDTH = 3.0;
const VIDEO_PANEL_HEIGHT = VIDEO_PANEL_WIDTH / (16 / 10);

/**
 * Project monoliths arranged on a depth track inside the scene.
 * As the user scrolls through `range`, the whole track advances so the
 * projects arrive one after the other instead of orbiting around the camera.
 *
 * Each monolith has a video reel (right) and a procedural info canvas (left).
 */
export const ProjectMonoliths = ({ scrollRef, range }: MonolithsProps) => {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const s = scrollRef.current;
    if (!group.current) return;

    const buffer = 0.04;
    group.current.visible = s >= range[0] - buffer && s <= range[1] + buffer;
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, STAGE_Z, 0.08);
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, 0, 0.08);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, 0, 0.08);
  });

  return (
    <group ref={group} position={[0, STAGE_Y, STAGE_Z]}>
      {projects.map((p, i) => (
        <Monolith key={p.id} project={p} index={i} scrollRef={scrollRef} range={range} />
      ))}

      <pointLight
        position={[0, 0, FRONT_Z - 1.2]}
        color="#C8A96E"
        intensity={6}
        distance={14}
        decay={2}
      />
    </group>
  );
};

/* -------------------------------------------------------------------------- */

const Monolith = ({
  project,
  index,
  scrollRef,
  range,
}: {
  project: Project;
  index: number;
  scrollRef: React.MutableRefObject<number>;
  range: [number, number];
}) => {
  const root = useRef<THREE.Group>(null);
  const videoEl = useRef<HTMLVideoElement | null>(null);
  const videoTex = useRef<THREE.VideoTexture | null>(null);
  const shell = useRef<THREE.Group>(null);
  const x = 0;
  const z = FRONT_Z - index * MONOLITH_SPACING;

  // ----- Info canvas texture (left panel) -----
  const infoTexture = useMemo(() => {
    const w = 1024;
    const h = 1536;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#0c0c14");
    bg.addColorStop(1, "#070710");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // gold radial glow
    const glow = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, w);
    glow.addColorStop(0, "rgba(200,169,110,0.18)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    const PAD = 80;
    let y = 140;

    // title (wrap)
    ctx.fillStyle = "#F0EBE1";
    ctx.font = "300 130px 'Cormorant Garamond', serif";
    const titleWords = project.title.split(" ");
    let line = "";
    for (const word of titleWords) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > w - PAD * 2 && line) {
        ctx.fillText(line, PAD, y);
        y += 130;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, PAD, y);
      y += 130;
    }

    // client italic
    ctx.fillStyle = "#C8A96E";
    ctx.font = "italic 300 44px 'Cormorant Garamond', serif";
    ctx.fillText(project.client, PAD, y + 20);
    y += 110;

    // category
    ctx.fillStyle = "#9a9aa3";
    ctx.font = "300 24px 'DM Mono', monospace";
    ctx.fillText(project.category.toUpperCase(), PAD, y);
    y += 60;

    // divider
    ctx.fillStyle = "#2a2a3a";
    ctx.fillRect(PAD, y, w - PAD * 2, 1);
    y += 50;

    // blurb
    ctx.fillStyle = "#cfc7b8";
    ctx.font = "300 32px 'Fraunces', serif";
    wrapText(ctx, project.blurb, PAD, y, w - PAD * 2, 46);
    y += Math.ceil(estimateLines(ctx, project.blurb, w - PAD * 2)) * 46 + 50;

    // highlights
    ctx.fillStyle = "#cfc7b8";
    ctx.font = "300 30px 'Fraunces', serif";
    project.highlights.forEach((hl) => {
      ctx.fillStyle = "#C8A96E";
      ctx.fillText("·", PAD, y);
      ctx.fillStyle = "#cfc7b8";
      const lines = wrapText(ctx, hl, PAD + 34, y, w - PAD * 2 - 34, 42);
      y += Math.max(42, lines * 42) + 18;
    });

    y += 20;

    // stack chips
    ctx.fillStyle = "#C8A96E";
    ctx.font = "300 22px 'DM Mono', monospace";
    let cx = PAD;
    project.stack.forEach((tag) => {
      const tw = ctx.measureText(tag).width + 30;
      ctx.strokeStyle = "rgba(200,169,110,0.5)";
      ctx.strokeRect(cx, y, tw, 40);
      ctx.fillText(tag, cx + 15, y + 27);
      cx += tw + 14;
    });

    // url at bottom
    ctx.fillStyle = "#FF4D2E";
    ctx.font = "400 24px 'DM Mono', monospace";
    ctx.fillText(`→ ${project.url.replace(/^https?:\/\//, "")}`, PAD, h - 80);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, [project]);

  // ----- Video texture (right panel) -----
  const videoTexture = useMemo(() => {
    if (!project.video && !project.videoWebm) return null;
    const v = document.createElement("video");
    videoEl.current = v;
    const canPlayWebm =
      !!project.videoWebm && v.canPlayType("video/webm; codecs=vp9").replace(/no/i, "") !== "";
    const source = canPlayWebm ? project.videoWebm : (project.video ?? project.videoWebm);

    if (!source) return null;

    v.loop = true;
    v.muted = true;
    v.defaultMuted = true;
    v.preload = "auto";
    v.playsInline = true;
    v.crossOrigin = "anonymous";
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "true");
    v.setAttribute("webkit-playsinline", "true");
    v.autoplay = true;
    v.playbackRate = 1;
    v.src = source;
    v.load();

    v.play().catch(() => {});
    const tex = new THREE.VideoTexture(v);
    videoTex.current = tex;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [project.video, project.videoWebm]);

  useEffect(() => {
    const v = videoEl.current;
    if (!v) return;

    let frame = 0;
    let retries = 0;
    const ensurePlaying = () => {
      if (v.paused && retries < 180) {
        retries += 1;
        v.play().catch(() => {});
        frame = requestAnimationFrame(ensurePlaying);
      }
    };

    const onCanPlay = () => {
      v.play().catch(() => {});
    };

    v.addEventListener("canplay", onCanPlay);
    ensurePlaying();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      v.removeEventListener("canplay", onCanPlay);
      if (videoEl.current) {
        videoEl.current.pause();
        videoEl.current.removeAttribute("src");
        videoEl.current.load();
        videoEl.current = null;
      }
      if (videoTex.current) {
        videoTex.current.dispose();
        videoTex.current = null;
      }
    };
  }, [videoTexture]);

  // Fallback screenshot texture
  const screenshotTexture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(project.screenshot);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [project]);

  // gentle hover bob
  useFrame(({ clock }) => {
    if (!root.current || !shell.current) return;
    const t = clock.getElapsedTime();
    root.current.position.y = Math.sin(t * 0.5 + index * 0.75) * 0.06;

    const local = mapRange(scrollRef.current, range[0], range[1], 0, 1);
    const activeIndex = local < 0.62 ? 0 : 1;
    const isActive = activeIndex === index;
    shell.current.visible = isActive;
    shell.current.scale.setScalar(isActive ? 1 : 0.96);
  });

  return (
    <group position={[x, 0, z]}>
      <group ref={shell}>
        <group ref={root}>
          {/* INFO PANEL (left) */}
          <mesh position={[-1.85, 0, 0]}>
            <planeGeometry args={[3.0, 4.5]} />
            <meshBasicMaterial map={infoTexture} toneMapped={false} />
          </mesh>
          {/* gold edge */}
          <mesh position={[-3.36, 0, 0.001]}>
            <planeGeometry args={[0.02, 4.5]} />
            <meshBasicMaterial color="#C8A96E" toneMapped={false} />
          </mesh>

          {/* VIDEO PANEL (right) */}
          <group position={[1.85, 0, 0]}>
            {/* laptop-like body */}
            <mesh position={[0, 0, -0.028]}>
              <boxGeometry args={[VIDEO_PANEL_WIDTH + 0.24, VIDEO_PANEL_HEIGHT + 0.24, 0.08]} />
              <meshStandardMaterial color="#9a9aa3" metalness={0.82} roughness={0.35} />
            </mesh>
            {/* dark bezel strips */}
            <mesh position={[0, VIDEO_PANEL_HEIGHT * 0.5 + 0.03, 0.01]}>
              <boxGeometry args={[VIDEO_PANEL_WIDTH + 0.12, 0.06, 0.012]} />
              <meshStandardMaterial color="#050507" metalness={0.18} roughness={0.74} />
            </mesh>
            <mesh position={[0, -VIDEO_PANEL_HEIGHT * 0.5 - 0.03, 0.01]}>
              <boxGeometry args={[VIDEO_PANEL_WIDTH + 0.12, 0.06, 0.012]} />
              <meshStandardMaterial color="#050507" metalness={0.18} roughness={0.74} />
            </mesh>
            <mesh position={[-VIDEO_PANEL_WIDTH * 0.5 - 0.03, 0, 0.01]}>
              <boxGeometry args={[0.06, VIDEO_PANEL_HEIGHT + 0.12, 0.012]} />
              <meshStandardMaterial color="#050507" metalness={0.18} roughness={0.74} />
            </mesh>
            <mesh position={[VIDEO_PANEL_WIDTH * 0.5 + 0.03, 0, 0.01]}>
              <boxGeometry args={[0.06, VIDEO_PANEL_HEIGHT + 0.12, 0.012]} />
              <meshStandardMaterial color="#050507" metalness={0.18} roughness={0.74} />
            </mesh>
            {/* webcam dot */}
            <mesh position={[0, VIDEO_PANEL_HEIGHT * 0.5 + 0.03, 0.017]}>
              <circleGeometry args={[0.014, 16]} />
              <meshStandardMaterial color="#000000" roughness={0.9} metalness={0.05} />
            </mesh>

            <mesh position={[0, 0, 0.02]}>
              <planeGeometry args={[VIDEO_PANEL_WIDTH, VIDEO_PANEL_HEIGHT]} />
              <meshBasicMaterial map={videoTexture ?? screenshotTexture} toneMapped={false} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

/* -------------------------------------------------------------------------- */

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
  let lines = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lines++;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, y);
    lines++;
  }
  return lines;
}

function estimateLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ");
  let line = "";
  let lines = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines++;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines++;
  return lines;
}
