import React, { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { Sale, UserRole } from '../../types';
import { UsersIcon, SalesIcon, CoursesIcon, CheckIcon } from '../../components/icons/index';

const StatCard: React.FC<{ title: string; value: string; change: string; isPositive: boolean; icon: React.ReactNode; }> = ({ title, value, change, isPositive, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
        <div className="p-3 rounded-full bg-primary-100 text-primary mr-4">
            {icon}
        </div>
        <div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
            <p className={`text-sm mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {change} vs. last month
            </p>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const { sales, users, courses } = useAppContext();

    const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.amount), 0);
    const totalSales = sales.length;
    
    const salesByMonth = useMemo(() => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const data = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return {
                name: monthNames[d.getMonth()],
                year: d.getFullYear(),
                Revenue: 0,
            };
        }).reverse();

        sales.forEach(sale => {
            if (sale.status === 'Paid') {
                const saleDate = new Date(sale.date);
                const saleMonth = saleDate.getMonth();
                const saleYear = saleDate.getFullYear();
                const monthData = data.find(m => m.name === monthNames[saleMonth] && m.year === saleYear);
                if (monthData) {
                    monthData.Revenue += Number(sale.amount);
                }
            }
        });

        return data.map(({ name, Revenue }) => ({ name, Revenue }));
    }, [sales]);


    const userRoleData = Object.values(UserRole)
        .filter(role => role !== UserRole.ADMIN) // Exclude admins
        .map(role => ({
            name: `${role}s`,
            value: users.filter(user => user.role === role).length,
        }))
        .filter(item => item.value > 0); // Only show roles with users

    const COLORS: { [key: string]: string } = {
        'Students': '#3b82f6',
        'Gold Members': '#f59e0b',
    };
    
    const recentSales = sales.slice(0, 10);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} change="+12.5%" isPositive={true} icon={<SalesIcon className="w-6 h-6" />} />
                <StatCard title="Total Sales" value={totalSales.toString()} change="+8.2%" isPositive={true} icon={<CheckIcon className="w-6 h-6" />} />
                <StatCard title="New Users" value={users.length.toString()} change="+5.1%" isPositive={true} icon={<UsersIcon className="w-6 h-6" />} />
                <StatCard title="Total Courses" value={courses.length.toString()} change="-1.0%" isPositive={false} icon={<CoursesIcon className="w-6 h-6" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Overview</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesByMonth}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                            <Legend />
                            <Bar dataKey="Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">User Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={userRoleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} labelLine={false} label={({ percent }: any) => `${((percent || 0) * 100).toFixed(0)}%`}>
                                {userRoleData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [value, name]} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

             <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 p-4 border-b">Recent Sales</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 font-semibold text-sm text-gray-600">User</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Course</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Date</th>
                                <th className="p-4 font-semibold text-sm text-gray-600 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recentSales.map((sale: Sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-700">{sale.user.name}</td>
                                    <td className="p-4 text-gray-700">{sale.course.title}</td>
                                    <td className="p-4 text-gray-700">{sale.date}</td>
                                    <td className="p-4 font-semibold text-green-600 text-right">₹{Number(sale.amount).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {recentSales.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            No recent sales.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;