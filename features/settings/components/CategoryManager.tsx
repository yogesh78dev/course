import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { DeleteIcon, EditIcon } from '../../../components/icons/index';
import Modal from '../../../components/ui/Modal';
import { Category } from '../../../types';
import Tooltip from '../../../components/ui/Tooltip';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';

const CategoryManager: React.FC = () => {
    const { categories, addCategory, deleteCategory, updateCategory } = useAppContext();
    const [newCategory, setNewCategory] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editedCategoryName, setEditedCategoryName] = useState('');
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    useEffect(() => {
        if (editingCategory) {
            setEditedCategoryName(editingCategory.name);
        }
    }, [editingCategory]);

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim()) {
            addCategory(newCategory.trim());
            setNewCategory('');
        }
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditingCategory(null);
        setIsEditModalOpen(false);
    };

    const handleUpdateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory && editedCategoryName.trim()) {
            updateCategory({ ...editingCategory, name: editedCategoryName.trim() });
            closeEditModal();
        }
    };

    const handleDelete = () => {
        if(categoryToDelete) {
            deleteCategory(categoryToDelete.id);
            setCategoryToDelete(null);
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="max-w-xl">
                <form onSubmit={handleAddCategory} className="flex space-x-2 mb-4">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New category name"
                        className="flex-grow border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                    />
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                        Add
                    </button>
                </form>
                <div className="space-y-2">
                    {categories?.map(category => (
                        <div key={category.id} className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors">
                            <span className="text-gray-800">{category.name}</span>
                            <div className="flex items-center space-x-2">
                                <Tooltip text="Edit Category">
                                    <button onClick={() => openEditModal(category)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors" aria-label={`Edit ${category.name}`}>
                                        <EditIcon className="w-5 h-5"/>
                                    </button>
                                </Tooltip>
                                <Tooltip text="Delete Category">
                                    <button onClick={() => setCategoryToDelete(category)} className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors" aria-label={`Delete ${category.name}`}>
                                        <DeleteIcon className="w-5 h-5"/>
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
             <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Category">
                <form onSubmit={handleUpdateCategory} className="space-y-4">
                    <div>
                        <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                            Category Name
                        </label>
                        <input
                            type="text"
                            id="categoryName"
                            value={editedCategoryName}
                            onChange={(e) => setEditedCategoryName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={closeEditModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 font-semibold">
                            Save Changes
                        </button>
                    </div>
                </form>
            </Modal>
            <ConfirmationModal
                isOpen={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Category"
                message={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This might affect existing courses.`}
                confirmText="Delete"
            />
        </div>
    );
};

export default CategoryManager;