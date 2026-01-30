
import React, { useState, useRef, useMemo } from 'react';
import { SearchIcon, BellIcon, ChevronDownIcon, MenuIcon, CoursesIcon, UsersIcon, VideoIcon } from '../icons/index';
import NotificationPanel from '../../features/notifications/components/NotificationPanel';
import { useAppContext } from '../../context/AppContext';
import { UserRole } from '../../types';
import { View } from '../../App';
import { useOutsideClick } from '../../hooks/useOutsideClick';

interface HeaderProps {
    onMenuButtonClick: () => void;
    onToggleStudentView: () => void;
    onLogout: () => void;
    setCurrentView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuButtonClick, onToggleStudentView, onLogout, setCurrentView }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    
    const { notifications, users, courses, vimeoVideos } = useAppContext();

    const notificationRef = useRef<HTMLDivElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    useOutsideClick(notificationRef, () => setShowNotifications(false));
    useOutsideClick(profileMenuRef, () => setShowProfileMenu(false));
    useOutsideClick(searchRef, () => setShowSearchResults(false));
    
    const adminUser = users.find(u => u.role === UserRole.ADMIN);
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const filteredResults = useMemo(() => {
        if (searchQuery.length < 2) return null;
        const q = searchQuery.toLowerCase();
        
        const matchingCourses = courses.filter(c => c.title.toLowerCase().includes(q)).slice(0, 3);
        const matchingUsers = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)).slice(0, 3);
        const matchingVimeo = vimeoVideos.filter(v => v.title.toLowerCase().includes(q)).slice(0, 3);
        
        if (matchingCourses.length === 0 && matchingUsers.length === 0 && matchingVimeo.length === 0) return null;
        
        return {
            courses: matchingCourses,
            users: matchingUsers,
            vimeo: matchingVimeo
        };
    }, [searchQuery, courses, users, vimeoVideos]);

    const handleResultClick = (view: View) => {
        setCurrentView(view);
        setSearchQuery('');
        setShowSearchResults(false);
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
            <div className="flex items-center flex-1">
                 <button onClick={onMenuButtonClick} className="text-gray-500 focus:outline-none md:hidden mr-4">
                    <MenuIcon className="h-6 w-6" />
                </button>
                <div className="relative hidden sm:block w-full max-w-md" ref={searchRef}>
                    <SearchIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Global search..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSearchResults(true);
                        }}
                        className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    />
                    
                    {showSearchResults && filteredResults && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden py-2">
                            {filteredResults.courses.length > 0 && (
                                <div className="mb-2">
                                    <h4 className="px-4 py-1 text-[10px] uppercase font-bold text-gray-400">Courses</h4>
                                    {filteredResults.courses.map(course => (
                                        <button key={course.id} onClick={() => handleResultClick('Courses')} className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">
                                            <CoursesIcon className="w-4 h-4 mr-3 text-gray-400" />
                                            <span className="truncate">{course.title}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                           {filteredResults.users.length > 0 && (
                                    <div className="mb-2">
                                        <h4 className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Users</h4>
                                        {filteredResults.users.map(user => (
                                            <button 
                                                key={user.id}
                                                onClick={() => handleResultClick('Users')}
                                                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md group"
                                            >
                                                <UsersIcon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-primary" />
                                                <div className="flex flex-col text-left truncate">
                                                    <span className="font-medium truncate">{user.name}</span>
                                                    <span className="text-xs text-gray-400 truncate">{user.email}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                {filteredResults.vimeo.length > 0 && (
                                    <div>
                                        <h4 className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Vimeo Videos</h4>
                                        {filteredResults.vimeo.map(video => (
                                            <button 
                                                key={video.id}
                                                onClick={() => handleResultClick('Vimeo')}
                                                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md group"
                                            >
                                                <VideoIcon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-primary" />
                                                <span className="truncate font-medium">{video.title}</span>
                                            </button>
                                        ))}
                                    </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative" ref={notificationRef}>
                    <button onClick={() => setShowNotifications(s => !s)} className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                        <BellIcon className="w-5 h-5" />
                        {unreadCount > 0 && (
                             <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-primary border-2 border-white"></span>
                        )}
                    </button>
                    {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)}/>}
                </div>

                <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

                <div className="relative" ref={profileMenuRef}>
                    <button onClick={() => setShowProfileMenu(p => !p)} className="flex items-center space-x-3 p-1 rounded-xl hover:bg-gray-50 transition-all">
                        <img src={adminUser?.avatar} alt="Admin" className="w-8 h-8 rounded-lg object-cover bg-gray-100" />
                        <div className="text-left hidden lg:block">
                            <p className="text-xs font-bold text-gray-900 leading-none">{adminUser?.name}</p>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tight">System Admin</p>
                        </div>
                        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                    </button>
                    {showProfileMenu && (
                         <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-20 border border-gray-100">
                             <button onClick={() => { setCurrentView('Settings'); setShowProfileMenu(false); }} className="block w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">Profile Settings</button>
                             {/* <button onClick={() => { onToggleStudentView(); setShowProfileMenu(false); }} className="block w-full text-left px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50">Switch to Student View</button> */}
                             <div className="border-t border-gray-50 my-1"></div>
                             <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Logout Account</button>
                         </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
