// backend/server.js
require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const userRoutes = require('./routes/userRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const salesRoutes = require('./routes/salesRoutes');
const couponRoutes = require('./routes/couponRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const studentRoutes = require('./routes/studentRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const promotionRoutes = require('./routes/promotionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 uploads

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/student/purchase', purchaseRoutes);
app.use('/api/promotions', promotionRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('CourseAdmin Pro Backend is running!');
});

// Test DB connection and start server
const startServer = async () => {
  try {
    // A simple query to test the connection
    await db.query('SELECT 1');
    console.log('Database connection successful.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
};

startServer();