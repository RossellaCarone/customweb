import { useEffect, useState } from "react";

export type PerfTier = "low" | "high";

export function usePerfTier(): PerfTier {
  const [tier, setTier] = useState<PerfTier>(() => detect());
  useEffect(() => {
    const onResize = () => setTier(detect());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return tier;
}

function detect(): PerfTier {
  if (typeof window === "undefined") return "high";

  const ua = navigator.userAgent || "";
  const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  const cores = (navigator as any).hardwareConcurrency ?? 4;
  const small = window.innerWidth < 900;

  // Mobile è sempre low — GPU mobile != GPU desktop anche con molti core
  if (mobile) return "low";

  // Desktop con schermo piccolo, pochi core, o poca RAM
  if (small || cores < 4) return "low";

  // deviceMemory è Chrome-only, ma utile come guard aggiuntivo
  const mem = (navigator as any).deviceMemory ?? 8;
  if (mem < 4) return "low";

  return "high";
}