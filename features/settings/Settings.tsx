import React, { useState } from 'react';
import CategoryManager from './components/CategoryManager';
import ProfileSettings from './components/ProfileSettings';
import PasswordSettings from './components/PasswordSettings';
import { UserCircleIcon, ShieldCheckIcon, TagIcon } from '../../components/icons/index';

type Tab = 'Profile' | 'Password' | 'Categories';

interface SettingsTab {
    name: Tab;
    icon: React.ReactNode;
    title: string;
    description: string;
}

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('Profile');

    const tabs: SettingsTab[] = [
        {
            name: 'Profile',
            icon: <UserCircleIcon className="w-5 h-5" />,
            title: 'Your Profile',
            description: 'Update your photo and personal details here.'
        },
        {
            name: 'Password',
            icon: <ShieldCheckIcon className="w-5 h-5" />,
            title: 'Password',
            description: 'Change your password here.'
        },
        {
            name: 'Categories',
            icon: <TagIcon className="w-5 h-5" />,
            title: 'Course Categories',
            description: 'Manage the categories for all courses.'
        },
    ];

    const currentTabData = tabs.find(tab => tab.name === activeTab) || tabs[0];

    const renderContent = () => {
        switch (activeTab) {
            case 'Profile': return <ProfileSettings />;
            case 'Password': return <PasswordSettings />;
            case 'Categories': return <CategoryManager />;
            default: return <ProfileSettings />;
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <aside className="md:col-span-1">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === tab.name
                                        ? 'bg-primary-50 text-primary'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                {tab.icon}
                                <span className="ml-3">{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="md:col-span-3">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">{currentTabData.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{currentTabData.description}</p>
                    </div>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default Settings;
