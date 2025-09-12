import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface UserFormProps {
    user?: User;
    onSave: () => void;
}

const InputField: React.FC<{ label: string; name: string; type?: string; value: string; onChange: (e: any) => void; required?: boolean; }> = 
    ({ label, name, type = 'text', value, onChange, required = true }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input 
            type={type} 
            id={name} 
            name={name} 
            value={value} 
            onChange={onChange} 
            required={required}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
    </div>
);

const UserForm: React.FC<UserFormProps> = ({ user, onSave }) => {
    const { addUser, updateUser } = useAppContext();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: UserRole.STUDENT,
        phoneNumber: '',
        status: 'Active' as 'Active' | 'Inactive',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber || '',
                status: user.status,
            });
        } else {
            // Reset for new user form
            setFormData({
                name: '',
                email: '',
                role: UserRole.STUDENT,
                phoneNumber: '',
                status: 'Active',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            updateUser({ ...user, ...formData });
        } else {
            addUser(formData);
        }
        onSave();
    };

    // Exclude Admin role from the selection dropdown for security
    const studentRoles = Object.values(UserRole).filter(role => role !== UserRole.ADMIN);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} />
            <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
            <InputField label="Phone Number (Optional)" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} required={false} />

            <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                    id="role" 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                    {studentRoles.map(roleValue => (
                        <option key={roleValue} value={roleValue}>{roleValue}</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onSave} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700">Save User</button>
            </div>
        </form>
    );
};

export default UserForm;