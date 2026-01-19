
// backend/controllers/notificationController.js
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');

/**
 * FIREBASE INTEGRATION
 * Senior Note: Ensure 'firebase-admin' is installed and serviceAccountKey.json is present.
 */
let admin;
try {
    admin = require('firebase-admin');
    if (!admin.apps.length) {
        const serviceAccount = require("../serviceAccountKey.json");
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
} catch (e) {
    console.warn("FCM Warning: Firebase Admin SDK not initialized. Push notifications will be logged to console only.");
}

/**
 * Unified Push Delivery with Token Cleanup
 */
const sendToFCM = async (tokens, title, message, data = {}) => {
    if (!tokens || tokens.length === 0) return;
    
    const uniqueTokens = [...new Set(tokens)];
    const payload = {
        notification: { title, body: message },
        data: {
            ...data,
            click_action: "FLUTTER_NOTIFICATION_CLICK", 
            timestamp: new Date().toISOString()
        },
        tokens: uniqueTokens,
    };

    if (admin && admin.apps.length) {
        try {
            // sendEachForMulticast is the modern batch replacement for sendMulticast
            const response = await admin.messaging().sendEachForMulticast(payload);
            
            // SENIOR LOGIC: Clean up invalid tokens
            if (response.failureCount > 0) {
                const unregisterTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        const errorCode = resp.error?.code;
                        // These codes mean the token is no longer valid
                        if (errorCode === 'messaging/registration-token-not-registered' || 
                            errorCode === 'messaging/invalid-registration-token') {
                            unregisterTokens.push(uniqueTokens[idx]);
                        }
                    }
                });

                if (unregisterTokens.length > 0) {
                    console.log(`Cleaning up ${unregisterTokens.length} stale tokens...`);
                    await db.query('DELETE FROM push_notification_tokens WHERE token IN (?)', [unregisterTokens]);
                }
            }
            console.log(`FCM Delivery: ${response.successCount} success, ${response.failureCount} failed.`);
        } catch (error) {
            console.error("FCM Critical Error:", error);
        }
    } else {
        console.log("Push Simulation Mode (No SDK):", JSON.stringify(payload, null, 2));
    }
};

const formatNotification = (row) => ({
    ...row,
    action: { 
        type: row.action_type || 'None', 
        payload: row.action_payload || '' 
    },
    channels: typeof row.channels === 'string' ? JSON.parse(row.channels) : (row.channels || []),
});

const sendNotification = asyncHandler(async (req, res) => {
    const { title, message, target, action, channels } = req.body;
    const notificationId = uuidv4();

    // 1. Audit Log in DB (Always needed for In-App Center)
    await db.query(
        'INSERT INTO sent_notifications (id, title, message, target, action_type, action_payload, channels) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [notificationId, title, message, target, action.type, action.payload, JSON.stringify(channels)]
    );

    // 2. Execute Channels
    if (channels.includes('Push')) {
        let tokenQuery = '';
        if (target === 'All Users') {
            tokenQuery = 'SELECT token FROM push_notification_tokens';
        } else if (target === 'Students') {
            tokenQuery = 'SELECT pt.token FROM push_notification_tokens pt JOIN users u ON pt.user_id = u.id WHERE u.role = "Student"';
        } else if (target === 'Gold Members') {
            tokenQuery = 'SELECT pt.token FROM push_notification_tokens pt JOIN users u ON pt.user_id = u.id WHERE u.role = "Gold Member"';
        }

        if (tokenQuery) {
            const [rows] = await db.query(tokenQuery);
            const tokens = rows.map(r => r.token);
            await sendToFCM(tokens, title, message, {
                notificationId,
                actionType: action.type,
                actionPayload: action.payload || ''
            });
        }
    }

    const [[newSentNotification]] = await db.query("SELECT *, DATE_FORMAT(sent_date, '%Y-%m-%d') as `sentDate` FROM sent_notifications WHERE id = ?", [notificationId]);
    res.status(200).json({ message: 'Notification dispatched.', data: formatNotification(newSentNotification) });
});

const getHistory = asyncHandler(async (req, res) => {
    const [rows] = await db.query("SELECT *, DATE_FORMAT(sent_date, '%Y-%m-%d') as `sentDate` FROM sent_notifications ORDER BY sent_date DESC");
    res.json({ message: 'Fetched history.', data: rows.map(formatNotification) });
});

const getTemplates = asyncHandler(async (req, res) => {
    const [rows] = await db.query('SELECT * FROM notification_templates ORDER BY created_at DESC');
    res.json({ message: 'Fetched templates.', data: rows.map(formatNotification) });
});

const createTemplate = asyncHandler(async (req, res) => {
    const { name, title, message, target, action } = req.body;
    const id = uuidv4();
    await db.query(
        'INSERT INTO notification_templates (id, name, title, message, target, action_type, action_payload) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, name, title, message, target, action.type, action.payload]
    );
    const [[tpl]] = await db.query('SELECT * FROM notification_templates WHERE id = ?', [id]);
    res.status(201).json({ message: 'Template created.', data: formatNotification(tpl) });
});

const updateTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, title, message, target, action } = req.body;
    await db.query(
        'UPDATE notification_templates SET name = ?, title = ?, message = ?, target = ?, action_type = ?, action_payload = ? WHERE id = ?',
        [name, title, message, target, action.type, action.payload, id]
    );
    const [[tpl]] = await db.query('SELECT * FROM notification_templates WHERE id = ?', [id]);
    res.json({ message: 'Template updated.', data: formatNotification(tpl) });
});

const deleteTemplate = asyncHandler(async (req, res) => {
    await db.query('DELETE FROM notification_templates WHERE id = ?', [req.params.id]);
    res.status(204).send();
});

module.exports = { sendNotification, getHistory, getTemplates, createTemplate, updateTemplate, deleteTemplate };
