/**
 * In-memory fixed-window rate limiter for public form routes.
 *
 * Adequate for a single instance. Swap the Map for Redis/Upstash when the site
 * runs on more than one server process.
 */

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 10 * 60 * 1000 } = {},
): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);

  if (existing.count > limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds,
  };
}

/** Prevents unbounded growth on long-running servers. */
export function pruneRateLimitWindows(now = Date.now()) {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}
