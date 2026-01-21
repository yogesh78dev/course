// backend/controllers/notificationController.js
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');
const admin = require('../firebase');

/**
 * Sends a high-priority multicast message to mobile devices.
 * Implements senior-level error handling and token cleanup.
 */
const sendToFCM = async (tokens, title, message, data = {}) => {    
    if (!tokens || tokens.length === 0) return;
    
    // Ensure tokens are unique
    const uniqueTokens = [...new Set(tokens)];
    // Define the FCM payload
    const payload = {
        notification: {
            title: title,
            body: message,
        },
        data: {
            ...data,
            click_action: "FLUTTER_NOTIFICATION_CLICK", // Vital for background handling in many frameworks
            timestamp: new Date().toISOString()
        },
        tokens: uniqueTokens,
    };
    const message1 = {
        tokens: uniqueTokens,
        notification: {
            title,
            body
        },
        data: {
            ...data,
            click_action: "FLUTTER_NOTIFICATION_CLICK",
            timestamp: new Date().toISOString()
        }
    };
        
    // Check if Firebase is initialized
    if (admin && admin.apps.length) {
        console.log("fcm admin hit====>");
        
        try {
            // Use modern batch sending method
            const response = await admin.messaging().sendEachForMulticast(payload);
            // const response = await admin.messaging().sendEachForMulticast(message);
            
            // Log results
            console.log(`FCM Stats: ${response.successCount} successful, ${response.failureCount} failed.`);

            // CLEANUP LOGIC: Identify and delete tokens that are no longer valid
            if (response.failureCount > 0) {
                const tokensToRemove = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        const errorCode = resp.error?.code;
                        // FCM error codes that indicate a token is dead
                        if (errorCode === 'messaging/registration-token-not-registered' || 
                            errorCode === 'messaging/invalid-registration-token') {
                            tokensToRemove.push(uniqueTokens[idx]);
                        }
                    }
                });

                if (tokensToRemove.length > 0) {
                    console.log(`Auto-cleaning ${tokensToRemove.length} stale/invalid device tokens...`);
                    await db.query('DELETE FROM push_notification_tokens WHERE token IN (?)', [tokensToRemove]);
                }
            }
        } catch (error) {
            console.error("Critical FCM Send Error:", error);
        }
    } else {
        // Simulation mode for environments without a valid service account
        console.log("--- PUSH NOTIFICATION SIMULATION (FCM NOT CONFIGURED) ---");
        console.log("To:", uniqueTokens.length, "devices");
        console.log("Payload:", JSON.stringify(payload, null, 2));
        console.log("-------------------------------------------------------");
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

    // 1. Persist to Audit Log / In-App Inbox
    await db.query(
        'INSERT INTO sent_notifications (id, title, message, target, action_type, action_payload, channels) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [notificationId, title, message, target, action.type, action.payload, JSON.stringify(channels)]
    );
    
    // 2. Handle Push Channel
    if (channels.includes('Push')) {
        let tokenQuery = '';
        const queryParams = [];

        // Dynamic Targeting Logic
        if (target === 'All Users') {
            tokenQuery = 'SELECT token FROM push_notification_tokens';
        } else if (target === 'Students') {
            tokenQuery = `
                SELECT pt.token FROM push_notification_tokens pt 
                JOIN users u ON pt.user_id = u.id 
                WHERE u.role = 'Student'
            `;
        } else if (target === 'Gold Members') {
            tokenQuery = `
                SELECT pt.token FROM push_notification_tokens pt 
                JOIN users u ON pt.user_id = u.id 
                WHERE u.role = 'Gold Member'
            `;
        }

        if (tokenQuery) {
            const [rows] = await db.query(tokenQuery, queryParams);
            const tokens = rows.map(r => r.token);
            
            console.log("sending to fcm==>");
            
            // Offload to FCM helper
            await sendToFCM(tokens, title, message, {
                notificationId: notificationId,
                actionType: action.type,
                actionPayload: action.payload || ''
            });
        }
    }

    const [[newSentNotification]] = await db.query("SELECT *, DATE_FORMAT(sent_date, '%Y-%m-%d') as `sentDate` FROM sent_notifications WHERE id = ?", [notificationId]);
    res.status(200).json({ message: 'Notification processed and dispatched.', data: formatNotification(newSentNotification) });
});

const getHistory = asyncHandler(async (req, res) => {
    const [rows] = await db.query("SELECT *, DATE_FORMAT(sent_date, '%Y-%m-%d') as `sentDate` FROM sent_notifications ORDER BY sent_date DESC");
    res.json({ message: 'Successfully fetched notification history.', data: rows.map(formatNotification) });
});

const getTemplates = asyncHandler(async (req, res) => {
    const [rows] = await db.query('SELECT * FROM notification_templates ORDER BY created_at DESC');
    res.json({ message: 'Successfully fetched notification templates.', data: rows.map(formatNotification) });
});

const createTemplate = asyncHandler(async (req, res) => {
    const { name, title, message, target, action } = req.body;
    const templateId = uuidv4();
    await db.query(
        'INSERT INTO notification_templates (id, name, title, message, target, action_type, action_payload) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [templateId, name, title, message, target, action.type, action.payload]
    );

    const [[newTemplate]] = await db.query('SELECT * FROM notification_templates WHERE id = ?', [templateId]);
    res.status(201).json({ message: 'Template created.', data: formatNotification(newTemplate) });
});

const updateTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, title, message, target, action } = req.body;
    const [result] = await db.query(
        'UPDATE notification_templates SET name = ?, title = ?, message = ?, target = ?, action_type = ?, action_payload = ? WHERE id = ?',
        [name, title, message, target, action.type, action.payload, id]
    );

    if (result.affectedRows > 0) {
        const [[updatedTemplate]] = await db.query('SELECT * FROM notification_templates WHERE id = ?', [id]);
        res.json({ message: `Template ${id} updated.`, data: formatNotification(updatedTemplate) });
    } else {
        res.status(404).json({ message: 'Template not found' });
    }
});

const deleteTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM notification_templates WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Template not found' });
    }
});

module.exports = { sendNotification, getHistory, getTemplates, createTemplate, updateTemplate, deleteTemplate };
