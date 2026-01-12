
import { User, Course, Sale, Category, Notification, Review, ReviewStatus, Coupon, SentNotification, NotificationTemplate, Instructor, Webinar, VimeoAccount, VimeoVideo, Promotion } from "../types";

// const API_BASE_URL = 'http://72.60.99.203:5000/api';
const API_BASE_URL = 'https://admin.creatorguru.in/api';
// const API_BASE_URL = 'http://localhost:5000/api';

// Shared request helper
const request = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
    
    // Global 401 Unauthorized handling (token expired/invalid)
    if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.dispatchEvent(new Event('auth-expired'));
        throw new Error('Your session has expired. Please log in again.');
    }

    if (response.status === 204) return null;
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    return data;
};

// Auth
export const login = (email: string, password: string): Promise<{ token: string, user: any }> => 
    request('/auth/login-admin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

export const changePassword = (data: any) => request('/users/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
});

// Courses
export const getCourses = (): Promise<{ data: Course[] }> => request('/courses');
export const getCourseById = (id: string): Promise<{ data: Course }> => request(`/courses/${id}`);
export const createCourse = (data: Omit<Course, 'id'>): Promise<{ data: Course }> => request('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
});
export const updateCourse = (data: Course): Promise<{ data: Course }> => request(`/courses/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
});
export const deleteCourse = (id: string) => request(`/courses/${id}`, { method: 'DELETE' });

// Users
export const getUsers = (): Promise<{ data: User[] }> => request('/users');
export const createUser = (data: any): Promise<{ data: User }> => request('/users', {
    method: 'POST',
    body: JSON.stringify(data),
});
export const updateUser = (data: User): Promise<{ data: User }> => request(`/users/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
});
export const deleteUser = (id: string) => request(`/users/${id}`, { method: 'DELETE' });
export const getStudentProfile = (id: string): Promise<{ data: User }> => request(`/users/profile/${id}`);

// Instructors
export const getInstructors = (): Promise<{ data: Instructor[] }> => request('/instructors');
export const createInstructor = (data: any): Promise<{ data: Instructor }> => request('/instructors', {
    method: 'POST',
    body: JSON.stringify(data),
});
export const updateInstructor = (data: Instructor): Promise<{ data: Instructor }> => request(`/instructors/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
});
export const deleteInstructor = (id: string) => request(`/instructors/${id}`, { method: 'DELETE' });

// Sales
export const getSales = (): Promise<{ data: Sale[] }> => request('/sales');
export const updateSaleStatus = (id: string, status: string): Promise<{ data: Sale }> => request(`/sales/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
});

// Categories
export const getCategories = (): Promise<{ data: Category[] }> => request('/settings/categories');
export const createCategory = (data: { name: string }): Promise<{ data: Category }> => request('/settings/categories', {
    method: 'POST',
    body: JSON.stringify(data),
});
export const updateCategory = (data: Category): Promise<{ data: Category }> => request(`/settings/categories/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
});
export const deleteCategory = (id: string) => request(`/settings/categories/${id}`, { method: 'DELETE' });

// Coupons
export const getCoupons = (): Promise<{ data: Coupon[] }> => request('/coupons');
export const createCoupon = (data: any): Promise<{ data: Coupon }> => request('/coupons', {
    method: 'POST',
    body: JSON.stringify(data),
});
export const updateCoupon = (data: Coupon): Promise<{ data: Coupon }> => request(`/coupons/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
});
export const deleteCoupon = (id: string) => request(`/coupons/${id}`, { method: 'DELETE' });

// Notifications
export const getNotificationHistory = (): Promise<{ data: SentNotification[] }> => request('/notifications/history');
export const sendNotification = (data: any): Promise<{ data: SentNotification }> => request('/notifications/send', {
    method: 'POST',
    body: JSON.stringify(data),
});
export const getNotificationTemplates = (): Promise<{ data: NotificationTemplate[] }> => request('/notifications/templates');
export const createNotificationTemplate = (data: any): Promise<{ data: NotificationTemplate }> => request('/notifications/templates', {
    method: 'POST',
    body: JSON.stringify(data),
});
export const updateNotificationTemplate = (data: NotificationTemplate): Promise<{ data: NotificationTemplate }> => request(`/notifications/templates/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
});
export const deleteNotificationTemplate = (id: string) => request(`/notifications/templates/${id}`, { method: 'DELETE' });

// Webinars
export const getWebinars = (): Promise<{ data: Webinar[] }> => request('/webinars');
export const createWebinar = (data: Omit<Webinar, 'id'>): Promise<{ data: Webinar }> => request('/webinars', {
    method: 'POST',
    body: JSON.stringify(data),
});
export const updateWebinar = (data: Webinar): Promise<{ data: Webinar }> => request(`/webinars/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
});
export const deleteWebinar = (id: string) => request(`/webinars/${id}`, { method: 'DELETE' });

// Reviews
export const getReviews = (): Promise<{ data: Review[] }> => request('/reviews');
export const updateReviewStatus = (id: string, status: ReviewStatus): Promise<{ data: Review }> => request(`/reviews/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
});
export const deleteReview = (id: string) => request(`/reviews/${id}`, { method: 'DELETE' });

// Vimeo
export const getVimeoAccounts = (): Promise<VimeoAccount[]> => request('/vimeo/accounts');
export const addVimeoAccount = (data: { name: string, apiKey: string }): Promise<VimeoAccount> => request('/vimeo/accounts', {
    method: 'POST',
    body: JSON.stringify(data),
});
export const removeVimeoAccount = (id: number) => request(`/vimeo/accounts/${id}`, { method: 'DELETE' });
export const getVimeoVideos = (): Promise<VimeoVideo[]> => request('/vimeo/videos');
export const syncVimeoVideos = (): Promise<VimeoVideo[]> => request('/vimeo/sync', { method: 'POST' });

// Promotions (Banners)
export const getPromotions = (): Promise<{ data: Promotion[] }> => request('/promotions');
export const savePromotion = (data: Partial<Promotion>): Promise<{ data: Promotion }> => request('/promotions', {
    method: 'POST',
    body: JSON.stringify(data),
});
export const deletePromotion = (id: string) => request(`/promotions/${id}`, { method: 'DELETE' });
