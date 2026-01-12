// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET;

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Fetch user from DB to ensure they still exist and are valid
            const [rows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
            const user = rows[0];

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            req.user = user;
            return next();

        } catch (error) {
            console.error('Token verification failed:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
});

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

const isStudent = (req, res, next) => {
    if (req.user && (req.user.role === 'Student' || req.user.role === 'Gold Member')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a student' });
    }
};

module.exports = { protect, admin, isStudent };