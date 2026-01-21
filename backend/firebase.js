// backend/firebase.js
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

try {
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin initialized successfully.');
    } else {
        console.warn('Firebase Warning: serviceAccountKey.json not found at ' + serviceAccountPath + '. Push notifications will operate in simulation mode.');
    }
} catch (error) {
    console.error('Firebase Initialization Error:', error);
}

module.exports = admin;
