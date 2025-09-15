import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import Tooltip from '../../../components/ui/Tooltip';
import { DownloadIcon, CheckIcon } from '../../../components/icons/index';

const SalesView: React.FC = () => {
    const { sales, updateSaleStatus } = useAppContext();

    const getStatusClass = (status: 'Paid' | 'Pending' | 'Failed') => {
        switch (status) {
            case 'Paid':
                return 'bg-green-100 text-green-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Failed':
                return 'bg-red-100 text-red-800';
        }
    };

    const downloadCSV = (data: any[], filename: string) => {
        if (data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadInvoicesReport = () => {
        const reportData = sales.map(s => ({
            invoice_id: s.id,
            date: s.date,
            user_name: s.user.name,
            course_title: s.course.title,
            amount: s.amount,
            status: s.status,
        }));
        downloadCSV(reportData, 'invoices-report');
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Invoice Management</h3>
                    <Tooltip text="Download Invoices Report (CSV)">
                        <button onClick={handleDownloadInvoicesReport} className="flex items-center text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                            <DownloadIcon className="w-4 h-4 mr-2"/>
                            Download Report
                        </button>
                    </Tooltip>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-sm text-gray-600">Invoice ID</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">User</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Course</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Amount</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Date</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sales.map(sale => (
                            <tr key={sale.id}>
                                <td className="p-4 text-gray-700 font-mono text-sm">{sale.id}</td>
                                <td className="p-4 text-gray-700">{sale.user.name}</td>
                                <td className="p-4 text-gray-700">{sale.course.title}</td>
                                <td className="p-4 text-gray-900 font-semibold">₹{Number(sale.amount).toFixed(2)}</td>
                                <td className="p-4 text-gray-700">{sale.date}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(sale.status)}`}>
                                        {sale.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center space-x-1">
                                        <Tooltip text="Download Invoice">
                                            <button className="p-2 text-primary hover:bg-primary-50 rounded-full transition-colors">
                                                <DownloadIcon className="w-5 h-5"/>
                                            </button>
                                        </Tooltip>
                                        {sale.status !== 'Paid' && (
                                            <Tooltip text="Mark as Paid">
                                                <button 
                                                    onClick={() => updateSaleStatus(sale.id, 'Paid')}
                                                    className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                                                >
                                                    <CheckIcon className="w-5 h-5"/>
                                                </button>
                                            </Tooltip>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {sales.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No sales records found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesView;