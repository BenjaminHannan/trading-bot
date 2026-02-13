export function thresholdProb(spot: number, threshold: number): number {
  const d = (spot - threshold) / Math.max(threshold, 1);
  const raw = 0.5 + d * 3;
  return Math.max(0.01, Math.min(0.99, raw));
}
