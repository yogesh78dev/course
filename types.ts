export enum UserRole {
  STUDENT = 'Student',
  GOLD_MEMBER = 'Gold Member',
  ADMIN = 'Admin',
}

export interface Enrollment {
  courseId: string;
  enrollmentDate: string;
  expiryDate: string | null; // null for lifetime
  completionPercentage: number;
}

export interface WatchHistoryEntry {
  lessonId: string;
  courseId: string;
  watchedAt: string; // ISO date string
  progress: number; // Percentage 0-100
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  status: 'Active' | 'Inactive';
  role: UserRole;
  joinedDate: string;
  avatar: string;
  enrolledCourses: Enrollment[];
  watchHistory: WatchHistoryEntry[];
}

export interface Category {
  id: string;
  name: string;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'pdf' | 'quiz' | 'assignment';
  contentUrl: string; // Vimeo video URL, etc.
  duration: number; // in minutes
  tags: string[];
  attachmentUrl: string; // URL for an attached PDF/image
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
  modules: Module[];
  posterImageUrl: string;
  bannerImageUrl: string;
  introVideoUrl: string;
  accessType: 'lifetime' | 'expiry';
  accessDuration: number | null; // in days
  enableCertificate: boolean;
}

export interface Sale {
  id: string;
  user: Pick<User, 'id' | 'name'>;
  course: Pick<Course, 'id' | 'title'>;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Failed';
}

export interface Notification {
  id:string;
  title?: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export enum ReviewStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    HIDDEN = 'Hidden',
}

export interface Review {
    id: string;
    courseId: string;
    userId: string;
    rating: number; // 1-5
    comment: string;
    date: string;
    status: ReviewStatus;
}

export enum CouponType {
    PERCENTAGE = 'Percentage',
    FIXED = 'Fixed Amount',
}

export interface Coupon {
    id: string;
    code: string;
    type: CouponType;
    value: number;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    usageCount: number;
    usageLimit: number | null; // null for unlimited
    courseIds: string[]; // empty array means it applies to all courses
    firstTimeBuyerOnly: boolean;
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

export interface NotificationAction {
    type: NotificationActionType;
    payload?: string; // e.g., courseId or couponId
}

export enum NotificationChannel {
    IN_APP = 'In-App',
    PUSH = 'Push',
}

export interface NotificationTemplate {
    id: string;
    name: string;
    title: string;
    message: string;
    target: NotificationTarget;
    action: NotificationAction;
}

export interface SentNotification {
    id: string;
    title: string;
    message: string;
    target: NotificationTarget;
    action: NotificationAction;
    sentDate: string;
    channels: NotificationChannel[];
}

export interface Promotion {
    show: boolean;
    title: string;
    description: string;
}

export interface Certificate {
    id: string;
    userId: string;
    courseId: string;
    certificateCode: string;
    issueDate: string;
    courseTitle: string;
    instructorName: string;
}

// Student-specific types for mobile app functionality
export interface StudentReview {
    rating: number;
    comment: string;
}

export interface WatchHistoryMap {
    [lessonId: string]: { progress: number };
}

export interface CourseDetailsPayload {
    course: Course;
    watchHistory: { lessonId: string; progress: number }[];
    myReview: StudentReview | null;
    completionPercentage: number;
    myCertificate: { id: string, certificateCode: string, issueDate: string } | null;
}