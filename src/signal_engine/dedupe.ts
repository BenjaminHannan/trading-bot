export class SignalDedupe {
  private seen = new Map<string, number>();

  shouldEmit(key: string, nowMs: number, ttlMs: number): boolean {
    const prev = this.seen.get(key);
    if (prev && nowMs - prev < ttlMs) return false;
    this.seen.set(key, nowMs);
    if (this.seen.size > 5000) {
      const cutoff = nowMs - ttlMs * 2;
      for (const [k, v] of this.seen.entries()) if (v < cutoff) this.seen.delete(k);
    }
    return true;
  }
}
