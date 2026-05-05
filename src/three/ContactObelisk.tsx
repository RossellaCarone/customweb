import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, invalidate } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
interface ContactObeliskProps {
  scrollRef: React.MutableRefObject<number>;
  range: [number, number];
}

const STAGE_Z = -34.8;
const STAGE_Y = 1.3;

// Canvas dimensions
const CW = 1024;
const CH = 2048;

// Field hit areas in canvas coords [x, y, w, h]
const FIELDS = {
  nome:    { x: 80, y: 880,  w: 864, h: 64 },
  email:   { x: 80, y: 1010, w: 864, h: 64 },
  message: { x: 80, y: 1140, w: 864, h: 160 },
  submit:  { x: 80, y: 1360, w: 864, h: 72 },
};

type FieldKey = keyof typeof FIELDS;

interface FormState {
  nome: string;
  email: string;
  message: string;
  active: FieldKey | null;
  status: "idle" | "submitting" | "success" | "error";
  errors: Partial<Record<FieldKey | "submit", string>>;
}

/**
 * Draws the full contact panel onto a canvas and returns a live CanvasTexture.
 * Interaction is handled via raycasting on the plane mesh.
 */
function drawPanel(
  ctx: CanvasRenderingContext2D,
  form: FormState,
) {
  const w = CW, h = CH;

  // clear canvas (transparent background)
  ctx.clearRect(0, 0, w, h);

  ctx.textAlign = "center";

  // eyebrow
  ctx.fillStyle = "#C8A96E";
  ctx.font = "300 32px 'DM Mono', monospace";
  ctx.fillText("— PARLIAMONE", w / 2, 160);

  // headline
  ctx.fillStyle = "#F0EBE1";
  ctx.font = "300 130px 'Cormorant Garamond', serif";
  ctx.fillText("Hai un progetto", w / 2, 420);
  ctx.fillStyle = "#C8A96E";
  ctx.font = "italic 300 130px 'Cormorant Garamond', serif";
  ctx.fillText("in mente?", w / 2, 590);

  // subline
  ctx.fillStyle = "#e7dfd1";
  ctx.font = "300 42px 'Fraunces', serif";
  ctx.fillText("Racconta la tua idea", w / 2, 720);

  if (form.status === "success") {
    // success state
    ctx.fillStyle = "#C8A96E";
    ctx.font = "300 80px 'Cormorant Garamond', serif";
    ctx.fillText("✓", w / 2, 900);
    ctx.font = "300 36px 'DM Mono', monospace";
    ctx.fillText("MESSAGGIO INVIATO", w / 2, 1020);
    ctx.fillStyle = "#9a9aa3";
    ctx.font = "300 28px 'DM Mono', monospace";
    ctx.fillText("Ti risponderemo al più presto", w / 2, 1100);
    return;
  }

  // ── form fields ──
  ctx.textAlign = "left";

  const drawField = (
    key: FieldKey,
    label: string,
    value: string,
    multiline = false,
    placeholder = "",
  ) => {
    const f = FIELDS[key];
    const isActive = form.active === key;
    const hasError = !!form.errors[key];

    // label
    ctx.fillStyle = isActive ? "#C8A96E" : hasError ? "#e05555" : "#9a9aa3";
    ctx.font = "300 24px 'DM Mono', monospace";
    ctx.fillText(label, f.x, f.y - 12);

    // error message inline
    if (hasError) {
      ctx.fillStyle = "#e05555";
      ctx.font = "300 22px 'DM Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText(form.errors[key]!, f.x + f.w, f.y - 12);
      ctx.textAlign = "left";
    }

    // underline / border
    ctx.strokeStyle = isActive
      ? "#C8A96E"
      : hasError ? "rgba(224,85,85,0.7)" : "rgba(200,169,110,0.35)";
    ctx.lineWidth = isActive ? 1.5 : 1;
    if (multiline) {
      ctx.strokeRect(f.x, f.y, f.w, f.h);
    } else {
      ctx.beginPath();
      ctx.moveTo(f.x, f.y + f.h);
      ctx.lineTo(f.x + f.w, f.y + f.h);
      ctx.stroke();
    }

    // value text or placeholder
    ctx.font = "300 32px 'DM Mono', monospace";
    if (!value && placeholder) {
      ctx.fillStyle = "rgba(154,154,163,0.45)";
      if (multiline) {
        ctx.fillText(placeholder, f.x + 12, f.y + 38);
      } else {
        ctx.fillText(placeholder, f.x + 4, f.y + f.h - 14);
      }
    } else {
      ctx.fillStyle = "#F0EBE1";
    if (multiline) {
      // wrap inside box
      const lines: string[] = [];
      const words = value.split(" ");
      let line = "";
      for (const word of words) {
        const test = line ? line + " " + word : word;
        if (ctx.measureText(test).width > f.w - 24 && line) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      lines.forEach((ln, i) => ctx.fillText(ln, f.x + 12, f.y + 38 + i * 44));
    } else {
      // clip to field width
      ctx.save();
      ctx.rect(f.x, f.y, f.w, f.h + 4);
      ctx.clip();
      ctx.fillText(value, f.x + 4, f.y + f.h - 14);
      ctx.restore();
    }
    } // end value/placeholder else

    // cursor blink — always show when active (blink handled by redraw)
    if (isActive) {
      ctx.fillStyle = "#C8A96E";
      if (multiline) {
        const approxX = f.x + 12 + ctx.measureText(value.split(" ").at(-1) ?? "").width + 2;
        const approxY = f.y + 38 + Math.max(0, Math.floor(value.length / 28)) * 44;
        ctx.fillRect(approxX, approxY - 28, 2, 36);
      } else {
        const cx = f.x + 4 + ctx.measureText(value).width + 2;
        ctx.fillRect(cx, f.y + 8, 2, f.h - 20);
      }
    }
  };

  drawField("nome",    "NOME",      form.nome,    false, "Il tuo nome...");
  drawField("email",   "EMAIL",     form.email,   false, "La tua email...");
  drawField("message", "MESSAGGIO", form.message, true,  "Descrivi il tuo progetto...");

  // submit button
  const sb = FIELDS.submit;
  const isSubmitting = form.status === "submitting";
  const isError = form.status === "error";
  ctx.fillStyle = isSubmitting ? "rgba(200,169,110,0.3)" : isError ? "rgba(224,85,85,0.12)" : "rgba(200,169,110,0.08)";
  ctx.fillRect(sb.x, sb.y, sb.w, sb.h);
  ctx.strokeStyle = isError ? "#e05555" : "#C8A96E";
  ctx.lineWidth = 1;
  ctx.strokeRect(sb.x, sb.y, sb.w, sb.h);
  ctx.fillStyle = isSubmitting ? "#9a9aa3" : isError ? "#e05555" : "#C8A96E";
  ctx.font = "300 28px 'DM Mono', monospace";
  ctx.textAlign = "center";
  const submitLabel = isSubmitting ? "INVIO IN CORSO..." : isError ? "ERRORE — RIPROVA" : "INVIA →";
  ctx.fillText(submitLabel, w / 2, sb.y + 46);

  // network error detail
  if (form.errors.submit) {
    ctx.fillStyle = "#e05555";
    ctx.font = "300 22px 'DM Mono', monospace";
    ctx.fillText(form.errors.submit, w / 2, sb.y + sb.h + 30);
  }

  // footer
  ctx.fillStyle = "#3a3a4a";
  ctx.font = "300 20px 'DM Mono', monospace";
  ctx.fillText("© 2026 · CUSTOM WEB", w / 2, CH - 80);
}

export const ContactObelisk = ({ scrollRef, range }: ContactObeliskProps) => {
  const group = useRef<THREE.Group>(null);
  const { gl } = useThree();

  // keep canvas cursor as pointer when over the mesh
  useEffect(() => {
    gl.domElement.style.cursor = "default";
  }, [gl]);

  const formRef = useRef<FormState>({
    nome: "", email: "", message: "",
    active: null, status: "idle", errors: {},
  });
  const dirtyRef = useRef(true);

  // Create fixed, invisible native inputs so mobile keyboards can be invoked reliably
  useEffect(() => {
    const container = document.createElement("div");
    // anchor near bottom so mobile browsers consider the input 'in view'
    container.style.position = "fixed";
    container.style.left = "0";
    container.style.right = "0";
    container.style.bottom = "0";
    container.style.height = "1px";
    container.style.overflow = "hidden";
    container.style.opacity = "0";
    container.style.pointerEvents = "auto";
    container.style.zIndex = "9999";
    container.innerHTML = `
      <input id="cw-nome" tabindex="0" inputmode="text" autocomplete="name" style="width:100px;height:24px;" />
      <input id="cw-email" tabindex="0" inputmode="email" type="text" autocomplete="email" style="width:100px;height:24px;" />
      <textarea id="cw-message" tabindex="0" inputmode="text" style="width:200px;height:48px;"></textarea>
    `;
    document.body.appendChild(container);

    return () => { if (container.parentElement) container.parentElement.removeChild(container); };
  }, []);

  // helper to check whether selection can be set on an element
  const canSetSelection = (el: Element | null): el is HTMLInputElement | HTMLTextAreaElement => {
    if (!el) return false;
    if (el.tagName === "TEXTAREA") return true;
    if (el.tagName !== "INPUT") return false;
    const input = el as HTMLInputElement;
    // Only these input types reliably support setSelectionRange
    return ["text", "search", "tel", "url", "password"].includes(input.type);
  };

  // Canvas + texture
  const { ctx, texture } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = CW;
    canvas.height = CH;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return { ctx, texture };
  }, []);

  const redraw = () => { dirtyRef.current = true; invalidate(); };

  // Redraw on first mount only — subsequent redraws triggered by dirtyRef
  useEffect(() => {
    drawPanel(ctx, formRef.current);
    texture.needsUpdate = true;
  }, [ctx, texture]);  // Keyboard input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const f = formRef.current;
      if (!f.active || f.status !== "idle") return;
      if (e.key === "Backspace") {
        formRef.current = { ...f, [f.active]: (f[f.active] as string).slice(0, -1) };
      } else if (e.key === "Tab") {
        e.preventDefault();
        const keys: FieldKey[] = ["nome", "email", "message"];
        const i = keys.indexOf(f.active as FieldKey);
        formRef.current = { ...f, active: keys[(i + 1) % keys.length] };
      } else if (e.key.length === 1) {
        formRef.current = { ...f, [f.active]: (f[f.active] as string) + e.key };
      }
      redraw();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Raycasting handled via onPointerDown on the mesh (see JSX below)


  const handleSubmit = async () => {
    const f = formRef.current;

    // Validazione
    const errors: FormState["errors"] = {};
    if (!f.nome.trim()) errors.nome = "obbligatorio";
    if (!f.email.trim()) errors.email = "obbligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) errors.email = "email non valida";
    if (!f.message.trim()) errors.message = "obbligatorio";
    if (Object.keys(errors).length > 0) {
      formRef.current = { ...f, errors };
      redraw();
      return;
    }

    formRef.current = { ...f, status: "submitting", active: null, errors: {} };
    redraw();

    try {
      const res = await fetch("https://formspree.io/f/mwvyvpqw", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ nome: f.nome, email: f.email, message: f.message }),
      });
      if (res.ok) {
        formRef.current = { nome: "", email: "", message: "", active: null, status: "success", errors: {} };
        redraw();
        setTimeout(() => {
          formRef.current = { nome: "", email: "", message: "", active: null, status: "idle", errors: {} };
          redraw();
        }, 3500);
      } else {
        formRef.current = { ...formRef.current, status: "error", errors: { submit: `Errore ${res.status} — controlla la connessione` } };
        redraw();
      }
    } catch {
      formRef.current = { ...formRef.current, status: "error", errors: { submit: "Nessuna connessione — riprova" } };
      redraw();
    }
  };

  // Visibility / fade + lazy canvas redraw
  useFrame(() => {
    // redraw only when dirty
    if (dirtyRef.current) {
      drawPanel(ctx, formRef.current);
      texture.needsUpdate = true;
      dirtyRef.current = false;
    }

    const s = scrollRef.current;
    const local = Math.max(0, Math.min(1, (s - range[0]) / (range[1] - range[0])));
    const fadeIn = Math.max(0, Math.min(1, (local - 0.01) / 0.12));
    const fadeOut = Math.max(0, Math.min(1, (1 - local) / 0.08));
    const visibility = fadeIn * (1 - (1 - fadeOut) * 0.08);

    if (group.current) {
      group.current.visible = visibility > 0.01;
      group.current.position.y = STAGE_Y + (1 - local) * -0.4;
      group.current.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        const mat = mesh.material;
        if (!mat) return;
        if (Array.isArray(mat)) { mat.forEach(m => applyOpacity(m, visibility)); return; }
        applyOpacity(mat, visibility);
      });
    }
  });

  return (
    <group ref={group} position={[0, STAGE_Y, STAGE_Z]}>
      {/* the obelisk slab */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.2, 6.4, 0.25]} />
        <meshStandardMaterial color="#0a0a10" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* interactive face */}
      <mesh
        position={[0, 0, 0.13]}
        onPointerDown={(e) => {
          e.stopPropagation();
          try { e.preventDefault(); } catch {}
          if (!e.uv) return;
          const cx = e.uv.x * CW;
          const cy = (1 - e.uv.y) * CH;
          const f = formRef.current;
          if (f.status === "submitting") return;
          for (const [key, rect] of Object.entries(FIELDS) as [FieldKey, typeof FIELDS[FieldKey]][]) {
            if (cx >= rect.x && cx <= rect.x + rect.w && cy >= rect.y && cy <= rect.y + rect.h) {
              if (key === "submit") {
                handleSubmit();
              } else {
                formRef.current = { ...f, active: key };
                // focus corresponding native input to open mobile keyboard
                try {
                  const el = document.getElementById(`cw-${key}`) as HTMLInputElement | HTMLTextAreaElement | null;
                  if (el) {
                    el.focus();
                    const v = el.value || "";
                    setTimeout(() => {
                      try {
                        if (canSetSelection(el)) el.setSelectionRange(v.length, v.length);
                      } catch {}
                    }, 150);
                  }
                } catch {}
                redraw();
              }
              return;
            }
          }
          formRef.current = { ...f, active: null };
          redraw();
        }}
        onPointerUp={(e) => { e.stopPropagation(); try { e.preventDefault(); } catch {} }}
        onPointerOver={() => { gl.domElement.style.cursor = "text"; }}
        onPointerOut={() => { gl.domElement.style.cursor = "default"; }}
      >
        <planeGeometry args={[3.0, 6.2]} />
        <meshBasicMaterial map={texture} toneMapped={false} transparent alphaTest={0} />
      </mesh>

      {/* warm rim light */}
      <pointLight position={[0, 1, 1.5]} color="#FFD9A8" intensity={4.2} distance={8} decay={2} />

      {/* studio mark */}
      <Text position={[0, 4.3, 0.2]} fontSize={0.16} color="#9a9aa3" anchorX="center" anchorY="middle">
        CUSTOM · WEB
      </Text>
    </group>
  );
};

function applyOpacity(material: THREE.Material, alpha: number) {
  if ((material.userData.baseOpacity as number | undefined) === undefined) {
    material.userData.baseOpacity = material.opacity;
  }
  if ((material.userData.baseDepthWrite as boolean | undefined) === undefined) {
    material.userData.baseDepthWrite = material.depthWrite;
  }
  const baseOpacity = material.userData.baseOpacity as number;
  const baseDepthWrite = material.userData.baseDepthWrite as boolean;
  material.transparent = alpha < 0.999 || material.transparent;
  material.opacity = baseOpacity * alpha;
  material.depthWrite = alpha > 0.2 ? baseDepthWrite : false;
}
