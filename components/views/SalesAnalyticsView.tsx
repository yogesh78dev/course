import React, { useState } from 'react';
import SalesView from './SalesView';
import AnalyticsView from './AnalyticsView';

type Tab = 'Invoices' | 'Analytics';

const SalesAnalyticsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('Invoices');

    const tabItems: { name: Tab }[] = [
        { name: 'Invoices' },
        { name: 'Analytics' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Sales & Analytics</h2>

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
                {activeTab === 'Invoices' && <SalesView />}
                {activeTab === 'Analytics' && <AnalyticsView />}
            </div>
        </div>
    );
};

export default SalesAnalyticsView;