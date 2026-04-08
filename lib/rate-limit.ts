/**
 * Simple in-memory rate limiter for login endpoints.
 * Limits attempts per IP within a sliding window.
 */

const store = new Map<string, { count: number; resetAt: number }>()

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of store) {
    if (now > val.resetAt) store.delete(key)
  }
}, 5 * 60_000)

/**
 * Returns `true` if the request is allowed, `false` if rate-limited.
 * @param key      Unique key (typically client IP)
 * @param max      Max attempts within the window (default 10)
 * @param windowMs Window duration in ms (default 60 s)
 */
export function rateLimit(key: string, max = 10, windowMs = 60_000): boolean {
  const now = Date.now()
  const record = store.get(key)

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= max) return false

  record.count++
  return true
}
