
import React, { useState, useEffect } from 'react';
import { Webinar } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import ImageUpload from '../../../components/ui/ImageUpload';
import RichTextEditor from '../../../components/ui/RichTextEditor';

interface WebinarFormProps {
    webinar?: Webinar;
    onSave: () => void;
}

const WebinarForm: React.FC<WebinarFormProps> = ({ webinar, onSave }) => {
    const { addWebinar, updateWebinar, instructors, vimeoVideos } = useAppContext();
    const [meetingUrlSource, setMeetingUrlSource] = useState<'custom' | 'vimeo'>('custom');
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'Live' as 'Live' | 'Recorded',
        scheduleDate: '',
        duration: 60,
        videoUrl: '',
        meetingUrl: '',
        presenterId: instructors?.[0]?.id || '',
        thumbnailUrl: '',
        isFree: true,
        price: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (webinar) {
            // Convert DB ISO string to local datetime-local string format
            const date = new Date(webinar.scheduleDate);
            // Handling timezone offset for datetime-local input
            const tzOffset = date.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);

            // Determine if meeting URL is from vimeo
            const isVimeoMeeting = webinar.meetingUrl && vimeoVideos.some(v => v.link === webinar.meetingUrl);
            if (isVimeoMeeting) setMeetingUrlSource('vimeo');

            setFormData({
                title: webinar.title,
                description: webinar.description || '',
                type: webinar.type,
                scheduleDate: localISOTime,
                duration: webinar.duration,
                videoUrl: webinar.videoUrl || '',
                meetingUrl: webinar.meetingUrl || '',
                presenterId: webinar.presenterId,
                thumbnailUrl: webinar.thumbnailUrl || '',
                isFree: webinar.isFree,
                price: webinar.price || 0
            });
        } else {
             // Default scheduled date to tomorrow at 10 AM
             const tomorrow = new Date();
             tomorrow.setDate(tomorrow.getDate() + 1);
             tomorrow.setHours(10, 0, 0, 0);
             const tzOffset = tomorrow.getTimezoneOffset() * 60000;
             const localISOTime = (new Date(tomorrow.getTime() - tzOffset)).toISOString().slice(0, 16);

             setFormData({
                title: '',
                description: '',
                type: 'Live',
                scheduleDate: localISOTime,
                duration: 60,
                videoUrl: '',
                meetingUrl: '',
                presenterId: instructors?.[0]?.id || '',
                thumbnailUrl: '',
                isFree: true,
                price: 0
            });
        }
    }, [webinar, instructors, vimeoVideos]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: name === 'duration' || name === 'price' ? parseFloat(value) : value }));
        }
    };

    const handleFileChange = (dataUrl: string) => {
        setFormData(prev => ({ ...prev, thumbnailUrl: dataUrl }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Ensure scheduleDate is in ISO format
            const isoDate = new Date(formData.scheduleDate).toISOString();
            
            const submitData = {
                ...formData,
                scheduleDate: isoDate,
            };

            if (webinar) {
                await updateWebinar({ ...webinar, ...submitData });
            } else {
                await addWebinar(submitData);
            }
            onSave();
        } catch(err) {
            // Error handling in context
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Webinar Title</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                
                 <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select id="type" name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                        <option value="Live">Live</option>
                        <option value="Recorded">Recorded</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700 mb-1">Schedule Date & Time</label>
                    <input type="datetime-local" id="scheduleDate" name="scheduleDate" value={formData.scheduleDate} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>

                 <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <input type="number" id="duration" name="duration" value={formData.duration} onChange={handleChange} required min="1" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>

                 <div>
                    <label htmlFor="presenterId" className="block text-sm font-medium text-gray-700 mb-1">Presenter</label>
                    <select id="presenterId" name="presenterId" value={formData.presenterId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                        {instructors?.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                    </select>
                </div>
            </div>

            <div>
                 <ImageUpload 
                    label="Thumbnail Image"
                    currentImageUrl={formData.thumbnailUrl}
                    onFileChange={handleFileChange}
                    aspectRatio="16/9"
                />
            </div>

             <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <RichTextEditor value={formData.description || ''} onChange={(val) => setFormData(prev => ({ ...prev, description: val }))} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.type === 'Live' ? (
                     <div className="md:col-span-2 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700">Meeting Link Source</label>
                            <div className="inline-flex rounded-md shadow-sm" role="group">
                                <button
                                    type="button"
                                    onClick={() => setMeetingUrlSource('custom')}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-l-lg border ${meetingUrlSource === 'custom' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                                >
                                    Custom URL
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMeetingUrlSource('vimeo')}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-r-lg border ${meetingUrlSource === 'vimeo' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                                >
                                    Vimeo Video
                                </button>
                            </div>
                        </div>
                        
                        {meetingUrlSource === 'custom' ? (
                            <input 
                                type="url" 
                                id="meetingUrl" 
                                name="meetingUrl" 
                                value={formData.meetingUrl} 
                                onChange={handleChange} 
                                placeholder="https://zoom.us/j/..." 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" 
                                required
                            />
                        ) : (
                            <select 
                                id="meetingUrl" 
                                name="meetingUrl" 
                                value={formData.meetingUrl} 
                                onChange={handleChange} 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                required
                            >
                                <option value="">-- Select a Vimeo Video --</option>
                                {vimeoVideos?.map(vid => <option key={vid.id} value={vid.link}>{vid.title}</option>)}
                            </select>
                        )}
                    </div>
                ) : (
                    <div className="md:col-span-2">
                        <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">Recording URL (Vimeo)</label>
                        <select id="videoUrl" name="videoUrl" value={formData.videoUrl} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                            <option value="">-- Select a video --</option>
                            {/* FIX: Use 'link' property as defined in VimeoVideo interface. */}
                            {vimeoVideos?.map(vid => <option key={vid.id} value={vid.link}>{vid.title}</option>)}
                        </select>
                    </div>
                )}
            </div>

             <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg border">
                 <div className="flex items-center">
                    <input type="checkbox" id="isFree" name="isFree" checked={formData.isFree} onChange={handleChange} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
                    <label htmlFor="isFree" className="ml-2 block text-sm text-gray-900">This is a Free Webinar</label>
                </div>
                {!formData.isFree && (
                     <div className="flex-1">
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                        <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onSave} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 font-semibold disabled:bg-primary-300">
                    {loading ? 'Saving...' : 'Save Webinar'}
                </button>
            </div>
        </form>
    );
};

export default WebinarForm;
