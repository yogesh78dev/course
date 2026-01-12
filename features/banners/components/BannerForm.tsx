
import React, { useState, useEffect } from 'react';
import { Promotion, NotificationActionType } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import ImageUpload from '../../../components/ui/ImageUpload';

interface BannerFormProps {
    promotion?: Promotion;
    onSave: () => void;
}

const BannerForm: React.FC<BannerFormProps> = ({ promotion, onSave }) => {
    const { savePromotion } = useAppContext();
    const [formData, setFormData] = useState<Partial<Promotion>>({
        title: '',
        description: '',
        imageUrl: '',
        isActive: false,
        actionType: NotificationActionType.NONE,
        actionPayload: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (promotion) {
            setFormData(promotion);
        }
    }, [promotion]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (dataUrl: string) => {
        setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await savePromotion(formData);
            onSave();
        } catch(err) {
            // Error handling is managed by context toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-1">Banner Title</label>
                    <input 
                        type="text" 
                        id="title" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        required 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300" 
                        placeholder="e.g. Winter Sale 2025" 
                    />
                </div>
                
                <div>
                    <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-1">Marketing Text / Subtitle</label>
                    <textarea 
                        id="description" 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        rows={2} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300" 
                        placeholder="Get up to 40% discount on all web development courses..."
                    />
                </div>
            </div>

            <div>
                 <ImageUpload 
                    label="Banner Graphic (Recommended 1000x400)"
                    currentImageUrl={formData.imageUrl || ''}
                    onFileChange={handleFileChange}
                    aspectRatio="5/2"
                />
                <p className="text-xs text-gray-400 mt-2 italic text-center">Banners look best when they follow the 5:2 aspect ratio.</p>
            </div>

             <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <label htmlFor="isActive" className="flex items-center cursor-pointer group">
                    <div className="relative">
                        <input type="checkbox" id="isActive" name="isActive" className="sr-only" checked={formData.isActive} onChange={handleChange} />
                        <div className={`block w-14 h-8 rounded-full transition-all duration-200 shadow-inner ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full shadow-md transition-transform duration-200 ${formData.isActive ? 'translate-x-6' : ''}`}></div>
                    </div>
                    <div className="ml-4">
                        <p className="font-bold text-gray-900">Visibility Status</p>
                        <p className="text-xs text-gray-500 mt-0.5">Toggle to show or hide this banner on the student application.</p>
                    </div>
                </label>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
                <button type="button" onClick={onSave} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-all">Cancel</button>
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="px-8 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-700 font-bold shadow-lg shadow-primary-200 transition-all transform active:scale-95 disabled:bg-primary-300 disabled:shadow-none"
                >
                    {loading ? 'Saving...' : 'Save Banner'}
                </button>
            </div>
        </form>
    );
};

export default BannerForm;
