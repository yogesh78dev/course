import React, { useState, useEffect, ChangeEvent, DragEvent, useRef } from 'react';
import { Course, Module, Lesson } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import Modal from '../../../components/ui/Modal';
import ImageUpload from '../../../components/ui/ImageUpload';
import RichTextEditor from '../../../components/ui/RichTextEditor';
// FIX: Corrected the import path for icons from '../../../components/icons' to '../../../components/icons/index' to resolve module loading error.
import { PlusIcon, EditIcon, DeleteIcon, VideoIcon, FileIcon, QuizIcon, AssignmentIcon, GripVerticalIcon } from '../../../components/icons/index';

// --- LessonForm Component ---
interface LessonFormProps {
    lesson?: Lesson;
    onSave: (lessonData: Omit<Lesson, 'id' | 'tags'> & { tags: string[] }) => void;
}

const LessonForm: React.FC<LessonFormProps> = ({ lesson, onSave }) => {
    const { vimeoVideos } = useAppContext();
    const [attachmentName, setAttachmentName] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'video' as Lesson['type'],
        contentUrl: '',
        duration: 0,
        tags: '', // Stored as a comma-separated string for the input field
        attachmentUrl: '',
    });

    useEffect(() => {
        if (lesson) {
            setFormData({
                title: lesson.title,
                description: lesson.description,
                type: lesson.type,
                contentUrl: lesson.contentUrl,
                duration: lesson.duration,
                tags: lesson.tags.join(', '),
                attachmentUrl: lesson.attachmentUrl,
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
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <RichTextEditor value={formData.description} onChange={(val) => setFormData(prev => ({ ...prev, description: val }))} />
            </div>
            {formData.type === 'video' && (
                <div>
                    <label htmlFor="contentUrl" className="block text-sm font-medium text-gray-700 mb-1">Vimeo Video</label>
                    <select id="contentUrl" name="contentUrl" value={formData.contentUrl} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                        <option value="">-- Select a video --</option>
                        {vimeoVideos.map(vid => <option key={vid.id} value={vid.url}>{vid.title}</option>)}
                    </select>
                </div>
            )}
            <div className="grid grid-cols-2 gap-4">
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
            <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. react, javascript, beginner" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attach Media (PDF or Image)</label>
                <div className="mt-1 flex items-center gap-4 text-sm">
                     <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-500 border border-gray-300 px-3 py-2">
                         <span>Choose file</span>
                         <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
                     </label>
                     <p className="text-gray-500">{attachmentName || 'No file chosen'}</p>
                </div>
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-700 font-semibold">Save Lesson</button>
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
    const [formData, setFormData] = useState<Omit<Course, 'id'>>({
        title: '', description: '', price: 0, category: categories[0]?.name || '',
        duration: '', instructorId: instructors[0]?.id || '', posterImageUrl: '', bannerImageUrl: '',
        introVideoUrl: '', modules: [], accessType: 'lifetime', accessDuration: null, enableCertificate: false
    });

    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [editingLessonInfo, setEditingLessonInfo] = useState<{ module: Module, lesson?: Lesson } | null>(null);

    const draggedItem = useRef<DraggedItem | null>(null);
    const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);

    useEffect(() => { if (course) setFormData(course); }, [course]);
    
    useEffect(() => {
        if (!course && instructors.length > 0) {
            setFormData(prev => ({...prev, instructorId: prev.instructorId || instructors[0].id}));
        }
    }, [instructors, course]);

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
            setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
        }
    };

    const handleFileChange = (fieldName: 'posterImageUrl' | 'bannerImageUrl', dataUrl: string) => {
        setFormData(prev => ({ ...prev, [fieldName]: dataUrl }));
    };

    const handleDragStart = (e: DragEvent, item: DraggedItem) => {
        draggedItem.current = item;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', ''); // For Firefox
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
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (course) {
            updateCourse({ ...course, ...formData });
        } else {
            addCourse(formData);
        }
        onSave();
    };

    const TabButton: React.FC<{ tabName: Tab; label: string; }> = ({ tabName, label }) => (
        <button type="button" onClick={() => setActiveTab(tabName)} className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === tabName ? 'border-b-2 border-primary text-primary bg-primary-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            {label}
        </button>
    );

    const DropZone = ({ moduleIndex, lessonIndex }: { moduleIndex: number; lessonIndex?: number }) => {
        const showTop = dropIndicator?.moduleIndex === moduleIndex && dropIndicator?.lessonIndex === lessonIndex && dropIndicator.position === 'top';
        const showBottom = dropIndicator?.moduleIndex === moduleIndex && dropIndicator?.lessonIndex === lessonIndex && dropIndicator.position === 'bottom';
        return (
            <>
                {showTop && <div className="h-1 bg-primary-300 rounded-full mx-2 my-1"></div>}
                {showBottom && <div className="h-1 bg-primary-300 rounded-full mx-2 my-1"></div>}
            </>
        )
    };

    return (
        <form onSubmit={handleSubmit} onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
            <div className="flex border-b border-gray-200">
                <TabButton tabName="info" label="Course Info" />
                <TabButton tabName="media" label="Media" />
                <TabButton tabName="curriculum" label="Curriculum" />
            </div>
            <div className="py-6">
                {activeTab === 'info' && (
                    <div className="space-y-6 max-w-3xl mx-auto">
                        <InputField label="Course Title" name="title" value={formData.title} onChange={handleChange} />
                        <InputField label="Description" name="description" value={formData.description} onChange={handleChange}>
                            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"></textarea>
                        </InputField>
                        <div className="grid grid-cols-2 gap-6">
                            <InputField label="Price (₹)" name="price" type="number" value={formData.price} onChange={handleChange} />
                            <InputField label="Category" name="category" value={formData.category} onChange={handleChange}>
                                <select id="category" name="category" value={formData.category} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                </select>
                            </InputField>
                            <InputField label="Instructor" name="instructorId" value={formData.instructorId} onChange={handleChange}>
                                <select id="instructorId" name="instructorId" value={formData.instructorId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                                    {instructors.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                                </select>
                            </InputField>
                            <InputField label="Duration (e.g., 10 hours)" name="duration" value={formData.duration} onChange={handleChange} />
                        
                            <div className="col-span-2 bg-gray-50 p-4 rounded-lg border mt-2 space-y-4">
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Access Control</h4>
                                    <div className="flex items-center space-x-6">
                                        <div className="flex items-center">
                                            <input type="radio" id="lifetime" name="accessType" value="lifetime" checked={formData.accessType === 'lifetime'} onChange={handleChange} className="focus:ring-primary h-4 w-4 text-primary border-gray-300" />
                                            <label htmlFor="lifetime" className="ml-2 block text-sm text-gray-900">Lifetime Access</label>
                                        </div>
                                        <div className="flex items-center">
                                            <input type="radio" id="expiry" name="accessType" value="expiry" checked={formData.accessType === 'expiry'} onChange={handleChange} className="focus:ring-primary h-4 w-4 text-primary border-gray-300" />
                                            <label htmlFor="expiry" className="ml-2 block text-sm text-gray-900">Limited Time</label>
                                        </div>
                                    </div>
                                    {formData.accessType === 'expiry' && (
                                        <div className="mt-4">
                                            <label htmlFor="accessDuration" className="block text-sm font-medium text-gray-700 mb-1">Access Duration (days)</label>
                                            <input 
                                                type="number" 
                                                id="accessDuration" 
                                                name="accessDuration" 
                                                value={formData.accessDuration || ''} 
                                                onChange={handleChange} 
                                                placeholder="e.g., 365"
                                                min="1"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" 
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Certification</h4>
                                    <label htmlFor="enableCertificate" className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input type="checkbox" id="enableCertificate" name="enableCertificate" className="sr-only" checked={formData.enableCertificate} onChange={handleChange} />
                                            <div className={`block w-10 h-6 rounded-full transition-colors ${formData.enableCertificate ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.enableCertificate ? 'translate-x-4' : ''}`}></div>
                                        </div>
                                        <div className="ml-3 text-sm text-gray-700">Enable Certificate of Completion</div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'media' && (
                    <div className="space-y-6 max-w-3xl mx-auto">
                        <ImageUpload label="Poster Image" aspectRatio="16/9" currentImageUrl={formData.posterImageUrl} onFileChange={(dataUrl) => handleFileChange('posterImageUrl', dataUrl)} />
                        <ImageUpload label="Banner Image" aspectRatio="20/6" currentImageUrl={formData.bannerImageUrl} onFileChange={(dataUrl) => handleFileChange('bannerImageUrl', dataUrl)} />
                        <InputField label="Intro Video" name="introVideoUrl" value={formData.introVideoUrl} onChange={handleChange}>
                            <select id="introVideoUrl" name="introVideoUrl" value={formData.introVideoUrl} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                                <option value="">-- Select a video --</option>
                                {vimeoVideos.map(vid => <option key={vid.id} value={vid.url}>{vid.title}</option>)}
                            </select>
                        </InputField>
                    </div>
                )}
                {activeTab === 'curriculum' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border max-h-[60vh] overflow-y-auto">
                        {formData.modules.map((module, mIndex) => (
                            <div key={module.id}>
                                <DropZone moduleIndex={mIndex} lessonIndex={undefined} />
                                <div className="bg-white p-3 rounded-md border shadow-sm group" onDragOver={(e) => handleDragOver(e, mIndex)}>
                                    <div className="flex items-center justify-between" draggable onDragStart={(e) => handleDragStart(e, { type: 'module', moduleIndex: mIndex })} onDragEnd={handleDragEnd}>
                                        <div className="flex items-center flex-grow">
                                            <GripVerticalIcon className="w-5 h-5 text-gray-400 cursor-grab mr-2" />
                                            <input type="text" value={module.title} onChange={(e) => updateModuleTitle(module.id, e.target.value)} className="font-semibold text-gray-800 border-b-2 border-transparent focus:border-primary focus:outline-none w-full bg-transparent" />
                                        </div>
                                        <button type="button" onClick={() => deleteModule(module.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity"><DeleteIcon className="w-4 h-4" /></button>
                                    </div>
                                    <div className="mt-2 space-y-1 pl-4 border-l-2 ml-2">
                                        {module.lessons.map((lesson, lIndex) => (
                                            <div key={lesson.id} >
                                                <DropZone moduleIndex={mIndex} lessonIndex={lIndex} />
                                                <div className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-2 rounded group/lesson" draggable onDragStart={(e) => handleDragStart(e, { type: 'lesson', moduleIndex: mIndex, lessonIndex: lIndex })} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, mIndex, lIndex)}>
                                                    <div className="flex items-center space-x-2 flex-grow">
                                                        <GripVerticalIcon className="w-5 h-5 text-gray-400 cursor-grab" />
                                                        {getLessonIcon(lesson.type)}
                                                        <div className="flex flex-col text-sm">
                                                            <span className="text-gray-800 font-medium">{lesson.title}</span>
                                                            <span className="text-xs text-gray-500">{lesson.contentUrl ? `Video: ${vimeoVideos.find(v=>v.url===lesson.contentUrl)?.title || 'Selected'}` : ''}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                                        <span className="text-xs text-gray-500 mr-2">({lesson.duration}m)</span>
                                                        <button type="button" onClick={() => openLessonModal(module, lesson)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"><EditIcon className="w-4 h-4" /></button>
                                                        <button type="button" onClick={() => deleteLesson(module.id, lesson.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><DeleteIcon className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <DropZone moduleIndex={mIndex} lessonIndex={module.lessons.length} />
                                        <button type="button" onClick={() => openLessonModal(module)} className="flex items-center text-sm text-primary font-medium px-2 py-1 hover:bg-primary-50 rounded mt-1">
                                            <PlusIcon className="w-4 h-4 mr-1" /> Add Lesson
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addModule} className="w-full flex items-center justify-center bg-primary-50 text-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary-100 transition-colors border-2 border-dashed border-primary-200 mt-2">
                            <PlusIcon className="w-5 h-5 mr-2" /> Add Module
                        </button>
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={onSave} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700">Save Course</button>
            </div>

            <Modal isOpen={isLessonModalOpen} onClose={closeLessonModal} title={editingLessonInfo?.lesson ? "Edit Lesson" : "Add New Lesson"} size="lg">
                <LessonForm lesson={editingLessonInfo?.lesson} onSave={handleSaveLesson} />
            </Modal>
        </form>
    );
};

const InputField: React.FC<{ label: string; name: string; type?: string; value: string | number; onChange: (e: any) => void; required?: boolean; children?: React.ReactNode }> =
    ({ label, name, type = 'text', value, onChange, required = true, children }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {children ? children :
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
            }
        </div>
    );

export default CourseForm;