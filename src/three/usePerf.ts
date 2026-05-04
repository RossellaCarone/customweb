import { useEffect, useState } from "react";

/**
 * Cheap heuristic for adaptive quality.
 * "low" → mobile / small viewport / few cores.
 */
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
  const cores = (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency ?? 4;
  const small = window.innerWidth < 900;
  if (mobile || small || cores < 4) return "low";
  return "high";
}
