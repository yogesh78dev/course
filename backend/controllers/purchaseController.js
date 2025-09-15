// backend/controllers/purchaseController.js
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const createOrder = asyncHandler(async (req, res) => {
    const { courseId, couponCode } = req.body;
    const studentId = req.user.id;

    // 1. Validate course exists
    const [courseRows] = await db.query('SELECT price, access_type, access_duration_days FROM courses WHERE id = ?', [courseId]);
    if (courseRows.length === 0) {
        return res.status(404).json({ message: 'Course not found.' });
    }
    const course = courseRows[0];
    const originalAmount = parseFloat(course.price);

    // 2. Check if already enrolled
    const [existing] = await db.query('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [studentId, courseId]);
    if (existing.length > 0) {
        return res.status(400).json({ message: 'You are already enrolled in this course.' });
    }

    let finalAmount = originalAmount;
    let discountAmount = 0;
    let couponId = null;

    // 3. Validate coupon if provided
    if (couponCode) {
        const [couponRows] = await db.query('SELECT * FROM coupons WHERE code = ? AND start_date <= CURDATE() AND end_date >= CURDATE()', [couponCode]);
        if (couponRows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired coupon code.' });
        }
        const coupon = couponRows[0];

        // Further validation (usage limit, specific courses, etc.) would go here
        // For simplicity, we'll just apply the discount.
        couponId = coupon.id;
        if (coupon.type === 'Percentage') {
            discountAmount = originalAmount * (coupon.value / 100);
        } else { // Fixed Amount
            discountAmount = coupon.value;
        }
        finalAmount = Math.max(0, originalAmount - discountAmount);
    }
    
    // 4. Create a 'Pending' sale record
    const saleId = uuidv4();
    const gatewayOrderId = `order_mock_${uuidv4()}`; // Mock gateway order ID
    const paymentGateway = 'MockGateway';

    await db.query(
        'INSERT INTO sales (id, user_id, course_id, original_amount, discount_amount, amount, status, coupon_id, payment_gateway, gateway_order_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [saleId, studentId, courseId, originalAmount, discountAmount, finalAmount, 'Pending', couponId, paymentGateway, gatewayOrderId]
    );

    // 5. Return details to the client to initialize payment
    // In a real app, you would use the payment gateway's SDK here to create an order
    // and get the gatewayOrderId. The gatewayKey would be your public API key for the gateway.
    res.json({
        message: 'Order created successfully. Proceed to payment.',
        data: {
            saleId: saleId,
            gatewayOrderId: gatewayOrderId,
            amount: finalAmount,
            currency: 'INR',
            gatewayKey: 'your_public_gateway_key' // Example public key
        }
    });
});

const verifyPayment = asyncHandler(async (req, res) => {
    const { saleId, gatewayPaymentId, gatewayOrderId, gatewaySignature } = req.body;
    const studentId = req.user.id;

    const [saleRows] = await db.query('SELECT * FROM sales WHERE id = ? AND user_id = ? AND status = "Pending"', [saleId, studentId]);
    if (saleRows.length === 0) {
        return res.status(404).json({ message: 'Pending order not found.' });
    }
    const sale = saleRows[0];

    // --- CRITICAL SECURITY STEP ---
    // In a real application, you must verify the signature from the payment gateway
    // to ensure the request is authentic. This prevents fraudulent requests.
    // Example for Razorpay:
    // const expectedSignature = crypto.createHmac('sha256', process.env.PAYMENT_GATEWAY_SECRET)
    //     .update(gatewayOrderId + "|" + gatewayPaymentId)
    //     .digest('hex');
    // if (expectedSignature !== gatewaySignature) {
    //     await db.query('UPDATE sales SET status = "Failed", gateway_payment_id = ?, gateway_signature = ? WHERE id = ?', [gatewayPaymentId, gatewaySignature, saleId]);
    //     return res.status(400).json({ message: 'Payment verification failed.' });
    // }
    console.log("--- SIMULATING PAYMENT VERIFICATION (Always successful for this demo) ---");

    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Update sale to 'Paid'
        await connection.query(
            'UPDATE sales SET status = "Paid", gateway_payment_id = ?, gateway_signature = ? WHERE id = ?',
            [gatewayPaymentId, gatewaySignature, saleId]
        );

        // 2. Create the enrollment
        const [courseRows] = await db.query('SELECT access_type, access_duration_days FROM courses WHERE id = ?', [sale.course_id]);
        const course = courseRows[0];
        let expiryDate = null;
        if (course.access_type === 'expiry' && course.access_duration_days) {
            const now = new Date();
            now.setDate(now.getDate() + course.access_duration_days);
            expiryDate = now;
        }
        const enrollmentId = uuidv4();
        await connection.query('INSERT INTO enrollments (id, user_id, course_id, expiry_date) VALUES (?, ?, ?, ?)', [enrollmentId, studentId, sale.course_id, expiryDate]);

        // 3. Update coupon usage if one was used
        if (sale.coupon_id) {
            const usageId = uuidv4();
            await connection.query('INSERT INTO coupon_usage (id, coupon_id, user_id, sale_id) VALUES (?, ?, ?, ?)', [usageId, sale.coupon_id, studentId, saleId]);
        }

        await connection.commit();
        res.json({ message: 'Payment successful. You are now enrolled in the course.' });

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
});

const getMySalesHistory = asyncHandler(async (req, res) => {
    const studentId = req.user.id;
    const query = `
        SELECT 
            s.id, s.amount, s.status, DATE_FORMAT(s.sale_date, '%Y-%m-%d') as date,
            c.id as courseId, c.title as courseTitle
        FROM sales s
        JOIN courses c ON s.course_id = c.id
        WHERE s.user_id = ?
        ORDER BY s.sale_date DESC
    `;
    const [sales] = await db.query(query, [studentId]);
    res.json({ message: 'Successfully fetched sales history.', data: sales });
});


module.exports = { createOrder, verifyPayment, getMySalesHistory };