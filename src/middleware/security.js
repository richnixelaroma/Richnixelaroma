function createRateLimiter({ windowMs, max, key = (req) => req.ip }) {
  const buckets = new Map();
  let requestsSinceCleanup = 0;
  return (req, res, next) => {
    const now = Date.now();
    const id = key(req);
    let bucket = buckets.get(id);
    if (!bucket || bucket.resetAt <= now) bucket = { count: 0, resetAt: now + windowMs };
    bucket.count += 1;
    buckets.set(id, bucket);
    if (++requestsSinceCleanup % 250 === 0) {
      for (const [bucketKey, value] of buckets) if (value.resetAt <= now) buckets.delete(bucketKey);
    }
    res.set('RateLimit-Limit', String(max));
    res.set('RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    if (bucket.count > max) return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
    next();
  };
}

function securityHeaders(req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  });
  if (req.secure) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}

function sameOrigin(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (!origin) return next();
  try {
    if (new URL(origin).host !== req.get('host')) return res.status(403).send('Cross-origin request rejected.');
  } catch {
    return res.status(403).send('Invalid request origin.');
  }
  next();
}

module.exports = { createRateLimiter, securityHeaders, sameOrigin };
