import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User, UserRole } from '../../types';
// FIX: Corrected the import path for icons from '../../components/icons' to '../../components/icons/index' to resolve module loading error.
import { PlusIcon, EditIcon, DeleteIcon, KeyIcon } from '../../components/icons/index';
import Modal from '../../components/ui/Modal';
import UserForm from '../../components/ui/UserForm';
import Tooltip from '../../components/ui/Tooltip';
import UserEnrollmentsModal from '../../components/ui/UserEnrollmentsModal';
import * as api from '../../services/api';

const Users: React.FC = () => {
    const { users, deleteUser, setUsers } = useAppContext();
    const [filterRole, setFilterRole] = useState<UserRole | 'All'>('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
    const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const openAddModal = () => {
        setEditingUser(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(undefined);
    };
    
    const openEnrollmentModal = async (user: User) => {
        try {
            // Fetch the full profile to get up-to-date enrollment data
            const res = await api.getStudentProfile(user.id);
            setSelectedUser(res.data);
            setIsEnrollmentModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch user enrollments:", error);
            alert("Could not load user's enrollment data.");
        }
    };

    const closeEnrollmentModal = () => {
        setSelectedUser(null);
        setIsEnrollmentModalOpen(false);
    };

    const filteredUsers = filterRole === 'All'
        ? users.filter(u => u.role !== UserRole.ADMIN) // Exclude admins from the general user list
        : users.filter(user => user.role === filterRole);

    const getRoleClass = (role: UserRole) => {
        switch (role) {
            case UserRole.GOLD_MEMBER:
                return 'bg-yellow-100 text-yellow-800';
            case UserRole.STUDENT:
                return 'bg-blue-100 text-blue-800';
            case UserRole.ADMIN:
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getStatusClass = (status: 'Active' | 'Inactive') => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800';
            case 'Inactive':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const studentRoles = Object.values(UserRole).filter(role => role !== UserRole.ADMIN);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
                <button onClick={openAddModal} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Add New User
                </button>
            </div>

            <div className="flex space-x-2 border-b border-gray-200">
                <button 
                    onClick={() => setFilterRole('All')}
                    className={`px-4 py-2 font-medium text-sm ${filterRole === 'All' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    All Users
                </button>
                {studentRoles.map(role => (
                    <button 
                        key={role}
                        onClick={() => setFilterRole(role)}
                        className={`px-4 py-2 font-medium text-sm ${filterRole === role ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {role}s
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-sm text-gray-600">Name</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Email</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Role</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Phone Number</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Joined Date</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td className="p-4 flex items-center">
                                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover mr-4"/>
                                    <p className="font-medium text-gray-900">{user.name}</p>
                                </td>
                                <td className="p-4 text-gray-700">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleClass(user.role)}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-700">{user.phoneNumber || 'N/A'}</td>
                                <td className="p-4 text-gray-700">{user.joinedDate}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(user.status)}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex space-x-2">
                                        <Tooltip text="View Enrollments">
                                            <button onClick={() => openEnrollmentModal(user)} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors" aria-label={`View enrollments for ${user.name}`}>
                                                <KeyIcon className="w-5 h-5"/>
                                            </button>
                                        </Tooltip>
                                        <Tooltip text="Edit User">
                                            <button onClick={() => openEditModal(user)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors" aria-label={`Edit ${user.name}`}>
                                                <EditIcon className="w-5 h-5"/>
                                            </button>
                                        </Tooltip>
                                        <Tooltip text="Delete User">
                                            <button onClick={() => deleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors" aria-label={`Delete ${user.name}`}>
                                                <DeleteIcon className="w-5 h-5"/>
                                            </button>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No users found for this role.
                    </div>
                )}
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingUser ? "Edit User" : "Add New User"}>
                <UserForm user={editingUser} onSave={closeModal}/>
            </Modal>
            <UserEnrollmentsModal user={selectedUser} onClose={closeEnrollmentModal} />
        </div>
    );
};

export default Users;