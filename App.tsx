import React, { useState, Suspense, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { useAppContext } from './context/AppContext';
import Login from './features/auth/Login';
import StudentPortal from './features/student-portal/StudentPortal';
import StudentHeader from './components/layout/StudentHeader';

export type View = 'Dashboard' | 'Courses' | 'Instructors' | 'Users' | 'Sales & Analytics' | 'Coupons' | 'Reviews' | 'Notifications' | 'Settings';

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>
);

const DashboardView = React.lazy(() => import('./features/dashboard/Dashboard'));
const CoursesView = React.lazy(() => import('./features/courses/Courses'));
const UsersView = React.lazy(() => import('./features/users/Users'));
const InstructorsView = React.lazy(() => import('./features/instructors/Instructors'));
const SalesAnalyticsView = React.lazy(() => import('./features/sales/SalesAnalytics'));
const SettingsView = React.lazy(() => import('./features/settings/Settings'));
const ReviewsView = React.lazy(() => import('./features/reviews/Reviews'));
const CouponsView = React.lazy(() => import('./features/coupons/Coupons'));
const NotificationsView = React.lazy(() => import('./features/notifications/Notifications'));

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('Dashboard');
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));
    const [isStudentView, setIsStudentView] = useState(false);
    const { fetchAllData, clearAllData, setCurrentStudent, users } = useAppContext();

    useEffect(() => {
        if(isLoggedIn) {
            fetchAllData();
        }
    }, [isLoggedIn, fetchAllData]);

    const handleLogin = (token: string) => {
        localStorage.setItem('authToken', token);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('authToken');
            setIsLoggedIn(false);
            setIsStudentView(false);
            setCurrentStudent(null);
            clearAllData();
        }
    };
    
    const handleToggleStudentView = () => {
        if (isStudentView) {
            setIsStudentView(false);
            setCurrentStudent(null);
        } else {
            const firstStudent = users.find(u => u.role !== 'Admin');
            if (firstStudent) {
                setCurrentStudent(firstStudent);
                setIsStudentView(true);
            } else {
                alert("No student users found to switch to.");
            }
        }
    };

    const renderView = () => {
        switch (currentView) {
            case 'Dashboard': return <DashboardView />;
            case 'Courses': return <CoursesView />;
            case 'Instructors': return <InstructorsView />;
            case 'Users': return <UsersView setIsStudentView={setIsStudentView} />;
            case 'Sales & Analytics': return <SalesAnalyticsView />;
            case 'Coupons': return <CouponsView />;
            case 'Reviews': return <ReviewsView />;
            case 'Notifications': return <NotificationsView />;
            case 'Settings': return <SettingsView />;
            default: return <DashboardView />;
        }
    };

    if (!isLoggedIn) {
        return <Login onLogin={handleLogin} />;
    }

    if (isStudentView) {
        return (
             <div className="flex h-screen bg-gray-100 text-gray-800">
                <div className="flex-1 flex flex-col overflow-hidden">
                    <StudentHeader onLogout={handleLogout} onExitStudentView={handleToggleStudentView} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-8">
                        <Suspense fallback={<LoadingSpinner />}>
                            <StudentPortal />
                        </Suspense>
                    </main>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-100 text-gray-800">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onToggleStudentView={handleToggleStudentView} onLogout={handleLogout} setCurrentView={setCurrentView} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-8">
                    <Suspense fallback={<LoadingSpinner />}>
                        {renderView()}
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export default App;