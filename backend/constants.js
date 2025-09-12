// backend/constants.js
// This file mimics enums for use in the Node.js backend.

const UserRole = {
  STUDENT: 'Student',
  GOLD_MEMBER: 'Gold Member',
  ADMIN: 'Admin',
};

const ReviewStatus = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    HIDDEN: 'Hidden',
};

const CouponType = {
    PERCENTAGE: 'Percentage',
    FIXED: 'Fixed Amount',
};

const NotificationTarget = {
    ALL: 'All Users',
    STUDENTS: 'Students',
    GOLD_MEMBERS: 'Gold Members',
};

const NotificationActionType = {
    NONE: 'None',
    VIEW_COURSE: 'View Course',
    VIEW_COUPON: 'View Coupon',
};

const NotificationChannel = {
    IN_APP: 'In-App',
    PUSH: 'Push',
};

module.exports = {
    UserRole,
    ReviewStatus,
    CouponType,
    NotificationTarget,
    NotificationActionType,
    NotificationChannel,
};
