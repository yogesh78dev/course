import React, { useState, useEffect } from 'react';
import { Coupon, CouponType } from '../../../types';
import { useAppContext } from '../../../context/AppContext';

interface CouponFormProps {
    coupon?: Coupon;
    onSave: () => void;
}

const CouponForm: React.FC<CouponFormProps> = ({ coupon, onSave }) => {
    const { courses, addCoupon, updateCoupon } = useAppContext();
    const [formData, setFormData] = useState({
        code: '',
        type: CouponType.PERCENTAGE,
        value: 0,
        startDate: '',
        endDate: '',
        usageLimit: null as number | null,
        courseIds: [] as string[],
        firstTimeBuyerOnly: false,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (coupon) {
            setFormData({
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                startDate: coupon.startDate,
                endDate: coupon.endDate,
                usageLimit: coupon.usageLimit,
                courseIds: coupon.courseIds,
                firstTimeBuyerOnly: coupon.firstTimeBuyerOnly,
            });
        } else {
            // Default start date to today
            const today = new Date().toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, startDate: today }));
        }
    }, [coupon]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({...prev, [name]: checked}));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = value === '' ? null : parseInt(value, 10);
        if (name === 'usageLimit' && numValue !== null && numValue < 0) return;
        if (name === 'value' && numValue !== null && numValue < 0) return;
        setFormData(prev => ({ ...prev, [name]: name === 'usageLimit' ? numValue : (numValue ?? 0) }));
    };

    const handleCourseSelection = (courseId: string) => {
        setFormData(prev => {
            const newCourseIds = prev.courseIds.includes(courseId)
                ? prev.courseIds.filter(id => id !== courseId)
                : [...prev.courseIds, courseId];
            return { ...prev, courseIds: newCourseIds };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (coupon) {
                await updateCoupon({ ...coupon, ...formData });
            } else {
                await addCoupon(formData);
            }
            onSave();
        } catch(err) {
            // Error is handled by context toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                    <input type="text" id="code" name="code" value={formData.code} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 uppercase focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                    <select id="type" name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                        {Object.values(CouponType).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                        Value ({formData.type === CouponType.PERCENTAGE ? '%' : '₹'})
                    </label>
                    <input type="number" id="value" name="value" value={formData.value} min="0" onChange={handleNumberChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                 <div>
                    <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700 mb-1">Usage Limit (optional)</label>
                    <input type="number" id="usageLimit" name="usageLimit" value={formData.usageLimit ?? ''} min="0" onChange={handleNumberChange} placeholder="Unlimited" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} min={formData.startDate} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
            </div>

            <div>
                 <h4 className="text-md font-semibold text-gray-800 mb-2">Restrictions</h4>
                 <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                            <input id="firstTimeBuyerOnly" name="firstTimeBuyerOnly" type="checkbox" checked={formData.firstTimeBuyerOnly} onChange={handleChange} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="firstTimeBuyerOnly" className="font-medium text-gray-700">First-time buyers only</label>
                        </div>
                    </div>
                     <div>
                        <p className="font-medium text-gray-700 mb-2">Apply to specific courses (optional):</p>
                        <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                             {courses?.map(course => (
                                <div key={course.id} className="relative flex items-start">
                                    <div className="flex items-center h-5">
                                        <input 
                                            id={`course-${course.id}`} 
                                            name={`course-${course.id}`} 
                                            type="checkbox" 
                                            checked={formData.courseIds.includes(course.id)}
                                            onChange={() => handleCourseSelection(course.id)}
                                            className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor={`course-${course.id}`} className="text-gray-700">{course.title}</label>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">If no courses are selected, the coupon will apply to all courses.</p>
                     </div>
                 </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onSave} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 font-semibold disabled:bg-primary-300">
                    {loading ? 'Saving...' : 'Save Coupon'}
                </button>
            </div>
        </form>
    );
};

export default CouponForm;