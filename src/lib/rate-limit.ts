/**
 * Simple in-memory sliding-window rate limiter for a single server instance.
 * For a multi-instance production deployment, replace with a shared store (e.g. Redis).
 */

const buckets = new Map<string, number[]>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  buckets.set(key, timestamps);
  return timestamps.length > limit;
}
