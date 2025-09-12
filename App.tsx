import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './features/dashboard/Dashboard';
import Courses from './features/courses/Courses';
import Users from './features/users/Users';
import Instructors from './features/instructors/Instructors';
import SalesAnalytics from './features/sales/SalesAnalytics';
import Settings from './features/settings/Settings';
import Reviews from './features/reviews/Reviews';
import Coupons from './features/coupons/Coupons';
import Notifications from './features/notifications/Notifications';
import Login from './features/auth/Login';
import { useAppContext } from './context/AppContext';
import PromotionPopup from './components/ui/PromotionPopup';
import StudentPortal from './features/student-portal/StudentPortal';
import * as api from './services/api';
import { UserRole } from './types';

export type View = 'Dashboard' | 'Courses' | 'Instructors' | 'Users' | 'Sales & Analytics' | 'Coupons' | 'Reviews' | 'Notifications' | 'Settings';

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));
    const [currentView, setCurrentView] = useState<View>('Dashboard');
    const [isStudentView, setIsStudentView] = useState(false);
    const { promotion, loading, fetchAllData, clearAllData, users, setCurrentStudent } = useAppContext();

    useEffect(() => {
        if (isLoggedIn) {
            fetchAllData();
        }
    }, [isLoggedIn, fetchAllData]);

    const handleLogin = (token: string) => {
        localStorage.setItem('authToken', token);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsLoggedIn(false);
        setIsStudentView(false); // Exit student view on logout
        clearAllData();
    };
    
    const toggleStudentView = async () => {
      if (!isStudentView) {
        // Find a sample student to view the portal as
        const sampleStudent = users.find(u => u.role !== UserRole.ADMIN);
        if (sampleStudent) {
            try {
                // For a true simulation, we fetch the full student profile including enrollments and history
                const profileRes = await api.getStudentProfile(sampleStudent.id);
                setCurrentStudent(profileRes.data);
                setIsStudentView(true);
            } catch (error) {
                console.error("Failed to fetch student profile for simulation:", error);
                alert("Could not load student profile data.");
            }
        } else {
            alert("No student users found to simulate the student view.");
        }
      } else {
          setCurrentStudent(null);
          setIsStudentView(false);
      }
    };

    const renderAdminView = () => {
        switch (currentView) {
            case 'Dashboard':
                return <Dashboard />;
            case 'Courses':
                return <Courses />;
            case 'Instructors':
                return <Instructors />;
            case 'Users':
                return <Users />;
            case 'Sales & Analytics':
                return <SalesAnalytics />;
            case 'Coupons':
                return <Coupons />;
            case 'Reviews':
                return <Reviews />;
            case 'Notifications':
                return <Notifications />;
            case 'Settings':
                return <Settings />;
            default:
                return <Dashboard />;
        }
    };

    if (!isLoggedIn) {
        return <Login onLogin={handleLogin} />;
    }

    if (isStudentView) {
        return <StudentPortal onLogout={handleLogout} onExitStudentView={toggleStudentView} />;
    }
    
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 text-gray-800">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onToggleStudentView={toggleStudentView} onLogout={handleLogout}/>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-8">
                    {renderAdminView()}
                </main>
            </div>
            {promotion.show && currentView === 'Dashboard' && <PromotionPopup />}
        </div>
    );
};

export default App;
