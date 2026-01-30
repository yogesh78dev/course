
import React from 'react';
import type { View } from '../../App';
import { DashboardIcon, CoursesIcon, UsersIcon, SalesIcon, ReviewsIcon, SettingsIcon, CouponIcon, BellIcon, InstructorIcon, LogoutIcon, CloseIcon, WebinarIcon, VideoIcon } from '../icons/index';

const PhotographIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    currentView: View;
    setCurrentView: (view: View) => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, currentView, setCurrentView, onLogout }) => {
    
    const navItems: { name: View; icon: React.ReactNode }[] = [
        { name: 'Dashboard', icon: <DashboardIcon className="w-5 h-5" /> },
        { name: 'Banners', icon: <PhotographIcon className="w-5 h-5" /> },
        { name: 'Courses', icon: <CoursesIcon className="w-5 h-5" /> },
        { name: 'Vimeo', icon: <VideoIcon className="w-5 h-5" /> },
        { name: 'Instructors', icon: <InstructorIcon className="w-5 h-5" /> },
        { name: 'Webinars', icon: <WebinarIcon className="w-5 h-5" /> },
        { name: 'Users', icon: <UsersIcon className="w-5 h-5" /> },
        { name: 'Sales & Analytics', icon: <SalesIcon className="w-5 h-5" /> },
        { name: 'Coupons', icon: <CouponIcon className="w-5 h-5" /> },
        { name: 'Reviews', icon: <ReviewsIcon className="w-5 h-5" /> },
        { name: 'Notifications', icon: <BellIcon className="w-5 h-5" /> },
        { name: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
    ];

    const handleItemClick = (view: View) => {
        setCurrentView(view);
        if (window.innerWidth < 768) setIsOpen(false);
    }

    return (
        <>
            <div
                className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            ></div>

            <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xs">G</div>
                        <h1 className="text-lg font-black text-gray-900 tracking-tight">CreatorGuru</h1>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-gray-900">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto scrollbar-hide">
                    <p className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => handleItemClick(item.name)}
                            className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                                currentView === item.name
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <span className={`${currentView === item.name ? 'text-white' : 'text-gray-400 group-hover:text-primary'} transition-colors`}>
                                {item.icon}
                            </span>
                            <span className="ml-3 text-xs">{item.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-50">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-gray-400 font-bold hover:bg-red-50 hover:text-red-600 text-xs"
                    >
                        <LogoutIcon className="w-5 h-5" />
                        <span className="ml-3">Log Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
