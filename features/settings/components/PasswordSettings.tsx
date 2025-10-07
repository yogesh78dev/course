import React, { useState } from 'react';
import * as api from '../../../services/api';

const PasswordSettings: React.FC = () => {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage('New passwords do not match.');
            return;
        }
        if (passwords.newPassword.length < 6) {
             setMessage('New password must be at least 6 characters long.');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            const { currentPassword, newPassword } = passwords;
            await api.changePassword({ currentPassword, newPassword });
            setMessage('Password changed successfully!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            setMessage(error.message || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="max-w-xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input type="password" id="currentPassword" name="currentPassword" value={passwords.currentPassword} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input type="password" id="newPassword" name="newPassword" value={passwords.newPassword} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" value={passwords.confirmPassword} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                    </div>

                    {message && <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}

                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={loading} className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-700 font-semibold disabled:bg-primary-300">
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordSettings;