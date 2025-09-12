// backend/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
    .then(conn => {
        console.log('Connected to the MySQL database!');
        conn.release();
    })
    .catch(err => {
        console.error('Failed to connect to MySQL:', err);
    });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
