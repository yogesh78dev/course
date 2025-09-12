import React, { useState, useEffect } from 'react';
import { Instructor } from '../../../types';
import { useAppContext } from '../../../context/AppContext';

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
    });

    useEffect(() => {
        if (instructor) {
            setFormData({
                name: instructor.name,
                email: instructor.email,
                bio: instructor.bio,
            });
        } else {
            setFormData({ name: '', email: '', bio: '' });
        }
    }, [instructor]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (instructor) {
            updateInstructor({ ...instructor, ...formData });
        } else {
            addInstructor(formData);
        }
        onSave();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
             <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
                <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={4} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" placeholder="A brief bio about the instructor..."></textarea>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onSave} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700">Save Instructor</button>
            </div>
        </form>
    );
};

export default InstructorForm;
