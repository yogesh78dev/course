// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');

const JWT_SECRET = process.env.JWT_SECRET;

const getFullUserForResponse = async (userId) => {
    const query = `
        SELECT id, name, email, role, avatar_url as avatar, 
               DATE_FORMAT(joined_date, '%Y-%m-%d') as \`joinedDate\`, 
               phone_number as phoneNumber, status
        FROM users 
        WHERE id = ?
    `;
    const [rows] = await db.query(query, [userId]);
    return rows[0];
};

const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND role = ?', [email, 'Admin']);
    const adminUser = rows[0];

    if (!adminUser) {
        return res.status(404).json({ message: 'Admin user with this email does not exist.' });
    }

    if (await bcrypt.compare(password, adminUser.password_hash)) {
        const payload = {
            id: adminUser.id,
            email: adminUser.email,
            role: adminUser.role,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

        res.json({
            message: 'Admin login successful',
            token,
            user: payload,
        });
    } else {
        res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }
});

const registerStudent = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password' });
    }
    
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const avatar_url = `https://picsum.photos/seed/${Date.now()}/100`;
    const userId = uuidv4();

    await db.query(
        'INSERT INTO users(id, name, email, password_hash, role, avatar_url) VALUES(?, ?, ?, ?, ?, ?)',
        [userId, name, email, password_hash, 'Student', avatar_url]
    );
    
    const newUser = await getFullUserForResponse(userId);
    
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
        expiresIn: '30d',
    });

    res.status(201).json({
        message: 'Student registration successful',
        token,
        user: newUser
    });
});

const loginStudent = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const [rows] = await db.query("SELECT * FROM users WHERE email = ? AND role != 'Admin'", [email]);
    const studentUser = rows[0];

    if (!studentUser) {
        return res.status(404).json({ message: 'A user with this email could not be found.' });
    }

    if (await bcrypt.compare(password, studentUser.password_hash)) {
         const tokenPayload = {
            id: studentUser.id,
            email: studentUser.email,
            name: studentUser.name,
            role: studentUser.role,
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });
        
        const userResponse = await getFullUserForResponse(studentUser.id);
        
        res.json({
            message: 'Student login successful',
            token,
            user: userResponse,
        });
    } else {
        res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }
});

const loginWithGmail = asyncHandler(async (req, res) => {
    const { email, name } = req.body;

    if (!email || !name) {
        return res.status(400).json({ message: 'Email and name are required for Gmail login.' });
    }

    // Check if user exists
    const [existingUsers] = await db.query("SELECT id FROM users WHERE email = ? AND role != 'Admin'", [email]);
    let userRecord = existingUsers[0];
    let userId;

    // If user does not exist, create a new one
    if (!userRecord) {
        userId = uuidv4();
        // Create a random, unusable password hash as it's not needed for social login
        const salt = await bcrypt.genSalt(10);
        const randomPassword = uuidv4(); // A random string to be hashed
        const password_hash = await bcrypt.hash(randomPassword, salt);
        const avatar_url = `https://picsum.photos/seed/${Date.now()}/100`;

        await db.query(
            'INSERT INTO users(id, name, email, password_hash, role, avatar_url) VALUES(?, ?, ?, ?, ?, ?)',
            [userId, name, email, password_hash, 'Student', avatar_url]
        );
    } else {
        userId = userRecord.id;
    }
    
    const user = await getFullUserForResponse(userId);

    // At this point, 'user' is guaranteed to be a valid user object (either existing or newly created)
    const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
    
    res.json({
        message: 'Gmail login successful',
        token,
        user: user,
    });
});

// --- Password Reset ---

const sendPasswordResetEmail = async (email, otp) => {
  // In a real application, you would use an email service like Nodemailer, SendGrid, etc.
  // For this project, we will simulate the email by logging it to the console.
  console.log('--- SIMULATING PASSWORD RESET EMAIL ---');
  console.log(`To: ${email}`);
  console.log(`Subject: Your Password Reset Code`);
  console.log(`Your password reset code is: ${otp}`);
  console.log('This code will expire in 10 minutes.');
  console.log('------------------------------------');
  return Promise.resolve();
};

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
        // We send a generic message to prevent user enumeration attacks
        return res.json({ message: 'If an account with that email exists, a password reset code has been sent.' });
    }
    const user = rows[0];

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await db.query(
        'UPDATE users SET password_reset_otp = ?, password_reset_expires = ? WHERE id = ?',
        [otp, expires, user.id]
    );

    // Send the OTP via email (simulated)
    await sendPasswordResetEmail(email, otp);

    res.json({ message: 'If an account with that email exists, a password reset code has been sent.' });
});

const resendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
        // We send a generic message to prevent user enumeration attacks
        return res.json({ message: 'If an account with that email exists, a new password reset code has been sent.' });
    }
    const user = rows[0];

    // Generate a new 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await db.query(
        'UPDATE users SET password_reset_otp = ?, password_reset_expires = ? WHERE id = ?',
        [otp, expires, user.id]
    );

    // Send the new OTP via email (simulated)
    await sendPasswordResetEmail(email, otp);

    res.json({ message: 'If an account with that email exists, a new password reset code has been sent.' });
});

const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const [rows] = await db.query(
        'SELECT id FROM users WHERE email = ? AND password_reset_otp = ? AND password_reset_expires > NOW()',
        [email, otp]
    );

    if (rows.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    res.json({ message: 'OTP verified successfully.' });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
        return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
    }

    const [rows] = await db.query(
        'SELECT id FROM users WHERE email = ? AND password_reset_otp = ? AND password_reset_expires > NOW()',
        [email, otp]
    );
    
    if (rows.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    const user = rows[0];

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await db.query(
        'UPDATE users SET password_hash = ?, password_reset_otp = NULL, password_reset_expires = NULL WHERE id = ?',
        [password_hash, user.id]
    );

    res.json({ message: 'Password has been reset successfully.' });
});


module.exports = { loginAdmin, registerStudent, loginStudent, loginWithGmail, forgotPassword, verifyOtp, resetPassword, resendOtp };