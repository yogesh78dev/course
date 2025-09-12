
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Coupon } from '../../types';
import { PlusIcon, EditIcon, DeleteIcon } from '../icons';
import Modal from '../Modal';
import CouponForm from '../CouponForm';
import Tooltip from '../Tooltip';

const CouponsView: React.FC = () => {
    const { coupons, deleteCoupon } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);

    const openAddModal = () => {
        setEditingCoupon(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCoupon(undefined);
    };

    const getStatus = (coupon: Coupon) => {
        const now = new Date();
        const startDate = new Date(coupon.startDate);
        const endDate = new Date(coupon.endDate);
        endDate.setHours(23, 59, 59, 999); // Include the whole end day

        if (now < startDate) return { text: 'Scheduled', color: 'bg-blue-100 text-blue-800' };
        if (now > endDate) return { text: 'Expired', color: 'bg-gray-100 text-gray-800' };
        if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
             return { text: 'Limit Reached', color: 'bg-yellow-100 text-yellow-800' };
        }
        return { text: 'Active', color: 'bg-green-100 text-green-800' };
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Coupon & Discount Management</h2>
                <button onClick={openAddModal} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Add New Coupon
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-sm text-gray-600">Code</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Type</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Value</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Validity</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Usage</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {coupons.map(coupon => {
                            const status = getStatus(coupon);
                            return (
                                <tr key={coupon.id}>
                                    <td className="p-4">
                                        <span className="font-mono bg-gray-100 text-gray-800 text-sm font-medium px-2 py-1 rounded">{coupon.code}</span>
                                    </td>
                                    <td className="p-4 text-gray-700">{coupon.type}</td>
                                    <td className="p-4 font-semibold text-gray-900">
                                        {coupon.type === 'Percentage' ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`}
                                    </td>
                                    <td className="p-4 text-gray-700 text-sm">{`${coupon.startDate} to ${coupon.endDate}`}</td>
                                    <td className="p-4 text-gray-700">{`${coupon.usageCount} / ${coupon.usageLimit ?? '∞'}`}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                                            {status.text}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex space-x-2">
                                            <Tooltip text="Edit Coupon">
                                                <button onClick={() => openEditModal(coupon)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors" aria-label={`Edit ${coupon.code}`}>
                                                    <EditIcon className="w-5 h-5"/>
                                                </button>
                                            </Tooltip>
                                            <Tooltip text="Delete Coupon">
                                                <button onClick={() => deleteCoupon(coupon.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors" aria-label={`Delete ${coupon.code}`}>
                                                    <DeleteIcon className="w-5 h-5"/>
                                                </button>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {coupons.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No coupons created yet.
                    </div>
                )}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCoupon ? "Edit Coupon" : "Add New Coupon"}>
                <CouponForm coupon={editingCoupon} onSave={closeModal}/>
            </Modal>
        </div>
    );
};

export default CouponsView;