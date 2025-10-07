// backend/controllers/userController.js
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const getFullStudentProfile = async (studentId) => {
    const userQuery = `
        SELECT id, name, email, role, avatar_url as avatar, DATE_FORMAT(joined_date, '%Y-%m-%d') as \`joinedDate\`, phone_number as phoneNumber, status
        FROM users u WHERE u.id = ?
    `;
    const [userRows] = await db.query(userQuery, [studentId]);
    if (userRows.length === 0) return null;
    
    const profile = userRows[0];
    const enrollmentsQuery = `
        SELECT course_id as 'courseId', 
               DATE_FORMAT(enrollment_date, '%Y-%m-%d') as 'enrollmentDate',
               DATE_FORMAT(expiry_date, '%Y-%m-%d') as 'expiryDate'
        FROM enrollments WHERE user_id = ?
    `;
    const [enrollments] = await db.query(enrollmentsQuery, [studentId]);
    profile.enrolledCourses = enrollments;
    
    const historyQuery = `
        SELECT wh.lesson_id as 'lessonId', l.module_id, m.course_id as 'courseId',
               wh.watched_at as 'watchedAt', wh.progress_percentage as 'progress'
        FROM watch_history wh 
        JOIN lessons l ON wh.lesson_id = l.id
        JOIN modules m ON l.module_id = m.id
        WHERE wh.user_id = ?
    `;
    const [watchHistory] = await db.query(historyQuery, [studentId]);
    profile.watchHistory = watchHistory;

    return profile;
};

const getUsers = asyncHandler(async (req, res) => {
    let query = "SELECT id, name, email, role, avatar_url as avatar, DATE_FORMAT(joined_date, '%Y-%m-%d') as `joinedDate`, phone_number as phoneNumber, status FROM users";
    const queryParams = [];
    
    if (req.query.role) {
        queryParams.push(req.query.role);
        query += ` WHERE role = ?`;
    }
    query += " ORDER BY joined_date DESC";

    const [rows] = await db.query(query, queryParams);

    const usersWithDetails = rows.map(u => ({ ...u, enrolledCourses: [], watchHistory: [] }));
    
    res.json({ message: 'Successfully fetched users.', data: usersWithDetails });
});

const createUser = asyncHandler(async (req, res) => {
    const { name, email, role, phoneNumber, avatar } = req.body;
    if (role === 'Admin') {
        return res.status(400).json({ message: 'Cannot create a user with Admin role.' });
    }
    
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
        return res.status(400).json({ message: 'Email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('password123', salt); // Default password
    const userId = uuidv4();
    let avatarUrl = `https://picsum.photos/seed/${Date.now()}/100`;

    if (avatar && avatar.startsWith('data:image')) {
        const matches = avatar.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            const imageType = matches[1].split('+')[0];
            const base64Data = matches[2];
            const imageBuffer = Buffer.from(base64Data, 'base64');
            const filename = `${uuidv4()}.${imageType}`;
            
            const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
            fs.mkdirSync(avatarsDir, { recursive: true });
            
            const imagePath = path.join(avatarsDir, filename);
            fs.writeFileSync(imagePath, imageBuffer);
            
            const serverBaseUrl = process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
            avatarUrl = `${serverBaseUrl}/uploads/avatars/${filename}`;
        }
    }

    await db.query(
        'INSERT INTO users(id, name, email, role, password_hash, avatar_url, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, name, email, role, password_hash, avatarUrl, phoneNumber || null]
    );

    const [newRows] = await db.query("SELECT id, name, email, role, avatar_url as avatar, DATE_FORMAT(joined_date, '%Y-%m-%d') as `joinedDate`, phone_number as phoneNumber, status FROM users WHERE id = ?", [userId]);
    const newUser = { ...newRows[0], enrolledCourses: [], watchHistory: [] };

    res.status(201).json({ message: 'User created successfully.', data: newUser });
});

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, role, phoneNumber, status, avatar } = req.body;
    
    if (role === 'Admin' && id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to set other users as Admin.' });
    }

    const [existingUsers] = await db.query('SELECT avatar_url FROM users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }
    const existingUser = existingUsers[0];

    let avatar_url = avatar;

    if (avatar && avatar.startsWith('data:image')) {
        if (existingUser && existingUser.avatar_url && existingUser.avatar_url.includes('/uploads/avatars/')) {
            try {
                const oldFilename = existingUser.avatar_url.split('/').pop();
                if (oldFilename) {
                    const oldPath = path.join(__dirname, '..', 'uploads', 'avatars', oldFilename);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
            } catch (e) {
                console.error("Failed to delete old avatar:", e);
            }
        }
        
        const matches = avatar.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            const imageType = matches[1].split('+')[0];
            const base64Data = matches[2];
            const imageBuffer = Buffer.from(base64Data, 'base64');
            const filename = `${uuidv4()}.${imageType}`;
            const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
            fs.mkdirSync(avatarsDir, { recursive: true });
            const imagePath = path.join(avatarsDir, filename);
            fs.writeFileSync(imagePath, imageBuffer);
            const serverBaseUrl = process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
            avatar_url = `${serverBaseUrl}/uploads/avatars/${filename}`;
        }
    }

    const [result] = await db.query(
        'UPDATE users SET name = ?, email = ?, role = ?, phone_number = ?, status = ?, avatar_url = ? WHERE id = ?',
        [name, email, role, phoneNumber || null, status, avatar_url, id]
    );

    if (result.affectedRows > 0) {
        const [updatedRows] = await db.query("SELECT id, name, email, role, avatar_url as avatar, DATE_FORMAT(joined_date, '%Y-%m-%d') as `joinedDate`, phone_number as phoneNumber, status FROM users WHERE id = ?", [id]);
        const updatedUser = { ...updatedRows[0], enrolledCourses: [], watchHistory: [] };
        res.json({ message: `User ${id} updated successfully.`, data: updatedUser });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});


const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

const getStudentProfileForAdmin = asyncHandler(async (req, res) => {
    const studentId = req.params.id;
    const profile = await getFullStudentProfile(studentId);
    if (!profile) {
        return res.status(404).json({ message: 'Student not found.' });
    }
    res.json({ message: 'Successfully fetched student profile.', data: profile });
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'All password fields are required.' });
    }

    const [rows] = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    const user = rows[0];

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, userId]);

    res.json({ message: 'Password changed successfully.' });
});

module.exports = { getUsers, createUser, updateUser, deleteUser, getStudentProfileForAdmin, changePassword };
