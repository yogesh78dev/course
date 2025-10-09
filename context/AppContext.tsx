import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { User, Course, Sale, Category, Notification, UserRole, Review, ReviewStatus, Coupon, SentNotification, NotificationTemplate, Instructor } from '../types';
import * as api from '../services/api';

// FIX: Add Promotion interface for promotion popup state
interface Promotion {
    show: boolean;
    title: string;
    description: string;
}

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

interface AppContextType {
    courses: Course[];
    setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    sales: Sale[];
    setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    instructors: Instructor[];
    setInstructors: React.Dispatch<React.SetStateAction<Instructor[]>>;
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
    reviews: Review[];
    setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
    coupons: Coupon[];
    setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
    sentNotifications: SentNotification[];
    notificationTemplates: NotificationTemplate[];
    vimeoVideos: { id: string; title: string; url: string; }[];
    addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
    updateCourse: (course: Course) => Promise<void>;
    deleteCourse: (id: string) => Promise<void>;
    addCategory: (name: string) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    updateCategory: (category: Category) => Promise<void>;
    addUser: (user: Omit<User, 'id' | 'avatar' | 'joinedDate' | 'enrolledCourses' | 'watchHistory'>) => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    addInstructor: (instructor: Omit<Instructor, 'id' | 'avatar'>) => Promise<void>;
    updateInstructor: (instructor: Instructor) => Promise<void>;
    deleteInstructor: (id: string) => Promise<void>;
    updateReviewStatus: (reviewId: string, status: ReviewStatus) => Promise<void>;
    deleteReview: (reviewId: string) => Promise<void>;
    addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => Promise<void>;
    updateCoupon: (coupon: Coupon) => Promise<void>;
    deleteCoupon: (id: string) => Promise<void>;
    sendNotification: (notificationData: Omit<SentNotification, 'id' | 'sentDate'>) => Promise<void>;
    addNotificationTemplate: (templateData: Omit<NotificationTemplate, 'id'>) => Promise<void>;
    updateNotificationTemplate: (template: NotificationTemplate) => Promise<void>;
    deleteNotificationTemplate: (id: string) => Promise<void>;
    updateSaleStatus: (saleId: string, status: Sale['status']) => Promise<void>;
    currentStudent: User | null;
    setCurrentStudent: React.Dispatch<React.SetStateAction<User | null>>;
    loading: boolean;
    error: string | null;
    fetchAllData: () => Promise<void>;
    clearAllData: () => void;
    // FIX: Add promotion and setPromotion to context type
    promotion: Promotion;
    setPromotion: React.Dispatch<React.SetStateAction<Promotion>>;
    toasts: Toast[];
    addToast: (message: string, type: 'success' | 'error') => void;
    removeToast: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const vimeoVideos = [
    { id: 'vid-1', title: 'Introduction to React', url: 'https://vimeo.com/123456' },
    { id: 'vid-2', title: 'State and Props', url: 'https://vimeo.com/123457' },
    { id: 'vid-3', title: 'Python Basics', url: 'https://vimeo.com/234567' },
    { id: 'vid-4', title: 'Data Analysis with Pandas', url: 'https://vimeo.com/234568' },
    { id: 'vid-5', title: 'Design Principles', url: 'https://vimeo.com/345678' },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
    const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>([]);
    const [promotion, setPromotion] = useState<Promotion>({ show: false, title: '', description: '' });
    const [currentStudent, setCurrentStudent] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: 'success' | 'error') => {
        setToasts(prev => [...prev, { id: Date.now(), message, type }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);
    
    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [
                coursesRes, usersRes, salesRes, categoriesRes, instructorsRes, 
                reviewsRes, couponsRes, templatesRes, historyRes
            ] = await Promise.all([
                api.getCourses(), api.getUsers(), api.getSales(), api.getCategories(),
                api.getInstructors(), api.getReviews(), api.getCoupons(),
                api.getNotificationTemplates(), api.getNotificationHistory(),
            ]);

            setCourses(coursesRes.data);
            setUsers(usersRes.data);
            setSales(salesRes.data);
            setCategories(categoriesRes.data);
            setInstructors(instructorsRes.data);
            setReviews(reviewsRes.data);
            setCoupons(couponsRes.data);
            setNotificationTemplates(templatesRes.data);
            setSentNotifications(historyRes.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
            addToast(err.message || 'Failed to fetch data', 'error');
            if (err.message.includes('Unauthorized')) {
                localStorage.removeItem('authToken');
                window.location.reload();
            }
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    const clearAllData = useCallback(() => {
        setCourses([]); setUsers([]); setSales([]); setCategories([]);
        setInstructors([]); setNotifications([]); setReviews([]); setCoupons([]);
        setSentNotifications([]); setNotificationTemplates([]); setCurrentStudent(null);
    }, []);
    
    // Wrapped API calls to update state
    const performApiCall = useCallback(async <T,>(apiCall: () => Promise<T>, successMessage: string, errorMessage: string) => {
        try {
            const result = await apiCall();
            addToast(successMessage, 'success');
            return result;
        } catch (e: any) {
            addToast(e.message || errorMessage, 'error');
            throw e;
        }
    }, [addToast]);

    const addCourse = useCallback((courseData: Omit<Course, 'id'>) => performApiCall(async () => {
        const res = await api.createCourse(courseData);
        setCourses(prev => [res.data, ...prev]);
    }, 'Course created successfully!', 'Failed to create course.'), [performApiCall]);

    const updateCourse = useCallback((updatedCourse: Course) => performApiCall(async () => {
        const res = await api.updateCourse(updatedCourse);
        setCourses(prev => prev.map(c => c.id === res.data.id ? res.data : c));
    }, 'Course updated successfully!', 'Failed to update course.'), [performApiCall]);
    
    const deleteCourse = useCallback((id: string) => performApiCall(async () => {
        await api.deleteCourse(id);
        setCourses(prev => prev.filter(c => c.id !== id));
    }, 'Course deleted successfully.', 'Failed to delete course.'), [performApiCall]);

    const addCategory = useCallback((name: string) => performApiCall(async () => {
        const res = await api.createCategory({ name });
        setCategories(prev => [...prev, res.data]);
    }, 'Category created successfully!', 'Failed to create category.'), [performApiCall]);

    const deleteCategory = useCallback((id: string) => performApiCall(async () => {
        await api.deleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
    }, 'Category deleted successfully.', 'Failed to delete category.'), [performApiCall]);

    const updateCategory = useCallback((updatedCategory: Category) => performApiCall(async () => {
        const res = await api.updateCategory(updatedCategory);
        setCategories(prev => prev.map(c => c.id === res.data.id ? res.data : c));
    }, 'Category updated successfully!', 'Failed to update category.'), [performApiCall]);

    const addUser = useCallback((userData: any) => performApiCall(async () => {
        const res = await api.createUser(userData);
        setUsers(prev => [res.data, ...prev]);
    }, 'User created successfully!', 'Failed to create user.'), [performApiCall]);

    const updateUser = useCallback((updatedUser: User) => performApiCall(async () => {
        const res = await api.updateUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === res.data.id ? res.data : u));
    }, 'User updated successfully!', 'Failed to update user.'), [performApiCall]);

    const deleteUser = useCallback((id: string) => performApiCall(async () => {
        await api.deleteUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
    }, 'User deleted successfully.', 'Failed to delete user.'), [performApiCall]);

    const addInstructor = useCallback((instructorData: any) => performApiCall(async () => {
        const res = await api.createInstructor(instructorData);
        setInstructors(prev => [res.data, ...prev]);
    }, 'Instructor created successfully!', 'Failed to create instructor.'), [performApiCall]);
    
    const updateInstructor = useCallback((updatedInstructor: Instructor) => performApiCall(async () => {
        const res = await api.updateInstructor(updatedInstructor);
        setInstructors(prev => prev.map(i => i.id === res.data.id ? res.data : i));
    }, 'Instructor updated successfully!', 'Failed to update instructor.'), [performApiCall]);
    
    const deleteInstructor = useCallback((id: string) => performApiCall(async () => {
        await api.deleteInstructor(id);
        setInstructors(prev => prev.filter(i => i.id !== id));
    }, 'Instructor deleted successfully.', 'Failed to delete instructor.'), [performApiCall]);
    
    const updateReviewStatus = useCallback((reviewId: string, status: ReviewStatus) => performApiCall(async () => {
        const res = await api.updateReviewStatus(reviewId, status);
        setReviews(prev => prev.map(r => r.id === res.data.id ? res.data : r));
    }, 'Review status updated.', 'Failed to update review status.'), [performApiCall]);

    const deleteReview = useCallback((reviewId: string) => performApiCall(async () => {
        await api.deleteReview(reviewId);
        setReviews(prev => prev.filter(r => r.id !== reviewId));
    }, 'Review deleted successfully.', 'Failed to delete review.'), [performApiCall]);

    const addCoupon = useCallback((couponData: any) => performApiCall(async () => {
        const res = await api.createCoupon(couponData);
        setCoupons(prev => [res.data, ...prev]);
    }, 'Coupon created successfully!', 'Failed to create coupon.'), [performApiCall]);

    const updateCoupon = useCallback((updatedCoupon: Coupon) => performApiCall(async () => {
        const res = await api.updateCoupon(updatedCoupon);
        setCoupons(prev => prev.map(c => c.id === res.data.id ? res.data : c));
    }, 'Coupon updated successfully!', 'Failed to update coupon.'), [performApiCall]);

    const deleteCoupon = useCallback((id: string) => performApiCall(async () => {
        await api.deleteCoupon(id);
        setCoupons(prev => prev.filter(c => c.id !== id));
    }, 'Coupon deleted successfully.', 'Failed to delete coupon.'), [performApiCall]);
    
    const sendNotification = useCallback((notificationData: any) => performApiCall(async () => {
        const res = await api.sendNotification(notificationData);
        setSentNotifications(prev => [res.data, ...prev]);
        const newInAppNotification: Notification = {
            id: `not-${Date.now()}`, title: res.data.title, message: res.data.message,
            timestamp: 'Just now', read: false,
        };
        setNotifications(prev => [newInAppNotification, ...prev]);
    }, 'Notification sent successfully!', 'Failed to send notification.'), [performApiCall]);

    const addNotificationTemplate = useCallback((templateData: any) => performApiCall(async () => {
        const res = await api.createNotificationTemplate(templateData);
        setNotificationTemplates(prev => [res.data, ...prev]);
    }, 'Template created successfully!', 'Failed to create template.'), [performApiCall]);

    const updateNotificationTemplate = useCallback((template: NotificationTemplate) => performApiCall(async () => {
        const res = await api.updateNotificationTemplate(template);
        setNotificationTemplates(prev => prev.map(t => t.id === res.data.id ? res.data : t));
    }, 'Template updated successfully!', 'Failed to update template.'), [performApiCall]);

    const deleteNotificationTemplate = useCallback((id: string) => performApiCall(async () => {
        await api.deleteNotificationTemplate(id);
        setNotificationTemplates(prev => prev.filter(t => t.id !== id));
    }, 'Template deleted successfully.', 'Failed to delete template.'), [performApiCall]);

    const updateSaleStatus = useCallback((saleId: string, status: Sale['status']) => performApiCall(async () => {
        const res = await api.updateSaleStatus(saleId, status);
        setSales(prev => prev.map(s => s.id === res.data.id ? res.data : s));
    }, 'Sale status updated.', 'Failed to update sale status.'), [performApiCall]);

    return (
        <AppContext.Provider value={{ 
            courses, setCourses, users, setUsers, sales, setSales, 
            categories, setCategories, instructors, setInstructors, notifications, setNotifications,
            reviews, setReviews, coupons, setCoupons, sentNotifications,
            notificationTemplates, vimeoVideos,
            addCourse, updateCourse, deleteCourse,
            addCategory, deleteCategory, updateCategory,
            addUser, updateUser, deleteUser,
            addInstructor, updateInstructor, deleteInstructor,
            updateReviewStatus, deleteReview,
            addCoupon, updateCoupon, deleteCoupon,
            sendNotification,
            addNotificationTemplate, updateNotificationTemplate, deleteNotificationTemplate,
            updateSaleStatus,
            currentStudent, setCurrentStudent,
            loading, error,
            fetchAllData, clearAllData,
            promotion, setPromotion,
            toasts, addToast, removeToast,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};