import { useEffect, useState } from "react";

interface PreloaderProps {
  onComplete: () => void;
  name?: string;
}

/**
 * Cinematic preloader: gold line fills, counter ticks 0→100,
 * name reveals letter by letter, flash → fade out.
 */
export const Preloader = ({ onComplete, name = "STUDIO NOTTURNO" }: PreloaderProps) => {
  const [count, setCount] = useState(0);
  const [visibleChars, setVisibleChars] = useState(0);
  const [flashing, setFlashing] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const total = 1500;
    const start = performance.now();
    let raf = 0;

    const tick = (t: number) => {
      const elapsed = t - start;
      const p = Math.min(1, elapsed / total);
      setCount(Math.floor(p * 100));
      setVisibleChars(Math.floor(p * name.length));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setFlashing(true);
        setTimeout(() => {
          setHidden(true);
          onComplete();
        }, 450);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [name, onComplete]);

  if (hidden) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500"
      style={{ opacity: flashing ? 0 : 1 }}
      aria-hidden="true"
    >
      {/* Flash */}
      <div
        className="pointer-events-none absolute inset-0 bg-foreground transition-opacity duration-200"
        style={{ opacity: flashing ? 0.95 : 0 }}
      />

      <div className="relative flex flex-col items-center gap-10 px-6">
        {/* Counter */}
        <div className="flex items-baseline gap-3 font-mono text-xs tracking-mono-xwide text-muted-foreground">
          <span className="text-gold">[</span>
          <span className="tabular-nums text-foreground">{String(count).padStart(3, "0")}</span>
          <span className="text-gold">]</span>
        </div>

        {/* Gold line */}
        <div className="relative h-px w-[260px] overflow-hidden bg-border">
          <div
            className="absolute inset-y-0 left-0 origin-left bg-gold"
            style={{
              width: "100%",
              transform: `scaleX(${count / 100})`,
              transition: "transform 80ms linear",
              boxShadow: "0 0 12px hsl(var(--gold) / 0.6)",
            }}
          />
        </div>

        {/* Name */}
        <div className="font-mono text-[11px] tracking-mono-xwide text-foreground/90 sm:text-sm">
          {name.split("").map((c, i) => (
            <span
              key={i}
              style={{
                opacity: i < visibleChars ? 1 : 0,
                transition: "opacity 200ms ease-out",
              }}
            >
              {c === " " ? "\u00A0\u00A0" : c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
