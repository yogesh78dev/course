// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET;

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Fetch user from DB to ensure they still exist and have correct permissions
            const [rows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
            
            if (rows.length === 0) {
                 return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            req.user = rows[0];
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

exports.isStudent = (req, res, next) => {
    if (req.user && (req.user.role === 'Student' || req.user.role === 'Gold Member')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a student' });
    }
};
