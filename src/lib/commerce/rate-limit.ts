/**
 * Simple fixed-window rate limiter (single Node process).
 * Not suitable as a distributed control — document for multi-instance later.
 */
type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function takeRateLimit(opts: {
  key: string
  limit: number
  windowMs: number
}): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now()
  const existing = buckets.get(opts.key)
  if (!existing || existing.resetAt <= now) {
    buckets.set(opts.key, { count: 1, resetAt: now + opts.windowMs })
    return { ok: true }
  }
  if (existing.count >= opts.limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }
  existing.count += 1
  return { ok: true }
}
