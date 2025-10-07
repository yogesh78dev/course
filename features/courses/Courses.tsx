import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Course, ReviewStatus } from '../../types';
import { EditIcon, DeleteIcon, PlusIcon, StarIcon } from '../../components/icons/index';
import Modal from '../../components/ui/Modal';
import CourseForm from './components/CourseForm';
import Tooltip from '../../components/ui/Tooltip';

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
    const { courses, categories, deleteCourse, reviews, instructors } = useAppContext();
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined);

    const openAddModal = () => {
        setEditingCourse(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (course: Course) => {
        setEditingCourse(course);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCourse(undefined);
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

    const filteredCourses = filterCategory === 'All'
        ? courses
        : courses.filter(course => course.category === filterCategory);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Courses</h2>
                <button onClick={openAddModal} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2"/>
                    Add New Course
                </button>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
                <label htmlFor="category-filter" className="font-medium text-gray-700">Filter by Category:</label>
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

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
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
                            return (
                                <tr key={course.id}>
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
                                    <td className="p-4 text-gray-900 font-semibold">₹{Number(course.price).toFixed(2)}</td>
                                    <td className="p-4 text-gray-700">{instructor?.name || 'N/A'}</td>
                                    <td className="p-4">
                                        <div className="flex space-x-2">
                                            <Tooltip text="Edit Course">
                                                <button onClick={() => openEditModal(course)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors">
                                                    <EditIcon className="w-5 h-5"/>
                                                </button>
                                            </Tooltip>
                                            <Tooltip text="Delete Course">
                                                <button onClick={() => deleteCourse(course.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors">
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
                 {filteredCourses.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No courses found for this category.
                    </div>
                )}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCourse ? "Edit Course" : "Add New Course"} size="5xl">
                <CourseForm course={editingCourse} onSave={closeModal}/>
            </Modal>
        </div>
    );
};

export default Courses;