import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Instructor } from '../../types';
import { PlusIcon, EditIcon, DeleteIcon } from '../../components/icons/index';
import Modal from '../../components/ui/Modal';
import InstructorForm from './components/InstructorForm';
import Tooltip from '../../components/ui/Tooltip';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const Instructors: React.FC = () => {
    const { instructors, deleteInstructor } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState<Instructor | undefined>(undefined);
    const [instructorToDelete, setInstructorToDelete] = useState<Instructor | null>(null);

    const openAddModal = () => {
        setEditingInstructor(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (instructor: Instructor) => {
        setEditingInstructor(instructor);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingInstructor(undefined);
    };

    const handleDelete = () => {
        if(instructorToDelete) {
            deleteInstructor(instructorToDelete.id);
            setInstructorToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Instructor Management</h2>
                <button onClick={openAddModal} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Add New Instructor
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-semibold text-sm text-gray-600">Name</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Email</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Bio</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {instructors?.map(instructor => (
                                <tr key={instructor.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 flex items-center">
                                        <img src={instructor.avatar} alt={instructor.name} className="w-10 h-10 rounded-full object-cover mr-4"/>
                                        <p className="font-medium text-gray-900">{instructor.name}</p>
                                    </td>
                                    <td className="p-4 text-gray-700">{instructor.email}</td>
                                    <td className="p-4 text-gray-700 text-sm max-w-md truncate" title={instructor.bio}>
                                        {instructor.bio}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex space-x-2">
                                            <Tooltip text="Edit Instructor">
                                                <button onClick={() => openEditModal(instructor)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors" aria-label={`Edit ${instructor.name}`}>
                                                    <EditIcon className="w-5 h-5"/>
                                                </button>
                                            </Tooltip>
                                            <Tooltip text="Delete Instructor">
                                                <button onClick={() => setInstructorToDelete(instructor)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors" aria-label={`Delete ${instructor.name}`}>
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
                {instructors.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No instructors found.
                    </div>
                )}
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingInstructor ? "Edit Instructor" : "Add New Instructor"}>
                <InstructorForm instructor={editingInstructor} onSave={closeModal}/>
            </Modal>
            <ConfirmationModal
                isOpen={!!instructorToDelete}
                onClose={() => setInstructorToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Instructor"
                message={`Are you sure you want to delete instructor "${instructorToDelete?.name}"? This may affect existing courses.`}
                confirmText="Delete"
            />
        </div>
    );
};

export default Instructors;