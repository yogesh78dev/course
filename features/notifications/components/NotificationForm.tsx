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
    const { sendNotification, courses, coupons } = useAppContext();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState<NotificationTarget>(NotificationTarget.ALL);
    const [action, setAction] = useState<NotificationAction>({ type: NotificationActionType.NONE });
    const [channels, setChannels] = useState<NotificationChannel[]>([NotificationChannel.IN_APP]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) {
            alert('Title and message are required.');
            return;
        }

        if (channels.includes(NotificationChannel.PUSH)) {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    new Notification(title, { body: message });
                } else {
                    alert('Push notification permission was denied. The notification will still be sent in-app.');
                }
            } else {
                alert('This browser does not support desktop notifications. The notification will still be sent in-app.');
            }
        }

        sendNotification({
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
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                    </select>
                </div>
            );
        }
        if (action.type === NotificationActionType.VIEW_COUPON) {
             const activeCoupons = coupons.filter(c => new Date(c.endDate) >= new Date());
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
                        {activeCoupons.map(coupon => (
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
                            {Object.values(NotificationTarget).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="actionType" className="block text-sm font-medium text-gray-700 mb-1">Action (Optional)</label>
                        <select id="actionType" value={action.type} onChange={handleActionTypeChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                            {Object.values(NotificationActionType).map(t => <option key={t} value={t}>{t}</option>)}
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
                    <button type="submit" className="flex items-center bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-primary-300" disabled={channels.length === 0}>
                        <SendIcon className="w-5 h-5 mr-2"/>
                        Send Notification
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NotificationForm;