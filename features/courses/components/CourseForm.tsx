
import React, { useState, useEffect, ChangeEvent, DragEvent, useRef, useCallback } from 'react';
import { Course, Module, Lesson } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import Modal from '../../../components/ui/Modal';
import ImageUpload from '../../../components/ui/ImageUpload';
import RichTextEditor from '../../../components/ui/RichTextEditor';
import { PlusIcon, EditIcon, DeleteIcon, VideoIcon, FileIcon, QuizIcon, AssignmentIcon, GripVerticalIcon } from '../../../components/icons/index';

// --- LessonForm Component ---
interface LessonFormProps {
    lesson?: Lesson;
    onSave: (lessonData: Omit<Lesson, 'id' | 'tags'> & { tags: string[] }) => void;
    onCancel: () => void;
}

const LessonForm: React.FC<LessonFormProps> = ({ lesson, onSave, onCancel }) => {
    const { vimeoVideos } = useAppContext();
    const [attachmentName, setAttachmentName] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'video' as Lesson['type'],
        contentUrl: '',
        duration: 0,
        tags: '', 
        attachmentUrl: '',
        thumbnailUrl: '',
    });

    useEffect(() => {
        if (lesson) {
            setFormData({
                title: lesson.title,
                description: lesson.description || '',
                type: lesson.type,
                contentUrl: lesson.contentUrl || '',
                duration: lesson.duration || 0,
                tags: (lesson.tags || []).join(', '),
                attachmentUrl: lesson.attachmentUrl || '',
                thumbnailUrl: lesson.thumbnailUrl || '',
            });
            if (lesson.attachmentUrl) {
                setAttachmentName(lesson.attachmentUrl.split('/').pop() || 'File attached');
            }
        }
    }, [lesson]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'duration' ? parseInt(value) || 0 : value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAttachmentName(file.name);
            setFormData(prev => ({ ...prev, attachmentUrl: `/uploads/${file.name}` }));
        }
    };
    
    const handleThumbnailChange = (dataUrl: string) => {
        setFormData(prev => ({ ...prev, thumbnailUrl: dataUrl }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div>
                 <ImageUpload 
                    label="Lesson Thumbnail"
                    currentImageUrl={formData.thumbnailUrl}
                    onFileChange={handleThumbnailChange}
                    aspectRatio="16/9"
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <RichTextEditor value={formData.description} onChange={(val) => setFormData(prev => ({ ...prev, description: val }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Lesson Type</label>
                    <select id="type" name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                        <option value="video">Video</option>
                        <option value="pdf">PDF</option>
                        <option value="quiz">Quiz</option>
                        <option value="assignment">Assignment</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <input type="number" id="duration" name="duration" value={formData.duration} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
            </div>
            {formData.type === 'video' && (
                <div>
                    <label htmlFor="contentUrl" className="block text-sm font-medium text-gray-700 mb-1">Vimeo Video URL</label>
                    <select id="contentUrl" name="contentUrl" value={formData.contentUrl} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                        <option value="">-- Select a video --</option>
                        {/* FIX: Use 'link' property as defined in VimeoVideo interface. */}
                        {vimeoVideos?.map(vid => <option key={vid.id} value={vid.link}>{vid.title}</option>)}
                    </select>
                </div>
            )}
            <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags (Comma separated)</label>
                <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. react, javascript, beginner" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attach Media (PDF or Image)</label>
                <div className="mt-1 flex items-center gap-4 text-sm">
                     <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-500 border border-gray-300 px-3 py-2 shadow-sm">
                         <span>Choose file</span>
                         <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
                     </label>
                     <p className="text-gray-500 italic">{attachmentName || 'No file chosen'}</p>
                </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-700 font-semibold shadow-md transition-all">Save Lesson</button>
            </div>
        </form>
    );
}

// --- CourseForm Component (Course Builder) ---
interface CourseFormProps {
    course?: Course;
    onSave: () => void;
}

type Tab = 'info' | 'media' | 'curriculum';
type DraggedItem = { type: 'module' | 'lesson'; moduleIndex: number; lessonIndex?: number; };
type DropIndicator = { moduleIndex: number; lessonIndex?: number; position: 'top' | 'bottom' };


const CourseForm: React.FC<CourseFormProps> = ({ course, onSave }) => {
    const { categories, vimeoVideos, addCourse, updateCourse, instructors } = useAppContext();
    const [activeTab, setActiveTab] = useState<Tab>('info');
    
    const getInitialFormData = useCallback(() => ({
        title: '', description: '', price: 0,
        category: categories?.[0]?.name || '',
        duration: '',
        instructorId: instructors?.[0]?.id || '',
        posterImageUrl: '', bannerImageUrl: '',
        introVideoUrl: '', modules: [], accessType: 'lifetime' as 'lifetime' | 'expiry', accessDuration: null, enableCertificate: false
    }), [categories, instructors]);
    
    const [formData, setFormData] = useState<Omit<Course, 'id'>>(getInitialFormData());

    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [editingLessonInfo, setEditingLessonInfo] = useState<{ module: Module, lesson?: Lesson } | null>(null);

    const draggedItem = useRef<DraggedItem | null>(null);
    const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title || '',
                description: course.description || '',
                price: course.price || 0,
                category: course.category || categories?.[0]?.name || '',
                duration: course.duration || '',
                instructorId: course.instructorId || instructors?.[0]?.id || '',
                posterImageUrl: course.posterImageUrl || '',
                bannerImageUrl: course.bannerImageUrl || '',
                introVideoUrl: course.introVideoUrl || '',
                accessType: course.accessType || 'lifetime',
                accessDuration: course.accessDuration || null,
                enableCertificate: !!course.enableCertificate,
                modules: Array.isArray(course.modules) ? course.modules : [],
            });
        } else {
            setFormData(getInitialFormData());
        }
    }, [course, categories, instructors, getInitialFormData]);
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }

        if (name === 'accessType') {
            setFormData(prev => ({
                ...prev,
                accessType: value as 'lifetime' | 'expiry',
                accessDuration: value === 'lifetime' ? null : (prev.accessDuration || 30),
            }));
        } else if (name === 'accessDuration') {
            setFormData(prev => ({ ...prev, accessDuration: value ? parseInt(value) : null }));
        } else {
            setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
        }
    };

    const handleFileChange = (fieldName: 'posterImageUrl' | 'bannerImageUrl', dataUrl: string) => {
        setFormData(prev => ({ ...prev, [fieldName]: dataUrl }));
    };

    const handleDragStart = (e: DragEvent, item: DraggedItem) => {
        draggedItem.current = item;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', ''); 
    };

    const handleDragOver = (e: DragEvent, targetModuleIndex: number, targetLessonIndex?: number) => {
        e.preventDefault();
        if (!draggedItem.current) return;

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const isDraggingModule = draggedItem.current.type === 'module';
        const position = e.clientY - rect.top > rect.height / 2 ? 'bottom' : 'top';
        
        if (isDraggingModule) {
            setDropIndicator({ moduleIndex: targetModuleIndex, position });
        } else {
            setDropIndicator({ moduleIndex: targetModuleIndex, lessonIndex: targetLessonIndex, position });
        }
    };
    
    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        if (!draggedItem.current || !dropIndicator) return;
        
        const { type, moduleIndex: fromModuleIdx, lessonIndex: fromLessonIdx } = draggedItem.current;
        const { moduleIndex: toModuleIdx, lessonIndex: toLessonIdx, position } = dropIndicator;
        
        let newModules = JSON.parse(JSON.stringify(formData.modules));

        if (type === 'lesson') {
            const lesson = newModules[fromModuleIdx].lessons.splice(fromLessonIdx, 1)[0];
            let targetIdx = toLessonIdx !== undefined ? (position === 'top' ? toLessonIdx : toLessonIdx + 1) : newModules[toModuleIdx].lessons.length;
            if (fromModuleIdx === toModuleIdx && fromLessonIdx < targetIdx) {
                targetIdx--;
            }
            newModules[toModuleIdx].lessons.splice(targetIdx, 0, lesson);
        } else if (type === 'module') {
            const [module] = newModules.splice(fromModuleIdx, 1);
            const targetIdx = position === 'top' ? toModuleIdx : toModuleIdx + 1;
            newModules.splice(fromModuleIdx < targetIdx ? targetIdx - 1 : targetIdx, 0, module);
        }

        setFormData(prev => ({ ...prev, modules: newModules }));
        draggedItem.current = null;
        setDropIndicator(null);
    };

    const handleDragEnd = () => {
        draggedItem.current = null;
        setDropIndicator(null);
    };

    const addModule = () => {
        const newModule: Module = { id: `mod-${Date.now()}`, title: `New Module ${formData.modules.length + 1}`, lessons: [] };
        setFormData(prev => ({ ...prev, modules: [...prev.modules, newModule] }));
    };

    const updateModuleTitle = (moduleId: string, newTitle: string) => {
        setFormData(prev => ({ ...prev, modules: prev.modules.map(m => m.id === moduleId ? { ...m, title: newTitle } : m) }));
    };

    const deleteModule = (moduleId: string) => {
        setFormData(prev => ({ ...prev, modules: prev.modules.filter(m => m.id !== moduleId) }));
    };

    const openLessonModal = (module: Module, lesson?: Lesson) => {
        setEditingLessonInfo({ module, lesson });
        setIsLessonModalOpen(true);
    };

    const closeLessonModal = () => {
        setIsLessonModalOpen(false);
        setEditingLessonInfo(null);
    };

    const handleSaveLesson = (lessonData: Omit<Lesson, 'id'>) => {
        if (!editingLessonInfo) return;
        const { module, lesson: editingLesson } = editingLessonInfo;
        if (editingLesson) {
            const updatedLesson = { ...editingLesson, ...lessonData };
            setFormData(prev => ({ ...prev, modules: prev.modules.map(m => m.id === module.id ? { ...m, lessons: m.lessons.map(l => l.id === updatedLesson.id ? updatedLesson : l) } : m) }));
        } else {
            const newLesson: Lesson = { ...lessonData, id: `les-${Date.now()}` };
            setFormData(prev => ({ ...prev, modules: prev.modules.map(m => m.id === module.id ? { ...m, lessons: [...m.lessons, newLesson] } : m) }));
        }
        closeLessonModal();
    };

    const deleteLesson = (moduleId: string, lessonId: string) => {
        setFormData(prev => ({ ...prev, modules: prev.modules.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m) }));
    };

    const getLessonIcon = (type: Lesson['type']) => {
        switch (type) {
            case 'video': return <VideoIcon className="w-5 h-5 text-red-500" />;
            case 'pdf': return <FileIcon className="w-5 h-5 text-blue-500" />;
            case 'quiz': return <QuizIcon className="w-5 h-5 text-green-500" />;
            case 'assignment': return <AssignmentIcon className="w-5 h-5 text-yellow-500" />;
            default: return null;
        }
    };
    
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        try {
            if (course) {
                await updateCourse({ ...course, ...formData });
            } else {
                await addCourse(formData);
            }
            onSave();
        } catch (err) {
            // Toast handled by AppContext
        }
    };

    const TabButton: React.FC<{ tabName: Tab; label: string; }> = ({ tabName, label }) => (
        <button type="button" onClick={() => setActiveTab(tabName)} className={`px-6 py-3 font-semibold text-sm rounded-t-lg transition-all ${activeTab === tabName ? 'border-b-4 border-primary text-primary bg-primary-50 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            {label}
        </button>
    );

    const DropZone = ({ moduleIndex, lessonIndex }: { moduleIndex: number; lessonIndex?: number }) => {
        const showTop = dropIndicator?.moduleIndex === moduleIndex && dropIndicator?.lessonIndex === lessonIndex && dropIndicator.position === 'top';
        const showBottom = dropIndicator?.moduleIndex === moduleIndex && dropIndicator?.lessonIndex === lessonIndex && dropIndicator.position === 'bottom';
        return (
            <>
                {showTop && <div className="h-1 bg-primary-400 rounded-full mx-2 my-1 animate-pulse"></div>}
                {showBottom && <div className="h-1 bg-primary-400 rounded-full mx-2 my-1 animate-pulse"></div>}
            </>
        )
    };

    return (
        <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
            <div className="flex border-b border-gray-200">
                <TabButton tabName="info" label="1. Basic Info" />
                <TabButton tabName="media" label="2. Media Assets" />
                <TabButton tabName="curriculum" label="3. Curriculum Builder" />
            </div>
            
            {/* Main Form Content */}
            <form onSubmit={handleSubmit}>
                <div className="py-6 min-h-[400px]">
                    {activeTab === 'info' && (
                        <div className="space-y-6 max-w-4xl mx-auto px-4">
                            <InputField label="Course Title" name="title" value={formData.title} onChange={handleChange} />
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Course Description</label>
                                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={5} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Price (₹)" name="price" type="number" value={formData.price} onChange={handleChange} />
                                <InputField label="Category" name="category" value={formData.category} onChange={handleChange}>
                                    <select id="category" name="category" value={formData.category} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                                        <option value="" disabled>Select Category</option>
                                        {categories?.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                    </select>
                                </InputField>
                                <InputField label="Instructor" name="instructorId" value={formData.instructorId} onChange={handleChange}>
                                    <select id="instructorId" name="instructorId" value={formData.instructorId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                                        <option value="" disabled>Select Instructor</option>
                                        {instructors?.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                                    </select>
                                </InputField>
                                <InputField label="Total Duration" name="duration" placeholder="e.g. 15 hours" value={formData.duration} onChange={handleChange} />
                            
                                <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-2 space-y-6">
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-3 border-b pb-2">Access Control</h4>
                                        <div className="flex items-center space-x-8">
                                            <label className="flex items-center cursor-pointer group">
                                                <input type="radio" id="lifetime" name="accessType" value="lifetime" checked={formData.accessType === 'lifetime'} onChange={handleChange} className="focus:ring-primary h-5 w-5 text-primary border-gray-300" />
                                                <span className="ml-3 font-medium text-gray-700 group-hover:text-primary transition-colors">Lifetime Access</span>
                                            </label>
                                            <label className="flex items-center cursor-pointer group">
                                                <input type="radio" id="expiry" name="accessType" value="expiry" checked={formData.accessType === 'expiry'} onChange={handleChange} className="focus:ring-primary h-5 w-5 text-primary border-gray-300" />
                                                <span className="ml-3 font-medium text-gray-700 group-hover:text-primary transition-colors">Limited Time Access</span>
                                            </label>
                                        </div>
                                        {formData.accessType === 'expiry' && (
                                            <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                                                <label htmlFor="accessDuration" className="block text-sm font-semibold text-gray-700 mb-1">Access Duration (Days)</label>
                                                <input 
                                                    type="number" 
                                                    id="accessDuration" 
                                                    name="accessDuration" 
                                                    value={formData.accessDuration || ''} 
                                                    onChange={handleChange} 
                                                    placeholder="e.g. 365"
                                                    min="1"
                                                    className="w-full md:w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" 
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-4">
                                        <h4 className="font-bold text-gray-900 mb-3 border-b pb-2">Course Options</h4>
                                        <label htmlFor="enableCertificate" className="flex items-center cursor-pointer group">
                                            <div className="relative">
                                                <input type="checkbox" id="enableCertificate" name="enableCertificate" className="sr-only" checked={formData.enableCertificate} onChange={handleChange} />
                                                <div className={`block w-12 h-7 rounded-full transition-all duration-200 ${formData.enableCertificate ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                                <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-200 ${formData.enableCertificate ? 'translate-x-5' : ''}`}></div>
                                            </div>
                                            <div className="ml-4 font-medium text-gray-700 group-hover:text-primary transition-colors">Issue Certificate on Completion</div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'media' && (
                        <div className="space-y-8 max-w-4xl mx-auto px-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <ImageUpload label="Poster Image (Card View)" aspectRatio="16/9" currentImageUrl={formData.posterImageUrl} onFileChange={(dataUrl) => handleFileChange('posterImageUrl', dataUrl)} />
                                 <ImageUpload label="Banner Image (Header View)" aspectRatio="16/9" currentImageUrl={formData.bannerImageUrl} onFileChange={(dataUrl) => handleFileChange('bannerImageUrl', dataUrl)} />
                            </div>
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <label htmlFor="introVideoUrl" className="block text-sm font-bold text-gray-900 mb-2">Introduction Video (Trailer)</label>
                                <select id="introVideoUrl" name="introVideoUrl" value={formData.introVideoUrl} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white shadow-sm">
                                    <option value="">-- No Video (Select to add) --</option>
                                    {/* FIX: Use 'link' property as defined in VimeoVideo interface. */}
                                    {vimeoVideos?.map(vid => <option key={vid.id} value={vid.link}>{vid.title}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                    {activeTab === 'curriculum' && (
                        <div className="max-w-5xl mx-auto px-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Modules & Lessons</h3>
                                <button type="button" onClick={addModule} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-700 transition-all shadow-sm">
                                    <PlusIcon className="w-5 h-5 mr-2" /> Add Module
                                </button>
                            </div>
                            <div className="space-y-6">
                                {formData.modules?.map((module, mIndex) => (
                                    <div key={module.id} className="relative group">
                                        <DropZone moduleIndex={mIndex} lessonIndex={undefined} />
                                        <div className="bg-white rounded-xl border-2 border-gray-100 shadow-sm overflow-hidden" onDragOver={(e) => handleDragOver(e, mIndex)}>
                                            <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between" draggable onDragStart={(e) => handleDragStart(e, { type: 'module', moduleIndex: mIndex })} onDragEnd={handleDragEnd}>
                                                <div className="flex items-center flex-grow group/title">
                                                    <GripVerticalIcon className="w-6 h-6 text-gray-400 cursor-grab mr-3" />
                                                    <input 
                                                        type="text" 
                                                        value={module.title} 
                                                        onChange={(e) => updateModuleTitle(module.id, e.target.value)} 
                                                        className="font-bold text-lg text-gray-900 border-b-2 border-transparent focus:border-primary focus:outline-none w-full bg-transparent px-1 transition-colors" 
                                                    />
                                                </div>
                                                <button type="button" onClick={() => deleteModule(module.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all" title="Delete Module"><DeleteIcon className="w-5 h-5" /></button>
                                            </div>
                                            <div className="p-4 space-y-2">
                                                {module.lessons?.map((lesson, lIndex) => (
                                                    <div key={lesson.id} >
                                                        <DropZone moduleIndex={mIndex} lessonIndex={lIndex} />
                                                        <div className="flex items-center justify-between bg-white border border-gray-100 hover:border-primary-200 hover:shadow-md p-3 rounded-xl group/lesson transition-all" draggable onDragStart={(e) => handleDragStart(e, { type: 'lesson', moduleIndex: mIndex, lessonIndex: lIndex })} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, mIndex, lIndex)}>
                                                            <div className="flex items-center space-x-3 flex-grow">
                                                                <GripVerticalIcon className="w-5 h-5 text-gray-300 cursor-grab" />
                                                                <div className="p-2 bg-gray-50 rounded-lg">
                                                                    {getLessonIcon(lesson.type)}
                                                                </div>
                                                                {lesson.thumbnailUrl && <img src={lesson.thumbnailUrl} alt="Thumb" className="w-12 h-8 object-cover rounded-md shadow-sm border border-gray-100" />}
                                                                <div className="flex flex-col">
                                                                    <span className="text-gray-900 font-semibold text-sm">{lesson.title}</span>
                                                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{lesson.type} • {lesson.duration} mins</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center opacity-0 group-hover/lesson:opacity-100 transition-all space-x-1">
                                                                <button type="button" onClick={() => openLessonModal(module, lesson)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="Edit Lesson"><EditIcon className="w-4 h-4" /></button>
                                                                <button type="button" onClick={() => deleteLesson(module.id, lesson.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full" title="Delete Lesson"><DeleteIcon className="w-4 h-4" /></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <DropZone moduleIndex={mIndex} lessonIndex={module.lessons.length} />
                                                <button type="button" onClick={() => openLessonModal(module)} className="w-full flex items-center justify-center text-sm text-primary font-bold py-3 bg-primary-50 border-2 border-dashed border-primary-100 rounded-xl mt-3 hover:bg-primary-100 hover:border-primary-200 transition-all">
                                                    <PlusIcon className="w-5 h-5 mr-2" /> Add Lesson to this Module
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {formData.modules.length === 0 && (
                                <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                                    <VideoIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">Your curriculum is empty. Start by adding a module.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center mt-8 shadow-inner z-10">
                    <p className="text-sm text-gray-500 font-medium italic">Changes are saved to the server only when you click "Publish Course"</p>
                    <div className="flex space-x-4">
                        <button type="button" onClick={onSave} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">Discard</button>
                        <button type="submit" className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all transform hover:-translate-y-0.5">Publish Course</button>
                    </div>
                </div>
            </form>

            {/* MODAL IS NOW OUTSIDE OF MAIN FORM TO PREVENT NESTED FORM ISSUES */}
            <Modal isOpen={isLessonModalOpen} onClose={closeLessonModal} title={editingLessonInfo?.lesson ? "Edit Lesson Details" : "New Lesson Details"} size="lg">
                <LessonForm lesson={editingLessonInfo?.lesson} onSave={handleSaveLesson} onCancel={closeLessonModal} />
            </Modal>
        </div>
    );
};

const InputField: React.FC<{ label: string; name: string; type?: string; value: string | number; onChange: (e: any) => void; required?: boolean; children?: React.ReactNode; placeholder?: string }> =
    ({ label, name, type = 'text', value, onChange, required = true, children, placeholder }) => (
        <div className="space-y-1">
            <label htmlFor={name} className="block text-sm font-bold text-gray-900">{label}</label>
            {children ? children :
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
                />
            }
        </div>
    );

export default CourseForm;
