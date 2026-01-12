
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Promotion } from '../../types';
import { PlusIcon, EditIcon, DeleteIcon, CheckIcon } from '../../components/icons/index';
import Modal from '../../components/ui/Modal';
import BannerForm from './components/BannerForm';
import Tooltip from '../../components/ui/Tooltip';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const Banners: React.FC = () => {
    const { promotions, deletePromotion, savePromotion } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Promotion | undefined>(undefined);
    const [promoToDelete, setPromoToDelete] = useState<Promotion | null>(null);

    const openAddModal = () => {
        setEditingPromo(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (promo: Promotion) => {
        setEditingPromo(promo);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPromo(undefined);
    };

    const handleDelete = () => {
        if(promoToDelete) {
            deletePromotion(promoToDelete.id);
            setPromoToDelete(null);
        }
    };

    const toggleActive = (promo: Promotion) => {
        savePromotion({ ...promo, isActive: !promo.isActive });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Banner Management</h2>
                <button onClick={openAddModal} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md">
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Add New Banner
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-wider">Preview</th>
                                <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-wider">Banner Content</th>
                                <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="p-4 font-bold text-xs text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {promotions?.map(promo => (
                                <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 w-40">
                                        <img src={promo.imageUrl} alt={promo.title} className="w-32 h-16 object-cover rounded-lg shadow-sm border border-gray-100" />
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold text-gray-900">{promo.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{promo.description}</p>
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => toggleActive(promo)}
                                            className={`flex items-center px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                                promo.isActive 
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                            }`}
                                        >
                                            {promo.isActive ? (
                                                <><CheckIcon className="w-3 h-3 mr-1" /> Active</>
                                            ) : (
                                                'Inactive'
                                            )}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex space-x-1">
                                            <Tooltip text="Edit Banner">
                                                <button onClick={() => openEditModal(promo)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors">
                                                    <EditIcon className="w-5 h-5"/>
                                                </button>
                                            </Tooltip>
                                            <Tooltip text="Delete Banner">
                                                <button onClick={() => setPromoToDelete(promo)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors">
                                                    <DeleteIcon className="w-5 h-5"/>
                                                </button>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {promotions.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="font-medium text-lg">No promotional banners yet.</p>
                        <p className="text-sm">Create banners to highlight special offers on the mobile app.</p>
                    </div>
                )}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingPromo ? "Edit Banner" : "New Promotional Banner"} size="3xl">
                <BannerForm promotion={editingPromo} onSave={closeModal}/>
            </Modal>
            
            <ConfirmationModal
                isOpen={!!promoToDelete}
                onClose={() => setPromoToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Banner"
                message={`Are you sure you want to delete the banner "${promoToDelete?.title}"?`}
                confirmText="Delete"
            />
        </div>
    );
};

export default Banners;
