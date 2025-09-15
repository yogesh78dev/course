// backend/controllers/salesController.js
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');

const getSales = asyncHandler(async (req, res) => {
    const query = `
        SELECT 
            s.id,
            s.original_amount,
            s.discount_amount,
            s.amount,
            s.status,
            DATE_FORMAT(s.sale_date, '%Y-%m-%d') as date,
            u.id as user_id,
            u.name as user_name,
            c.id as course_id,
            c.title as course_title
        FROM sales s
        JOIN users u ON s.user_id = u.id
        JOIN courses c ON s.course_id = c.id
        ORDER BY s.sale_date DESC
    `;
    const [rows] = await db.query(query);

    const formattedData = rows.map(row => ({
        id: row.id,
        originalAmount: row.original_amount,
        discountAmount: row.discount_amount,
        amount: row.amount,
        status: row.status,
        date: row.date,
        user: {
            id: row.user_id,
            name: row.user_name,
        },
        course: {
            id: row.course_id,
            title: row.course_title,
        }
    }));
    
    res.json({ message: 'Successfully fetched sales.', data: formattedData });
});

const updateSaleStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await db.query('UPDATE sales SET status = ? WHERE id = ?', [status, id]);

    if (result.affectedRows > 0) {
        // Re-fetch with joins to return the full object
        const query = `
            SELECT 
                s.id, s.original_amount, s.discount_amount, s.amount, s.status, DATE_FORMAT(s.sale_date, '%Y-%m-%d') as date,
                u.id as user_id, u.name as user_name,
                c.id as course_id, c.title as course_title
            FROM sales s
            JOIN users u ON s.user_id = u.id
            JOIN courses c ON s.course_id = c.id
            WHERE s.id = ?
        `;
        const [rows] = await db.query(query, [id]);
        const updatedSale = rows[0];

        const responseData = {
            id: updatedSale.id,
            originalAmount: updatedSale.original_amount,
            discountAmount: updatedSale.discount_amount,
            amount: updatedSale.amount,
            status: updatedSale.status,
            date: updatedSale.date,
            user: { id: updatedSale.user_id, name: updatedSale.user_name },
            course: { id: updatedSale.course_id, title: updatedSale.course_title }
        };
        
        res.json({ message: `Sale ${id} status updated.`, data: responseData });
    } else {
        res.status(404).json({ message: 'Sale not found' });
    }
});

const getAnalytics = asyncHandler(async (req, res) => {
    const [total] = await db.query("SELECT SUM(amount) as totalRevenue, COUNT(id) as totalSales FROM sales WHERE status = 'Paid'");
    res.json({ 
        message: 'Successfully fetched analytics.', 
        data: { 
            totalRevenue: parseFloat(total[0].totalRevenue) || 0,
            totalSales: parseInt(total[0].totalSales, 10) || 0,
        } 
    });
});

module.exports = { getSales, getAnalytics, updateSaleStatus };