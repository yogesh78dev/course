import { Course, User, Instructor, Category, ReviewStatus, Coupon, NotificationTemplate, Sale, StudentReview, Review, Certificate, Webinar } from "../types";

// const API_URL = 'http://72.60.99.203:5000/api';
const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('authToken');

const request = async (endpoint: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
            const errorMessage = errorData.message || `An unknown error occurred. Status: ${response.status}`;
            
            if (response.status === 401 && endpoint !== '/auth/login-admin') {
                // For protected routes, a 401 means the token is invalid or expired.
                throw new Error('Unauthorized: Please log in again.');
            }
            
            // For login failures or other errors, use the server's message.
            throw new Error(errorMessage);
        }

        if (response.status === 204) { // No Content
            return;
        }

        return response.json();
    } catch (error) {
        console.error(`API call failed: ${endpoint}`, error);
        throw error;
    }
};

// Auth
export const login = (email: string, password: string): Promise<{ token: string }> => request('/auth/login-admin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
});
export const registerSendOtp = (data: any) => request('/auth/register-send-otp', { method: 'POST', body: JSON.stringify(data) });
export const registerVerifyAndCreate = (data: any) => request('/auth/register-verify-and-create', { method: 'POST', body: JSON.stringify(data) });


// Courses
export const getCourses = () => request('/courses');
export const createCourse = (data: Omit<Course, 'id'>) => request('/courses', { method: 'POST', body: JSON.stringify(data) });
export const updateCourse = (data: Course) => request(`/courses/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCourse = (id: string) => request(`/courses/${id}`, { method: 'DELETE' });

// Users
export const getUsers = () => request('/users');
export const createUser = (data: Partial<User>) => request('/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = (data: User) => request(`/users/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUser = (id: string) => request(`/users/${id}`, { method: 'DELETE' });
export const changePassword = (passwords: { currentPassword: string, newPassword: string }) => request('/users/change-password', {
    method: 'POST',
    body: JSON.stringify(passwords)
});


// Instructors
export const getInstructors = () => request('/instructors');
export const createInstructor = (data: Omit<Instructor, 'id' | 'avatar'>) => request('/instructors', { method: 'POST', body: JSON.stringify(data) });
export const updateInstructor = (data: Instructor) => request(`/instructors/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteInstructor = (id: string) => request(`/instructors/${id}`, { method: 'DELETE' });

// Categories (Settings)
export const getCategories = () => request('/settings/categories');
export const createCategory = (data: { name: string }) => request('/settings/categories', { method: 'POST', body: JSON.stringify(data) });
export const updateCategory = (data: Category) => request(`/settings/categories/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCategory = (id: string) => request(`/settings/categories/${id}`, { method: 'DELETE' });

// Sales & Analytics
export const getSales = () => request('/sales');
export const updateSaleStatus = (id: string, status: Sale['status']) => request(`/sales/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
export const getAnalytics = () => request('/sales/analytics');

// Reviews
export const getReviews = () => request('/reviews');
export const updateReviewStatus = (id: string, status: ReviewStatus) => request(`/reviews/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
export const deleteReview = (id: string) => request(`/reviews/${id}`, { method: 'DELETE' });

// Coupons
export const getCoupons = () => request('/coupons');
export const createCoupon = (data: Omit<Coupon, 'id' | 'usageCount'>) => request('/coupons', { method: 'POST', body: JSON.stringify(data) });
export const updateCoupon = (data: Coupon) => request(`/coupons/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCoupon = (id: string) => request(`/coupons/${id}`, { method: 'DELETE' });

// Notifications
export const getNotificationTemplates = () => request('/notifications/templates');
export const createNotificationTemplate = (data: Omit<NotificationTemplate, 'id'>) => request('/notifications/templates', { method: 'POST', body: JSON.stringify(data) });
export const updateNotificationTemplate = (data: NotificationTemplate) => request(`/notifications/templates/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteNotificationTemplate = (id: string) => request(`/notifications/templates/${id}`, { method: 'DELETE' });
export const getNotificationHistory = () => request('/notifications/history');
export const sendNotification = (data: any) => request('/notifications/send', { method: 'POST', body: JSON.stringify(data) });

// Webinars
export const getWebinars = () => request('/webinars');
export const createWebinar = (data: Omit<Webinar, 'id'>) => request('/webinars', { method: 'POST', body: JSON.stringify(data) });
export const updateWebinar = (data: Webinar) => request(`/webinars/${data.id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteWebinar = (id: string) => request(`/webinars/${id}`, { method: 'DELETE' });


// Admin-facing User Profile
export const getStudentProfile = (userId: string) => request(`/users/profile/${userId}`);

// Student-facing APIs (for mobile app)
export const getStudentEnrolledCourses = () => request('/student/my-courses');
export const getStudentEnrolledCourseDetails = (courseId: string) => request(`/student/my-courses/${courseId}`);
export const updateStudentLessonProgress = (lessonId: string, progress: number): Promise<{ data: { newCompletionPercentage: number } }> => request('/student/my-courses/progress', {
    method: 'POST',
    body: JSON.stringify({ lessonId, progress }),
});
export const submitStudentCourseReview = (courseId: string, rating: number, comment: string): Promise<{ data: Review }> => request(`/student/courses/${courseId}/review`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
});

// --- Certificate APIs ---
export const claimCertificate = (courseId: string): Promise<{ data: Certificate }> => request(`/student/my-courses/${courseId}/claim-certificate`, { method: 'POST' });
export const getMyCertificates = (): Promise<{ data: Certificate[] }> => request('/student/my-certificates');


// --- Purchase Flow APIs ---
export const initiatePurchase = (courseId: string, couponCode?: string) => request('/student/purchase/initiate', {
    method: 'POST',
    body: JSON.stringify({ courseId, couponCode }),
});

export const verifyPayment = (paymentData: {
    saleId: string;
    gatewayOrderId: string;
    gatewayPaymentId: string;
    gatewaySignature: string;
}) => request('/student/purchase/verify', {
    method: 'POST',
    body: JSON.stringify(paymentData),
});

export const getMySalesHistory = () => request('/student/purchase/history');