import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { NotificationTarget, NotificationActionType, NotificationAction, NotificationTemplate } from '../../../types';

interface NotificationTemplateFormProps {
    template?: NotificationTemplate;
    onSave: () => void;
}

const NotificationTemplateForm: React.FC<NotificationTemplateFormProps> = ({ template, onSave }) => {
    const { addNotificationTemplate, updateNotificationTemplate, courses, coupons } = useAppContext();
    
    const [name, setName] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState<NotificationTarget>(NotificationTarget.ALL);
    const [action, setAction] = useState<NotificationAction>({ type: NotificationActionType.NONE });

    useEffect(() => {
        if (template) {
            setName(template.name);
            setTitle(template.title);
            setMessage(template.message);
            setTarget(template.target);
            setAction(template.action);
        } else {
            setName('');
            setTitle('');
            setMessage('');
            setTarget(NotificationTarget.ALL);
            setAction({ type: NotificationActionType.NONE });
        }
    }, [template]);

    const handleActionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as NotificationActionType;
        setAction({ type: newType, payload: undefined });
    };

    const handleActionPayloadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPayload = e.target.value;
        setAction(prev => ({ ...prev, payload: newPayload }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !title || !message) {
            alert('Template Name, Title, and Message are required.');
            return;
        }

        const templateData = { name, title, message, target, action };
        if (template) {
            updateNotificationTemplate({ ...template, ...templateData });
        } else {
            addNotificationTemplate(templateData);
        }
        onSave();
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} required rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
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
            <div className="flex justify-end space-x-3 pt-2">
                 <button type="button" onClick={onSave} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700">Save Template</button>
            </div>
        </form>
    );
};

export default NotificationTemplateForm;