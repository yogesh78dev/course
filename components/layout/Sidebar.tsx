
import React from 'react';
import type { View } from '../../App';
import { DashboardIcon, CoursesIcon, UsersIcon, SalesIcon, ReviewsIcon, SettingsIcon, CouponIcon, BellIcon, InstructorIcon, LogoutIcon, CloseIcon, WebinarIcon } from '../icons/index';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    currentView: View;
    setCurrentView: (view: View) => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, currentView, setCurrentView, onLogout }) => {
    
    const navItems: { name: View; icon: React.ReactNode }[] = [
        { name: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
        { name: 'Courses', icon: <CoursesIcon className="w-6 h-6" /> },
        { name: 'Instructors', icon: <InstructorIcon className="w-6 h-6" /> },
        { name: 'Webinars', icon: <WebinarIcon className="w-6 h-6" /> },
        { name: 'Users', icon: <UsersIcon className="w-6 h-6" /> },
        { name: 'Sales & Analytics', icon: <SalesIcon className="w-6 h-6" /> },
        { name: 'Coupons', icon: <CouponIcon className="w-6 h-6" /> },
        { name: 'Reviews', icon: <ReviewsIcon className="w-6 h-6" /> },
        { name: 'Notifications', icon: <BellIcon className="w-6 h-6" /> },
        { name: 'Settings', icon: <SettingsIcon className="w-6 h-6" /> },
    ];

    const handleItemClick = (view: View) => {
        setCurrentView(view);
        setIsOpen(false);
    }

    return (
        <>
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            ></div>

            <aside className={`fixed top-0 left-0 h-full w-64 bg-white text-gray-700 flex flex-col border-r border-gray-200 z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-primary">CourseAdmin</h1>
                    <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-gray-500 hover:text-gray-800">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => handleItemClick(item.name)}
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
        </>
    );
};

export default Sidebar;