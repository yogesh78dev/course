
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Webinar } from '../../types';
import { PlusIcon, EditIcon, DeleteIcon, VideoIcon } from '../../components/icons/index';
import Modal from '../../components/ui/Modal';
import WebinarForm from './components/WebinarForm';
import Tooltip from '../../components/ui/Tooltip';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const Webinars: React.FC = () => {
    const { webinars, deleteWebinar, instructors } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWebinar, setEditingWebinar] = useState<Webinar | undefined>(undefined);
    const [webinarToDelete, setWebinarToDelete] = useState<Webinar | null>(null);

    const openAddModal = () => {
        setEditingWebinar(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (webinar: Webinar) => {
        setEditingWebinar(webinar);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingWebinar(undefined);
    };

    const handleDelete = () => {
        if(webinarToDelete) {
            deleteWebinar(webinarToDelete.id);
            setWebinarToDelete(null);
        }
    };

    const formatDateTime = (dateString: string) => {
        try {
            if(!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleString();
        } catch (e) {
            return 'Invalid Date';
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Webinars</h2>
                <button onClick={openAddModal} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Create Webinar
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-semibold text-sm text-gray-600">Webinar Title</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Type</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Schedule</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Presenter</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {webinars?.map(webinar => {
                                const presenter = instructors.find(i => i.id === webinar.presenterId);
                                const priceDisplay = webinar.isFree ? 'Free' : (webinar.price ? `₹${Number(webinar.price).toFixed(2)}` : '₹0.00');
                                
                                return (
                                    <tr key={webinar.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 flex items-center">
                                            {webinar.thumbnailUrl ? (
                                                <img src={webinar.thumbnailUrl} alt={webinar.title || 'Webinar'} className="w-16 h-10 object-cover rounded-md mr-4 bg-gray-200"/>
                                            ) : (
                                                <div className="w-16 h-10 bg-gray-200 rounded-md mr-4 flex items-center justify-center text-gray-400">
                                                    <VideoIcon className="w-6 h-6" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{webinar.title}</p>
                                                <p className="text-sm text-gray-500">{webinar.duration} mins</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-700">{webinar.type}</td>
                                        <td className="p-4 text-gray-700">{formatDateTime(webinar.scheduleDate)}</td>
                                        <td className="p-4 text-gray-700">{presenter?.name || 'N/A'}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${webinar.isFree ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {priceDisplay}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <Tooltip text="Edit Webinar">
                                                    <button onClick={() => openEditModal(webinar)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors">
                                                        <EditIcon className="w-5 h-5"/>
                                                    </button>
                                                </Tooltip>
                                                <Tooltip text="Delete Webinar">
                                                    <button onClick={() => setWebinarToDelete(webinar)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors">
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
                </div>
                 {webinars.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No webinars scheduled.
                    </div>
                )}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingWebinar ? "Edit Webinar" : "Create Webinar"} size="2xl">
                <WebinarForm webinar={editingWebinar} onSave={closeModal}/>
            </Modal>
            <ConfirmationModal
                isOpen={!!webinarToDelete}
                onClose={() => setWebinarToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Webinar"
                message={`Are you sure you want to delete the webinar "${webinarToDelete?.title}"?`}
                confirmText="Delete"
            />
        </div>
    );
};

export default Webinars;
