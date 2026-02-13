export const nowMs = (): number => Date.now();
export const isExpired = (createdAtMs: number, ttlSec: number, now = nowMs()): boolean => now > createdAtMs + ttlSec * 1000;
