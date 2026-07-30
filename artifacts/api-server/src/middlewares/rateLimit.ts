import type { NextFunction, Request, Response } from "express";

type Bucket = { count: number; windowStart: number };

/**
 * Minimal in-memory fixed-window per-IP rate limiter.
 *
 * Suitable for a single-process server. State resets on restart, which is
 * fine for abuse throttling — the goal is stopping floods, not accounting.
 */
export function rateLimit(opts: { windowMs: number; max: number }) {
  const buckets = new Map<string, Bucket>();

  // Periodically drop stale buckets so the map doesn't grow unbounded.
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now - bucket.windowStart > opts.windowMs) buckets.delete(key);
    }
  }, opts.windowMs);
  sweep.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const now = Date.now();
    const bucket = buckets.get(ip);

    if (!bucket || now - bucket.windowStart > opts.windowMs) {
      buckets.set(ip, { count: 1, windowStart: now });
      next();
      return;
    }

    bucket.count += 1;
    if (bucket.count > opts.max) {
      const retryAfterSec = Math.max(
        1,
        Math.ceil((bucket.windowStart + opts.windowMs - now) / 1000),
      );
      res.setHeader("Retry-After", String(retryAfterSec));
      req.log.warn({ ip, count: bucket.count }, "rate limit exceeded");
      res
        .status(429)
        .json({ message: "Too many requests — wait a moment and try again." });
      return;
    }

    next();
  };
}
