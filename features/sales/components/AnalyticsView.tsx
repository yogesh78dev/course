import React, { useMemo } from 'react';
import { useAppContext } from '../../../context/AppContext';
// FIX: Corrected the import path for icons from '../../../components/icons' to '../../../components/icons/index' to resolve module loading error.
import { DownloadIcon } from '../../../components/icons/index';
import Tooltip from '../../../components/ui/Tooltip';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';


const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
    </div>
);

const AnalyticsView: React.FC = () => {
    const { sales, courses, coupons } = useAppContext();

    const totalRevenue = useMemo(() => sales.reduce((acc, sale) => acc + Number(sale.amount), 0), [sales]);
    const totalSales = sales.length;

    // Mock data for the chart
    const chartData = [
      { name: 'Week 1', Sales: 12, Revenue: 1200 },
      { name: 'Week 2', Sales: 19, Revenue: 2100 },
      { name: 'Week 3', Sales: 8, Revenue: 950 },
      { name: 'Week 4', Sales: 15, Revenue: 1800 },
    ];

    const bestSellingCourses = useMemo(() => {
        const courseSales: { [key: string]: { salesCount: number, revenue: number } } = {};

        sales.forEach(sale => {
            const courseId = sale.course.id;
            if (!courseSales[courseId]) {
                courseSales[courseId] = { salesCount: 0, revenue: 0 };
            }
            courseSales[courseId].salesCount += 1;
            courseSales[courseId].revenue += Number(sale.amount);
        });
        
        return Object.entries(courseSales)
            .map(([courseId, data]) => {
                const courseInfo = courses.find(c => c.id === courseId);
                return {
                    id: courseId,
                    title: courseInfo?.title || 'Unknown Course',
                    ...data,
                };
            })
            .sort((a, b) => b.salesCount - a.salesCount);

    }, [sales, courses]);
    
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

    const handleDownloadBestSellersReport = () => {
        const reportData = bestSellingCourses.map(c => ({
            course_id: c.id,
            course_title: c.title,
            sales_count: c.salesCount,
            revenue: c.revenue,
        }));
        downloadCSV(reportData, 'best-selling-courses-report');
    };

    const handleDownloadCouponReport = () => {
        const reportData = coupons.map(c => ({
            code: c.code,
            type: c.type,
            value: c.value,
            usage_count: c.usageCount,
            usage_limit: c.usageLimit ?? 'Unlimited',
            start_date: c.startDate,
            end_date: c.endDate,
        }));
        downloadCSV(reportData, 'coupon-usage-report');
    };


    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                <StatCard title="Total Course Sales" value={totalSales.toLocaleString()} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Performance Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" tickFormatter={(value) => `₹${value}`} />
                        <YAxis yAxisId="right" orientation="right" />
                        <RechartsTooltip formatter={(value, name) => name === 'Revenue' ? `₹${(value as number).toFixed(2)}` : value} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="Revenue" stroke="#4f46e5" strokeWidth={2} />
                        <Line yAxisId="right" type="monotone" dataKey="Sales" stroke="#82ca9d" strokeWidth={2}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Best-Selling Courses</h3>
                    <Tooltip text="Download Best Sellers Report (CSV)">
                        <button onClick={handleDownloadBestSellersReport} className="flex items-center text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                            <DownloadIcon className="w-4 h-4 mr-2"/>
                            Download Report
                        </button>
                    </Tooltip>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-semibold text-sm text-gray-600">Course</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 text-right">Sales</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {bestSellingCourses.map(course => (
                                <tr key={course.id}>
                                    <td className="p-4 font-medium text-gray-800">{course.title}</td>
                                    <td className="p-4 text-gray-700 text-right">{course.salesCount.toLocaleString()}</td>
                                    <td className="p-4 font-semibold text-green-600 text-right">₹{course.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {bestSellingCourses.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            No sales data available.
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                 <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Coupon Usage Report</h3>
                    <Tooltip text="Download Coupon Report (CSV)">
                        <button onClick={handleDownloadCouponReport} className="flex items-center text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                            <DownloadIcon className="w-4 h-4 mr-2"/>
                            Download Report
                        </button>
                    </Tooltip>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-semibold text-sm text-gray-600">Coupon Code</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Type</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Value</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 text-center">Usage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {coupons.map(coupon => (
                                <tr key={coupon.id}>
                                    <td className="p-4"><span className="font-mono bg-gray-100 text-gray-800 text-sm font-medium px-2 py-1 rounded">{coupon.code}</span></td>
                                    <td className="p-4 text-gray-700">{coupon.type}</td>
                                    <td className="p-4 font-semibold text-gray-900">
                                        {coupon.type === 'Percentage' ? `${coupon.value}%` : `₹${Number(coupon.value).toFixed(2)}`}
                                    </td>
                                    <td className="p-4 text-gray-700 text-center">{`${coupon.usageCount} / ${coupon.usageLimit ?? '∞'}`}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {coupons.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            No coupons found.
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default AnalyticsView;