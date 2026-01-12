
import React, { useState, useEffect } from 'react';
import { Instructor } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import ImageUpload from '../../../components/ui/ImageUpload';

interface InstructorFormProps {
    instructor?: Instructor;
    onSave: () => void;
}

const InstructorForm: React.FC<InstructorFormProps> = ({ instructor, onSave }) => {
    const { addInstructor, updateInstructor } = useAppContext();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        avatar: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (instructor) {
            setFormData({
                name: instructor.name,
                email: instructor.email,
                bio: instructor.bio,
                avatar: instructor.avatar || '',
            });
        } else {
            setFormData({ name: '', email: '', bio: '', avatar: '' });
        }
    }, [instructor]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (dataUrl: string) => {
        setFormData(prev => ({ ...prev, avatar: dataUrl }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (instructor) {
                await updateInstructor({ ...instructor, ...formData });
            } else {
                await addInstructor(formData);
            }
            onSave();
        } catch (err) {
            // Error is handled by the context's toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                <div className="md:col-span-1">
                    <ImageUpload 
                        label="Instructor Photo"
                        currentImageUrl={formData.avatar}
                        onFileChange={handleImageChange}
                        aspectRatio="1/1"
                        shape="circle"
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        Recommended: Square image, at least 400x400px.
                    </p>
                </div>
                
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" 
                            placeholder="e.g. Dr. Jane Smith"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" 
                            placeholder="jane.smith@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
                        <textarea 
                            id="bio" 
                            name="bio" 
                            value={formData.bio} 
                            onChange={handleChange} 
                            rows={5} 
                            required 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" 
                            placeholder="Tell students about the instructor's background, expertise, and teaching style..."
                        ></textarea>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button 
                    type="button" 
                    onClick={onSave} 
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 font-semibold shadow-md transition-all disabled:bg-primary-300 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : 'Save Instructor'}
                </button>
            </div>
        </form>
    );
};

export default InstructorForm;
