import React, { useState } from 'react';
// FIX: Corrected the import path for icons from '../icons' to '../icons/index' to resolve module loading error.
import { ChevronDownIcon, LogoutIcon } from '../icons/index';
import { useAppContext } from '../../context/AppContext';

interface StudentHeaderProps {
    onLogout: () => void;
    onExitStudentView: () => void;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({ onLogout, onExitStudentView }) => {
    const { currentStudent } = useAppContext();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-primary">CourseAdmin</h1>
                <button onClick={onExitStudentView} className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-md hover:bg-gray-200">
                    Exit Student View
                </button>
            </div>

            <div className="flex items-center space-x-5">
                <div className="relative">
                    <button onClick={() => setShowProfileMenu(p => !p)} className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100">
                        <img
                            src={currentStudent?.avatar}
                            alt={currentStudent?.name}
                            className="w-9 h-9 rounded-full object-cover"
                        />
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-semibold text-gray-800">{currentStudent?.name}</p>
                            <p className="text-xs text-gray-500">{currentStudent?.role}</p>
                        </div>
                        <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    </button>
                    {showProfileMenu && (
                         <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                             <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Account Settings</a>
                             <div className="border-t border-gray-100 my-1"></div>
                             <button onClick={onLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <LogoutIcon className="w-4 h-4 mr-2" />
                                Logout
                             </button>
                         </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default StudentHeader;