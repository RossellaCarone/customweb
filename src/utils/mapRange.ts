/**
 * mapRange — maps a value from one range to another, clamped.
 * e.g. mapRange(scrollProgress, 0.15, 0.40, 0, -1.92)
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const clamped = Math.min(Math.max(value, inMin), inMax);
  return ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}
