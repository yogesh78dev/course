import React, { useState } from 'react';
import CategoryManager from '../features/settings/components/CategoryManager';
import ProfileSettings from '../features/settings/components/ProfileSettings';
import PasswordSettings from '../features/settings/components/PasswordSettings';

type Tab = 'Profile' | 'Password' | 'Categories';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('Profile');

    const tabItems: { name: Tab }[] = [
        { name: 'Profile' },
        { name: 'Password' },
        { name: 'Categories' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'Profile': return <ProfileSettings />;
            case 'Password': return <PasswordSettings />;
            case 'Categories': return <CategoryManager />;
            default: return <ProfileSettings />;
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Settings</h2>

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

            <div className="mt-6 max-w-3xl">
                {renderContent()}
            </div>
        </div>
    );
};

export default Settings;
