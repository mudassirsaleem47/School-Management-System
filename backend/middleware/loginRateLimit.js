const WINDOW_MS = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const MAX_ATTEMPTS = Number(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS || 10);

// In-memory tracker for failed login attempts per IP + route key.
// Good first line of defense; use Redis-backed limiter for multi-instance deployments.
const attempts = new Map();

const getClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
        return forwarded.split(',')[0].trim();
    }
    return req.ip || req.connection?.remoteAddress || 'unknown';
};

const cleanupEntryIfExpired = (entry, now) => {
    if (!entry) return null;
    if (now - entry.firstAttemptAt > WINDOW_MS) return null;
    return entry;
};

const loginRateLimit = (req, res, next) => {
    const now = Date.now();
    const key = `${getClientIp(req)}:${req.path}`;

    const current = cleanupEntryIfExpired(attempts.get(key), now) || {
        count: 0,
        firstAttemptAt: now,
    };

    if (current.count >= MAX_ATTEMPTS) {
        const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - current.firstAttemptAt)) / 1000);
        return res.status(429).json({
            message: 'Too many login attempts. Please try again later.',
            retryAfter: Math.max(retryAfterSeconds, 1),
        });
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
        // Count only likely failed login responses.
        if (res.statusCode >= 400 && res.statusCode < 500) {
            current.count += 1;
            attempts.set(key, current);
        } else if (res.statusCode < 400) {
            attempts.delete(key);
        }
        return originalJson(body);
    };

    next();
};

module.exports = loginRateLimit;
