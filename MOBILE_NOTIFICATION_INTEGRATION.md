# Mobile App Notification Integration Guide

This document explains how the mobile app (Flutter/React Native/Native) should integrate with the CreatorGuru backend for both **Push Notifications** and the **In-App Notification Center**.

---

## 1. Prerequisites
- **FCM (Firebase Cloud Messaging)**: The backend is configured to use Firebase. Ensure the mobile app is correctly set up with the same Firebase project.
- **Authentication**: All endpoints require a valid JWT token in the header: 
  `Authorization: Bearer <STUDENT_JWT_TOKEN>`

---

## 2. Device Token Registration
The backend needs to know the device's FCM token to send push notifications.

- **Endpoint**: `POST /api/student/me/push-token`
- **When to call**: 
    1. On every app launch (after login).
    2. When the FCM token changes (via Firebase listeners).
- **Payload**:
```json
{
  "token": "fcm_token_string_here",
  "deviceType": "android" 
}
```
*Note: `deviceType` must be one of: `android`, `ios`, or `web`.*

---

## 3. In-App Notification Center (Inbox)
To show a list of past announcements/notifications to the user.

- **Endpoint**: `GET /api/student/my-notifications`
- **Response Format**:
```json
{
  "message": "Successfully fetched your notifications.",
  "data": [
    {
      "id": "uuid-1234",
      "title": "Welcome to CreatorGuru!",
      "message": "Start your learning journey today.",
      "timestamp": "2024-05-20 14:30",
      "read": false
    }
  ]
}
```

---

## 4. Handling Incoming Push Notifications
The backend sends a **High Priority Multicast Message**. The structure includes both a display component (for the system tray) and a data component (for app logic).

### FCM Payload Structure
```json
{
  "notification": {
    "title": "New Course Available!",
    "body": "Check out 'React Mastery' now."
  },
  "data": {
    "notificationId": "uuid-5678",
    "actionType": "View Course",
    "actionPayload": "crs-uuid-abcd",
    "click_action": "FLUTTER_NOTIFICATION_CLICK"
  }
}
```

### Navigation Logic (Implementation Details)
When a user taps the notification, the app should use the `data` object to navigate:

| actionType | actionPayload | Behavior |
| :--- | :--- | :--- |
| `None` | N/A | Just show the alert or open the app dashboard. |
| `View Course` | Course ID | Navigate the user directly to the Course Detail screen for that ID. |
| `View Coupon` | Coupon ID | Navigate the user to the Rewards or Promotions screen. |

### Example Implementation (Pseudocode)
```javascript
// Listen for notification clicks when app is in background/terminated
FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) => {
  String type = message.data['actionType'];
  String id = message.data['actionPayload'];

  if (type == 'View Course' && id != null) {
    Navigator.pushNamed(context, '/course-details', arguments: id);
  } else if (type == 'View Coupon') {
    Navigator.pushNamed(context, '/coupons');
  }
});
```

---

## 5. Summary of Service Requirements
- **Backend**: `firebase-admin` must be installed and `serviceAccountKey.json` must be present in the root.
- **Cleanup**: The backend automatically deletes tokens from the database if Firebase returns an `invalid-token` error (e.g., app uninstalled).
