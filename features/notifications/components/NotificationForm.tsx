
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { NotificationTarget, NotificationActionType, NotificationAction, NotificationTemplate, NotificationChannel } from '../../../types';
import { SendIcon } from '../../../components/icons/index';

interface NotificationFormProps {
    onNotificationSent: () => void;
    loadTemplate?: NotificationTemplate | null;
    onClearTemplate: () => void;
}

const NotificationForm: React.FC<NotificationFormProps> = ({ onNotificationSent, loadTemplate, onClearTemplate }) => {
    const { sendNotification, courses, coupons, addToast } = useAppContext();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState<NotificationTarget>(NotificationTarget.ALL);
    const [action, setAction] = useState<NotificationAction>({ type: NotificationActionType.NONE });
    const [channels, setChannels] = useState<NotificationChannel[]>([NotificationChannel.IN_APP]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (loadTemplate) {
            setTitle(loadTemplate.title);
            setMessage(loadTemplate.message);
            setTarget(loadTemplate.target);
            setAction(loadTemplate.action);
            onClearTemplate();
        }
    }, [loadTemplate, onClearTemplate]);

    const handleActionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as NotificationActionType;
        setAction({ type: newType, payload: undefined });
    };

    const handleActionPayloadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPayload = e.target.value;
        setAction(prev => ({ ...prev, payload: newPayload }));
    };

    const handleChannelChange = (channel: NotificationChannel) => {
        setChannels(prev =>
            prev.includes(channel)
                ? prev.filter(c => c !== channel)
                : [...prev, channel]
        );
    };

    const showLocalNotification = async (notifTitle: string, notifBody: string) => {
        if (!('Notification' in window)) return;

        try {
            let permission = Notification.permission;
            
            if (permission === 'default') {
                permission = await Notification.requestPermission();
            }

            if (permission === 'granted') {
                // On mobile devices, new Notification() might not work in some contexts
                // but we try it as it provides visual feedback to the admin.
                new Notification(notifTitle, { 
                    body: notifBody,
                    icon: '/favicon.ico' // Assuming a favicon exists
                });
            }
        } catch (err) {
            console.error("Local notification error:", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) {
            addToast('Title and message are required.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Trigger local notification attempt (non-blocking)
            if (channels.includes(NotificationChannel.PUSH)) {
                showLocalNotification(title, message);
            }

            // 2. Call the backend API to broadcast to real users
            await sendNotification({
                title,
                message,
                target,
                action,
                channels,
            });

            // Reset form
            setTitle('');
            setMessage('');
            setTarget(NotificationTarget.ALL);
            setAction({ type: NotificationActionType.NONE });
            setChannels([NotificationChannel.IN_APP]);
            onNotificationSent();
        } catch (err: any) {
            // Error toast handled by context, but we reset loading state
            console.error("Failed to dispatch notification:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderActionPayloadInput = () => {
        if (action.type === NotificationActionType.VIEW_COURSE) {
            return (
                <div>
                    <label htmlFor="actionPayload" className="block text-sm font-medium text-gray-700 mt-2 mb-1">Select Course</label>
                    <select
                        id="actionPayload"
                        value={action.payload || ''}
                        onChange={handleActionPayloadChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                    >
                        <option value="" disabled>-- Select a course --</option>
                        {courses?.map(course => (
                            <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                    </select>
                </div>
            );
        }
        if (action.type === NotificationActionType.VIEW_COUPON) {
             const activeCoupons = coupons?.filter(c => new Date(c.endDate) >= new Date());
            return (
                 <div>
                    <label htmlFor="actionPayload" className="block text-sm font-medium text-gray-700 mt-2 mb-1">Select Coupon</label>
                    <select
                        id="actionPayload"
                        value={action.payload || ''}
                        onChange={handleActionPayloadChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                    >
                        <option value="" disabled>-- Select a coupon --</option>
                        {activeCoupons?.map(coupon => (
                            <option key={coupon.id} value={coupon.id}>{coupon.code} - {coupon.type}</option>
                        ))}
                    </select>
                </div>
            );
        }
        return null;
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create & Send Notification</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} required rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                        <select id="target" value={target} onChange={e => setTarget(e.target.value as NotificationTarget)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                            {(Object.values(NotificationTarget) as NotificationTarget[]).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="actionType" className="block text-sm font-medium text-gray-700 mb-1">Action (Optional)</label>
                        <select id="actionType" value={action.type} onChange={handleActionTypeChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                            {(Object.values(NotificationActionType) as NotificationActionType[]).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
                {renderActionPayloadInput()}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Channels</label>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <input id="in_app" type="checkbox" checked={channels.includes(NotificationChannel.IN_APP)} onChange={() => handleChannelChange(NotificationChannel.IN_APP)} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
                            <label htmlFor="in_app" className="ml-2 block text-sm text-gray-900">In-App</label>
                        </div>
                         <div className="flex items-center">
                            <input id="push" type="checkbox" checked={channels.includes(NotificationChannel.PUSH)} onChange={() => handleChannelChange(NotificationChannel.PUSH)} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
                            <label htmlFor="push" className="ml-2 block text-sm text-gray-900">Push Notification</label>
                        </div>
                    </div>
                </div>
                 <div className="flex justify-end pt-2">
                    <button 
                        type="submit" 
                        className="flex items-center bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-primary-300" 
                        disabled={channels.length === 0 || isSubmitting}
                    >
                        {isSubmitting ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <SendIcon className="w-5 h-5 mr-2"/>
                        )}
                        {isSubmitting ? 'Processing...' : 'Send Notification'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NotificationForm;
