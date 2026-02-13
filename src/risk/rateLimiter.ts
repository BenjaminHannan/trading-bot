export class SlidingWindowRateLimiter {
  private events: number[] = [];
  constructor(private readonly maxPerMinute: number) {}

  allow(now = Date.now()): boolean {
    const cutoff = now - 60_000;
    this.events = this.events.filter((ts) => ts >= cutoff);
    if (this.events.length >= this.maxPerMinute) return false;
    this.events.push(now);
    return true;
  }
}
