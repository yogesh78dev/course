
import React from 'react';
import type { View } from '../App';
import { DashboardIcon, CoursesIcon, UsersIcon, SalesIcon, ReviewsIcon, SettingsIcon, CouponIcon, BellIcon, InstructorIcon, LogoutIcon } from './icons';

interface SidebarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLogout }) => {
    
    const navItems: { name: View; icon: React.ReactNode }[] = [
        { name: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
        { name: 'Courses', icon: <CoursesIcon className="w-6 h-6" /> },
        { name: 'Instructors', icon: <InstructorIcon className="w-6 h-6" /> },
        { name: 'Users', icon: <UsersIcon className="w-6 h-6" /> },
        { name: 'Sales & Analytics', icon: <SalesIcon className="w-6 h-6" /> },
        { name: 'Coupons', icon: <CouponIcon className="w-6 h-6" /> },
        { name: 'Reviews', icon: <ReviewsIcon className="w-6 h-6" /> },
        { name: 'Notifications', icon: <BellIcon className="w-6 h-6" /> },
        { name: 'Settings', icon: <SettingsIcon className="w-6 h-6" /> },
    ];

    return (
        <aside className="w-64 bg-white text-gray-700 flex-shrink-0 flex flex-col border-r border-gray-200">
            <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-primary">CourseAdmin</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => setCurrentView(item.name)}
                        className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                            currentView === item.name
                                ? 'bg-primary-50 text-primary font-semibold'
                                : 'hover:bg-gray-100'
                        }`}
                    >
                        {item.icon}
                        <span className="ml-4">{item.name}</span>
                    </button>
                ))}
            </nav>
            <div className="px-4 py-4 border-t border-gray-200">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 text-gray-600 hover:bg-red-50 hover:text-red-600"
                >
                    <LogoutIcon className="w-6 h-6" />
                    <span className="ml-4 font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;