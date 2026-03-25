const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_insecure_jwt_secret_change_me';

const normalizeRole = (role = '') => String(role).trim().toLowerCase();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication token required'
        });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

const requireRoles = (allowedRoles = []) => {
    const allowed = new Set(allowedRoles.map(normalizeRole));

    return (req, res, next) => {
        const userRole = normalizeRole(req.user?.role || req.user?.userType);
        if (!allowed.has(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: insufficient permissions'
            });
        }
        return next();
    };
};

const requireSchoolAccess = ({ paramKey, bodyKey, queryKey } = {}) => {
    return (req, res, next) => {
        const tokenSchoolId = String(req.user?.schoolId || '');
        const tokenUserId = String(req.user?.userId || '');

        const target =
            (paramKey && req.params?.[paramKey]) ||
            (bodyKey && req.body?.[bodyKey]) ||
            (queryKey && req.query?.[queryKey]);

        if (!target) {
            return res.status(400).json({
                success: false,
                message: 'Missing school scope target'
            });
        }

        const targetId = String(target);
        if (targetId !== tokenSchoolId && targetId !== tokenUserId) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: cross-school access denied'
            });
        }

        return next();
    };
};

const requireSelfOrAdmin = (paramKey = 'id') => {
    return (req, res, next) => {
        const target = String(req.params?.[paramKey] || '');
        const currentUserId = String(req.user?.userId || '');
        const role = normalizeRole(req.user?.role || req.user?.userType);

        if (role === 'admin' || target === currentUserId) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Forbidden: you can only access your own resource'
        });
    };
};

const signAuthToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

module.exports = {
    authenticateToken,
    requireRoles,
    requireSchoolAccess,
    requireSelfOrAdmin,
    signAuthToken
};
