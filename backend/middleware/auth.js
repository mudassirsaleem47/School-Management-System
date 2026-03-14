const jwt = require('jsonwebtoken');
const Admin = require('../models/adminSchema');

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "Authentication required. Please login." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sms_backup_secret_do_not_use_in_prod');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token. Please login again." });
    }
};

const checkSubscription = (req, res, next) => {
    // Subscription check disabled for now
    next();
};

module.exports = { authenticate, checkSubscription };
