/**
 * Small in-memory sliding-window rate limiter for the form API routes.
 *
 * Memory is per server instance (on Vercel, per warm function), so this is a
 * first line of defence against naive spam loops, not a hard global quota.
 */
const buckets = new Map<string, number[]>();
const MAX_KEYS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the next request would be accepted (0 when allowed). */
  retryAfterSec: number;
}

export function rateLimit(key: string, limit: number, windowMs: number, now: number = Date.now()): RateLimitResult {
  const since = now - windowMs;
  const hits = (buckets.get(key) ?? []).filter((t) => t > since);

  if (hits.length >= limit) {
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000)) };
  }

  hits.push(now);
  buckets.set(key, hits);

  if (buckets.size > MAX_KEYS) {
    for (const [k, v] of buckets) {
      if (v.every((t) => t <= since)) buckets.delete(k);
    }
  }
  return { allowed: true, retryAfterSec: 0 };
}

/** Client IP as seen through the hosting proxy; "unknown" when no header is present. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

/** Per-route presets: requests per window per IP. */
export const RATE_PRESETS = {
  contact: { limit: 5, windowMs: 10 * 60 * 1000 },
  suppliers: { limit: 5, windowMs: 10 * 60 * 1000 },
  franchise: { limit: 3, windowMs: 10 * 60 * 1000 },
} as const;
