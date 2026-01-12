
// ... existing types ...

export enum UserRole {
    STUDENT = 'Student',
    GOLD_MEMBER = 'Gold Member',
    ADMIN = 'Admin',
}

export enum ReviewStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    HIDDEN = 'Hidden',
}

export enum CouponType {
    PERCENTAGE = 'Percentage',
    FIXED = 'Fixed Amount',
}

export enum NotificationTarget {
    ALL = 'All Users',
    STUDENTS = 'Students',
    GOLD_MEMBERS = 'Gold Members',
}

export enum NotificationActionType {
    NONE = 'None',
    VIEW_COURSE = 'View Course',
    VIEW_COUPON = 'View Coupon',
}

export enum NotificationChannel {
    IN_APP = 'In-App',
    PUSH = 'Push',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    joinedDate: string;
    avatar: string;
    enrolledCourses: {
        courseId: string;
        enrollmentDate: string;
        expiryDate: string | null;
        completionPercentage?: number;
    }[];
    watchHistory: {
        courseId: string;
        lessonId: string;
        watchedAt: string;
        progress: number;
    }[];
    status: 'Active' | 'Inactive';
    phoneNumber: string | null;
    profileCompletionPercentage?: number;
}

export interface Lesson {
    id: string;
    title: string;
    description?: string;
    type: 'video' | 'pdf' | 'quiz' | 'assignment';
    contentUrl?: string;
    duration: number;
    tags: string[];
    attachmentUrl?: string;
    thumbnailUrl?: string;
}

export interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

export interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    duration: string;
    instructorId: string;
    instructorName?: string;
    posterImageUrl: string;
    bannerImageUrl: string;
    introVideoUrl: string;
    accessType: 'lifetime' | 'expiry';
    accessDuration: number | null;
    enableCertificate: boolean;
    modules: Module[];
    createdAt?: string;
}

export interface Sale {
    id: string;
    user: { id: string; name: string };
    course: { id: string; title: string };
    amount: number;
    date: string;
    status: 'Paid' | 'Pending' | 'Failed';
}

export interface Category {
    id: string;
    name: string;
}

export interface Notification {
    id: string;
    message: string;
    timestamp: string;
    read: boolean;
    title?: string;
}

export interface Review {
    id: string;
    courseId: string;
    userId: string;
    rating: number;
    comment: string;
    date: string;
    status: ReviewStatus;
}

export interface Coupon {
    id: string;
    code: string;
    type: CouponType;
    value: number;
    startDate: string;
    endDate: string;
    usageCount: number;
    usageLimit: number | null;
    courseIds: string[];
    firstTimeBuyerOnly: boolean;
}

export interface NotificationAction {
    type: NotificationActionType;
    payload?: string;
}

export interface SentNotification {
    id: string;
    title: string;
    message: string;
    target: NotificationTarget;
    action: NotificationAction;
    sentDate: string;
    channels: NotificationChannel[];
    timestamp?: string;
    read?: boolean;
}

export interface NotificationTemplate {
    id: string;
    name: string;
    title: string;
    message: string;
    target: NotificationTarget;
    action: NotificationAction;
}

export interface Instructor {
    id: string;
    name: string;
    email: string;
    bio: string;
    avatar: string;
}

export interface Webinar {
    id: string;
    title: string;
    description: string;
    type: 'Live' | 'Recorded';
    scheduleDate: string;
    duration: number;
    videoUrl?: string;
    meetingUrl?: string;
    presenterId: string;
    presenterName?: string;
    thumbnailUrl?: string;
    isFree: boolean;
    price: number;
}

export interface VimeoAccount {
    id: number;
    name: string;
    api_key_identifier: string;
    connected_at: string;
}

export interface VimeoVideo {
    id: number;
    video_id: string;
    title: string;
    link: string;
    description: string;
    duration: number;
    thumbnail_url: string;
    upload_date: string;
}
