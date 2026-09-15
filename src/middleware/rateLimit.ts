import { Request, Response, NextFunction } from 'express';

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  /** Label used in log lines so a 429 can be traced back to its route. */
  name: string;
  /** Requests allowed per window, per client IP. */
  max: number;
  /** Window length in milliseconds. Defaults to one minute. */
  windowMs?: number;
}

/**
 * Small dependency-free per-IP rate limiter.
 *
 * Counters live in memory on purpose: the app runs as a single instance, so
 * there is no shared store to synchronize against. If it is ever scaled to
 * several instances, each keeps its own counters and the effective limit
 * becomes `max * instanceCount`.
 *
 * Reads `req.ip`, which is only the real client when `app.set("trust proxy", 1)`
 * is set — see server.ts. Behind the proxy an unset trust setting collapses
 * every caller into a single bucket.
 */
export const rateLimit = ({ name, max, windowMs = 60_000 }: RateLimitOptions) => {
  const buckets = new Map<string, Bucket>();

  // Drop expired buckets so the map cannot grow without bound.
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, windowMs);
  // Never hold the process open on account of the sweeper.
  sweep.unref?.();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (bucket.count >= max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      console.warn(`[rate-limit] ${name}: ${key} exceeded ${max} requests per ${windowMs}ms`);
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.status(429).json({
        error: `Too many requests. Please try again in ${retryAfterSeconds}s.`,
        retryAfterSeconds,
      });
      return;
    }

    bucket.count += 1;
    next();
  };
};
