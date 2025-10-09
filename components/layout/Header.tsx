import React, { useState } from 'react';
import { SearchIcon, BellIcon, ChevronDownIcon, MenuIcon } from '../icons/index';
import NotificationPanel from '../../features/notifications/components/NotificationPanel';
import { useAppContext } from '../../context/AppContext';
import { UserRole } from '../../types';
import { View } from '../../App';

interface HeaderProps {
    onMenuButtonClick: () => void;
    onToggleStudentView: () => void;
    onLogout: () => void;
    setCurrentView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuButtonClick, onToggleStudentView, onLogout, setCurrentView }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { notifications, users } = useAppContext();
    
    const adminUser = users.find(u => u.role === UserRole.ADMIN);
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const handleMenuClick = (action: 'profile' | 'settings' | 'studentView' | 'logout') => {
        setShowProfileMenu(false);
        switch(action) {
            case 'settings':
            case 'profile':
                setCurrentView('Settings');
                break;
            case 'studentView':
                onToggleStudentView();
                break;
            case 'logout':
                onLogout();
                break;
        }
    };


    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
            <div className="flex items-center">
                 <button onClick={onMenuButtonClick} className="text-gray-500 focus:outline-none md:hidden mr-4">
                    <MenuIcon className="h-6 w-6" />
                </button>
                <div className="relative hidden sm:block">
                    <SearchIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search courses, users..."
                        className="pl-10 pr-4 py-2 w-72 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-5">
                <div className="relative">
                    <button onClick={() => setShowNotifications(s => !s)} className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <BellIcon className="w-6 h-6 text-gray-600" />
                        {unreadCount > 0 && (
                             <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 border-2 border-white"></span>
                        )}
                    </button>
                    {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)}/>}
                </div>

                <div className="relative">
                    <button onClick={() => setShowProfileMenu(p => !p)} className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <img
                            src={adminUser?.avatar}
                            alt={adminUser?.name}
                            className="w-9 h-9 rounded-full object-cover"
                        />
                        <div className="text-left hidden sm:block">
                            <p className="text-sm font-semibold text-gray-800">{adminUser?.name}</p>
                            <p className="text-xs text-gray-500">{adminUser?.role}</p>
                        </div>
                        <ChevronDownIcon className="w-4 h-4 text-gray-500 hidden sm:block" />
                    </button>
                    {showProfileMenu && (
                         <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                             <button onClick={() => handleMenuClick('profile')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">Profile</button>
                             <button onClick={() => handleMenuClick('studentView')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                Switch to Student View
                             </button>
                             <div className="border-t border-gray-100 my-1"></div>
                             <button onClick={() => handleMenuClick('logout')} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">Logout</button>
                         </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;