import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import NotificationForm from './components/NotificationForm';
import Modal from '../../components/ui/Modal';
import NotificationTemplateForm from './components/NotificationTemplateForm';
import { NotificationTemplate } from '../../types';
import { EditIcon, DeleteIcon, PlusIcon } from '../../components/icons/index';
import Tooltip from '../../components/ui/Tooltip';

type NotificationTab = 'Compose' | 'Templates' | 'History';

const Notifications: React.FC = () => {
    const { sentNotifications, notificationTemplates, deleteNotificationTemplate } = useAppContext();
    const [activeTab, setActiveTab] = useState<NotificationTab>('Compose');
    const [templateToLoad, setTemplateToLoad] = useState<NotificationTemplate | null>(null);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | undefined>(undefined);

    const handleNotificationSent = () => {
        setActiveTab('History');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUseTemplate = (template: NotificationTemplate) => {
        setTemplateToLoad(template);
        setActiveTab('Compose');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const openAddTemplateModal = () => {
        setEditingTemplate(undefined);
        setIsTemplateModalOpen(true);
    };

    const openEditTemplateModal = (template: NotificationTemplate) => {
        setEditingTemplate(template);
        setIsTemplateModalOpen(true);
    };

    const closeModal = () => {
        setIsTemplateModalOpen(false);
    };

    const tabItems: { name: NotificationTab }[] = [
        { name: 'Compose' },
        { name: 'Templates' },
        { name: 'History' },
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'Compose':
                return (
                    <NotificationForm
                        onNotificationSent={handleNotificationSent}
                        loadTemplate={templateToLoad}
                        onClearTemplate={() => setTemplateToLoad(null)}
                    />
                );
            case 'Templates':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-xl font-bold text-gray-800">Manage Templates</h3>
                            <button onClick={openAddTemplateModal} className="flex items-center bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm">
                                <PlusIcon className="w-4 h-4 mr-2"/>
                                Create New Template
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="p-4 font-semibold text-sm text-gray-600">Template Name</th>
                                        <th className="p-4 font-semibold text-sm text-gray-600">Title</th>
                                        <th className="p-4 font-semibold text-sm text-gray-600">Target</th>
                                        <th className="p-4 font-semibold text-sm text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {notificationTemplates?.map(template => (
                                        <tr key={template.id}>
                                            <td className="p-4 font-medium text-gray-900">{template.name}</td>
                                            <td className="p-4 text-gray-700 truncate max-w-xs" title={template.title}>{template.title}</td>
                                            <td className="p-4 text-gray-700">{template.target}</td>
                                            <td className="p-4">
                                                <div className="flex items-center space-x-2">
                                                    <button onClick={() => handleUseTemplate(template)} className="text-primary hover:underline text-sm font-medium">Use</button>
                                                    <Tooltip text="Edit Template">
                                                        <button onClick={() => openEditTemplateModal(template)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"><EditIcon className="w-5 h-5"/></button>
                                                    </Tooltip>
                                                    <Tooltip text="Delete Template">
                                                        <button onClick={() => deleteNotificationTemplate(template.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"><DeleteIcon className="w-5 h-5"/></button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             {notificationTemplates.length === 0 && (
                                <div className="text-center py-10 text-gray-500">
                                    No templates created yet.
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'History':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 p-4 border-b">Sent History</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="p-4 font-semibold text-sm text-gray-600">Title</th>
                                        <th className="p-4 font-semibold text-sm text-gray-600 max-w-sm">Message</th>
                                        <th className="p-4 font-semibold text-sm text-gray-600">Target</th>
                                        <th className="p-4 font-semibold text-sm text-gray-600">Sent Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {sentNotifications?.map(notif => (
                                        <tr key={notif.id}>
                                            <td className="p-4 font-medium text-gray-900">{notif.title}</td>
                                            <td className="p-4 text-gray-700 max-w-sm truncate" title={notif.message}>{notif.message}</td>
                                            <td className="p-4 text-gray-700">{notif.target}</td>
                                            <td className="p-4 text-gray-700">{notif.sentDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             {sentNotifications.length === 0 && (
                                <div className="text-center py-10 text-gray-500">
                                    No notifications have been sent yet.
                                </div>
                            )}
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Notifications</h2>
            </div>
            
            <div className="flex space-x-2 border-b border-gray-200">
                {tabItems.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`px-4 py-2 font-medium text-sm ${
                            activeTab === tab.name
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>

            <div className="mt-6">
                {renderContent()}
            </div>

            <Modal isOpen={isTemplateModalOpen} onClose={closeModal} title={editingTemplate ? "Edit Template" : "Create New Template"}>
                <NotificationTemplateForm template={editingTemplate} onSave={closeModal} />
            </Modal>
        </div>
    );
};

export default Notifications;