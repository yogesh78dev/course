import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Course, ReviewStatus } from '../../types';
import { EditIcon, DeleteIcon, PlusIcon, StarIcon } from '../../components/icons/index';
import Modal from '../../components/ui/Modal';
import CourseForm from './components/CourseForm';
import Tooltip from '../../components/ui/Tooltip';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import * as api from '../../services/api';

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-4 h-4 text-yellow-400" filled={i < rating} />
            ))}
        </div>
    );
};

const Courses: React.FC = () => {
    const { courses, categories, deleteCourse, reviews, instructors, addToast } = useAppContext();
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [filterType, setFilterType] = useState<'All' | 'Free' | 'Paid'>('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined);
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
    const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);

    const openAddModal = () => {
        setEditingCourse(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = async (course: Course) => {
        setLoadingCourseId(course.id);
        try {
            // Fetch full course details including modules and lessons
            const res = await api.getCourseById(course.id);
            setEditingCourse(res.data);
            setIsModalOpen(true);
        } catch (error: any) {
            console.error("Failed to fetch full course details:", error);
            addToast("Failed to load course curriculum. Please try again.", 'error');
        } finally {
            setLoadingCourseId(null);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCourse(undefined);
    };

    const handleDelete = () => {
        if(courseToDelete) {
            deleteCourse(courseToDelete.id);
            setCourseToDelete(null);
        }
    };

    const getAverageRating = (courseId: string) => {
        const courseReviews = reviews.filter(r => r.courseId === courseId && r.status === ReviewStatus.APPROVED);
        if (courseReviews.length === 0) return { avg: 0, count: 0 };
        const totalRating = courseReviews.reduce((acc, r) => acc + r.rating, 0);
        return {
            avg: totalRating / courseReviews.length,
            count: courseReviews.length,
        };
    };

    const filteredCourses = courses.filter(course => {
        const matchesCategory = filterCategory === 'All' || course.category === filterCategory;
        const matchesType = filterType === 'All' 
            ? true 
            : filterType === 'Free' 
                ? course.price == 0 
                : course.price > 0;
        return matchesCategory && matchesType;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Courses</h2>
                <button onClick={openAddModal} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Add New Course
                </button>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                    <label htmlFor="category-filter" className="font-medium text-gray-700">Category:</label>
                    <select 
                        id="category-filter"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
                    >
                        <option value="All">All Categories</option>
                        {categories?.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                </div>

                <div className="flex items-center space-x-2">
                    <label htmlFor="type-filter" className="font-medium text-gray-700">Type:</label>
                    <select 
                        id="type-filter"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as 'All' | 'Free' | 'Paid')}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
                    >
                        <option value="All">All Types</option>
                        <option value="Free">Free Courses</option>
                        <option value="Paid">Paid Courses</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-semibold text-sm text-gray-600">Course Title</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Category</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Rating</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Price</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Instructor</th>
                                <th className="p-4 font-semibold text-sm text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredCourses?.map(course => {
                                const { avg, count } = getAverageRating(course.id);
                                const instructor = instructors.find(i => i.id === course.instructorId);
                                const isThisCourseLoading = loadingCourseId === course.id;

                                return (
                                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 flex items-center">
                                            <img src={course.posterImageUrl} alt={course.title} className="w-16 h-10 object-cover rounded-md mr-4"/>
                                            <div>
                                                <p className="font-medium text-gray-900">{course.title}</p>
                                                <p className="text-sm text-gray-500">{course.duration}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-700">{course.category}</td>
                                        <td className="p-4 text-gray-700">
                                            {count > 0 ? (
                                                <div className="flex items-center space-x-1">
                                                    <StarRating rating={avg} />
                                                    <span className="text-xs text-gray-500">({count})</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">No ratings</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-900 font-semibold">
                                            {course.price === 0 ? (
                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">FREE</span>
                                            ) : (
                                                `₹${Number(course.price).toFixed(2)}`
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-700">{instructor?.name || 'N/A'}</td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <Tooltip text={isThisCourseLoading ? "Loading details..." : "Edit Course"}>
                                                    <button 
                                                        onClick={() => openEditModal(course)} 
                                                        disabled={isThisCourseLoading}
                                                        className={`p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors ${isThisCourseLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {isThisCourseLoading ? (
                                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        ) : (
                                                            <EditIcon className="w-5 h-5"/>
                                                        )}
                                                    </button>
                                                </Tooltip>
                                                <Tooltip text="Delete Course">
                                                    <button onClick={() => setCourseToDelete(course)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors">
                                                        <DeleteIcon className="w-5 h-5"/>
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                 {filteredCourses.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No courses found matching the filters.
                    </div>
                )}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCourse ? "Edit Course" : "Add New Course"} size="5xl">
                <CourseForm course={editingCourse} onSave={closeModal}/>
            </Modal>
            <ConfirmationModal
                isOpen={!!courseToDelete}
                onClose={() => setCourseToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Course"
                message={`Are you sure you want to delete the course "${courseToDelete?.title}"? This action cannot be undone.`}
                confirmText="Delete"
            />
        </div>
    );
};

export default Courses;
