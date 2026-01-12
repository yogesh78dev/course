// backend/controllers/couponController.js
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');

/**
 * Maps database row to Frontend Coupon interface
 */
const mapCouponFromDb = (row) => {
    if (!row) return null;
    return {
        id: row.id,
        code: row.code,
        type: row.type,
        value: parseFloat(row.value),
        startDate: row.start_date,
        endDate: row.end_date,
        usageLimit: row.usage_limit,
        firstTimeBuyerOnly: !!row.first_time_buyer_only,
        createdAt: row.created_at,
        usageCount: row.usageCount || 0,
        courseIds: row.courseIds || []
    };
};

const getCoupons = asyncHandler(async (req, res) => {
    const [coupons] = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
    const [usage] = await db.query('SELECT coupon_id, COUNT(*) as count FROM coupon_usage GROUP BY coupon_id');
    const [courses] = await db.query('SELECT coupon_id, course_id FROM coupon_courses');

    const usageMap = usage.reduce((acc, item) => ({ ...acc, [item.coupon_id]: item.count }), {});
    const coursesMap = courses.reduce((acc, item) => {
        if (!acc[item.coupon_id]) acc[item.coupon_id] = [];
        acc[item.coupon_id].push(item.course_id);
        return acc;
    }, {});

    const results = coupons.map(c => mapCouponFromDb({
        ...c,
        usageCount: usageMap[c.id] || 0,
        courseIds: coursesMap[c.id] || []
    }));
    
    res.json({ message: 'Successfully fetched coupons.', data: results });
});

const createCoupon = asyncHandler(async (req, res) => {
    // Accepting camelCase from frontend
    const { code, type, value, startDate, endDate, usageLimit, courseIds, firstTimeBuyerOnly } = req.body;
    const couponId = uuidv4();
    
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();
        const couponQuery = `
            INSERT INTO coupons (id, code, type, value, start_date, end_date, usage_limit, first_time_buyer_only)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        await connection.query(couponQuery, [couponId, code, type, value, startDate, endDate, usageLimit, firstTimeBuyerOnly]);
        
        if (courseIds && courseIds.length > 0) {
            const courseValues = courseIds.map(courseId => [couponId, courseId]);
            const courseQuery = `INSERT INTO coupon_courses (coupon_id, course_id) VALUES ?`;
            await connection.query(courseQuery, [courseValues]);
        }
        
        await connection.commit();
        
        const [[newCouponRows]] = await db.query('SELECT * FROM coupons WHERE id = ?', [couponId]);
        const responseData = mapCouponFromDb({ ...newCouponRows[0], usageCount: 0, courseIds: courseIds || [] });
        res.status(201).json({ message: 'Coupon created.', data: responseData });

    } catch (e) {
        await connection.rollback();
        throw e;
    } finally {
        connection.release();
    }
});

const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    // Accepting camelCase from frontend
    const { code, type, value, startDate, endDate, usageLimit, courseIds, firstTimeBuyerOnly } = req.body;

    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();
        const couponQuery = `
            UPDATE coupons 
            SET code = ?, type = ?, value = ?, start_date = ?, end_date = ?, usage_limit = ?, first_time_buyer_only = ?
            WHERE id = ?`;
        const [result] = await connection.query(couponQuery, [code, type, value, startDate, endDate, usageLimit, firstTimeBuyerOnly, id]);
        
        if (result.affectedRows === 0) {
            throw new Error('Coupon not found');
        }
        
        await connection.query('DELETE FROM coupon_courses WHERE coupon_id = ?', [id]);
        if (courseIds && courseIds.length > 0) {
            const courseValues = courseIds.map(courseId => [id, courseId]);
            const courseQuery = `INSERT INTO coupon_courses (coupon_id, course_id) VALUES ?`;
            await connection.query(courseQuery, [courseValues]);
        }

        await connection.commit();
        
        const [[updatedCoupon]] = await db.query('SELECT * FROM coupons WHERE id = ?', [id]);
        const [[usage]] = await db.query('SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = ?', [id]);
        
        const responseData = mapCouponFromDb({ ...updatedCoupon, usageCount: usage.count, courseIds: courseIds || [] });
        res.json({ message: `Coupon ${id} updated.`, data: responseData });

    } catch (e) {
        await connection.rollback();
        if (e.message === 'Coupon not found') return res.status(404).json({ message: 'Coupon not found' });
        throw e;
    } finally {
        connection.release();
    }
});

const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM coupons WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Coupon not found' });
    }
});

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon };
