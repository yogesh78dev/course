import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { UserRole } from '../../../types';
import ImageUpload from '../../../components/ui/ImageUpload';

const ProfileSettings: React.FC = () => {
    const { users, updateUser } = useAppContext();
    const adminUser = users.find(u => u.role === UserRole.ADMIN);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        avatar: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (adminUser) {
            setFormData({
                name: adminUser.name,
                email: adminUser.email,
                phoneNumber: adminUser.phoneNumber || '',
                avatar: adminUser.avatar || '',
            });
        }
    }, [adminUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminUser) return;
        setLoading(true);
        try {
            await updateUser({ ...adminUser, ...formData });
        } catch (error: any) {
            // Error toast handled by context
        } finally {
            setLoading(false);
        }
    };
    
    if (!adminUser) return <div>Loading profile...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
                    <div className="lg:col-span-1">
                        <div className="max-w-xs mx-auto lg:mx-0">
                            <ImageUpload 
                                label="Profile Photo"
                                currentImageUrl={formData.avatar}
                                onFileChange={(dataUrl) => setFormData(prev => ({ ...prev, avatar: dataUrl }))}
                                aspectRatio="1/1"
                                shape="circle"
                            />
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input type="email" id="email" name="email" value={formData.email} disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed" />
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                            <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
                    <button type="submit" disabled={loading} className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-700 font-semibold disabled:bg-primary-300">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileSettings;