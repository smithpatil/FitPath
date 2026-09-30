// A tiny "no more than N per window" limiter, kept in memory.
// On Vercel each server instance has its own memory, so this is a best-effort guard that
// mainly protects the free API quota from one person clicking very fast.

export function createLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return {
    /** Returns true if this request is allowed (and records it). */
    allow(key: string, now: number = Date.now()): boolean {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now);
      hits.set(key, recent);
      return true;
    },
  };
}
