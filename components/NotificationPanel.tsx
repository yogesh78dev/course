
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Notification } from '../types';

interface NotificationPanelProps {
    onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
    const { notifications, setNotifications } = useAppContext();

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };
    
    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-20 border border-gray-200">
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
                <h4 className="font-semibold text-gray-800">Notifications</h4>
                <button onClick={markAllAsRead} className="text-sm text-primary hover:underline">Mark all as read</button>
            </div>
            <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif: Notification) => (
                    <div key={notif.id} className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${!notif.read ? 'bg-primary-50' : ''}`}>
                        <p className="text-sm text-gray-700">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notif.timestamp}</p>
                    </div>
                ))}
                 {notifications.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No new notifications.
                    </div>
                )}
            </div>
            <div className="p-2 bg-gray-50 text-center">
                 <button onClick={onClose} className="text-sm font-medium text-primary hover:underline">
                    Close
                </button>
            </div>
        </div>
    );
};

export default NotificationPanel;
