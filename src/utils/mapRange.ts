/**
 * Map a value from one numeric range to another, optionally clamped.
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  clamp = true
) {
  const t = (value - inMin) / (inMax - inMin);
  const v = outMin + t * (outMax - outMin);
  if (!clamp) return v;
  const lo = Math.min(outMin, outMax);
  const hi = Math.max(outMin, outMax);
  return Math.min(hi, Math.max(lo, v));
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
