import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { Course, CourseDetailsPayload, WatchHistoryMap, StudentReview } from '../../types';
import StudentHeader from '../../components/layout/StudentHeader';
// FIX: Corrected the import path for icons from '../../components/icons' to '../../components/icons/index' to resolve module loading error.
import { CheckIcon, StarIcon } from '../../components/icons/index';

interface StudentPortalProps {
    onLogout: () => void;
    onExitStudentView: () => void;
}

// Sub-component for the dashboard view
const StudentDashboard: React.FC<{ onSelectCourse: (id: string) => void; courses: Course[]; }> = ({ onSelectCourse, courses }) => {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
                <p className="text-gray-600 mt-1">Continue your learning journey.</p>
            </div>
            {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} onClick={() => onSelectCourse(course.id)} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden group transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                            <img src={course.posterImageUrl} alt={course.title} className="w-full h-40 object-cover" />
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{course.title}</h3>
                                <p className="text-sm text-gray-600 mb-4">{course.category}</p>
                                <div className="w-full bg-primary text-white font-semibold py-2 rounded-lg text-center">
                                    Continue Learning
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                    <h3 className="text-lg font-medium text-gray-900">You are not enrolled in any courses yet.</h3>
                    <p className="text-gray-500 mt-1">Explore our course catalog to get started!</p>
                </div>
            )}
        </div>
    );
};

// Sub-component for the course player view
const CoursePlayer: React.FC<{ courseId: string; onBack: () => void; }> = ({ courseId, onBack }) => {
    const [details, setDetails] = useState<CourseDetailsPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'review'>('overview');
    const [myReview, setMyReview] = useState<StudentReview | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.getStudentEnrolledCourseDetails(courseId);
                setDetails(res.data);
                setMyReview(res.data.myReview);
                if (res.data.myReview) {
                    setRating(res.data.myReview.rating);
                    setComment(res.data.myReview.comment);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [courseId]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please select a rating.");
            return;
        }
        try {
            const res = await api.submitStudentCourseReview(courseId, rating, comment);
            setMyReview(res.data);
            alert("Review submitted successfully!");
        } catch (err: any) {
            setError(err.message);
            alert("Failed to submit review.");
        }
    };
    
    if (loading) return <div className="text-center p-10">Loading course...</div>;
    if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
    if (!details) return <div className="text-center p-10">Course not found.</div>;

    const watchHistoryMap: WatchHistoryMap = details.watchHistory.reduce((acc, item) => {
        acc[item.lessonId] = { progress: item.progress };
        return acc;
    }, {} as WatchHistoryMap);

    return (
       <div className="max-w-7xl mx-auto">
         <button onClick={onBack} className="text-primary font-semibold mb-4">&larr; Back to My Courses</button>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <div className="bg-black aspect-video rounded-lg flex items-center justify-center text-white mb-4">
                    <p>Video Player Placeholder</p>
                </div>
                <h1 className="text-3xl font-bold mb-2">{details.course.title}</h1>
                <div className="flex border-b mb-4">
                    <button onClick={() => setActiveTab('overview')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Overview</button>
                    <button onClick={() => setActiveTab('review')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'review' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>My Review</button>
                </div>
                {activeTab === 'overview' && <div className="prose" dangerouslySetInnerHTML={{ __html: details.course.description }}></div>}
                {activeTab === 'review' && (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <h3 className="text-xl font-bold">Your Review</h3>
                        <div>
                            <label className="font-semibold">Rating:</label>
                            <div className="flex items-center space-x-1 mt-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button type="button" key={star} onClick={() => setRating(star)}>
                                        <StarIcon className={`w-8 h-8 cursor-pointer ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} filled={star <= rating} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="comment" className="font-semibold">Comment:</label>
                            <textarea id="comment" value={comment} onChange={e => setComment(e.target.value)} rows={4} className="w-full mt-1 border border-gray-300 rounded-lg p-2"></textarea>
                        </div>
                        <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700">Submit Review</button>
                    </form>
                )}
            </div>
            <div className="lg:col-span-1 bg-white p-4 rounded-lg border max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Course Content</h2>
                {details.course.modules.map(module => (
                    <div key={module.id} className="mb-4">
                        <h3 className="font-bold bg-gray-100 p-2 rounded">{module.title}</h3>
                        <ul className="mt-2 space-y-1">
                            {module.lessons.map(lesson => {
                                const progress = watchHistoryMap[lesson.id]?.progress || 0;
                                return (
                                    <li key={lesson.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
                                        <span className="text-sm">{lesson.title}</span>
                                        {progress === 100 && <CheckIcon className="w-5 h-5 text-green-500" />}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
         </div>
       </div>
    );
};

// Main portal component
const StudentPortal: React.FC<StudentPortalProps> = ({ onLogout, onExitStudentView }) => {
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.getStudentEnrolledCourses();
                setEnrolledCourses(res.data);
            } catch (error) {
                console.error("Failed to fetch enrolled courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-800">
            <StudentHeader onLogout={onLogout} onExitStudentView={onExitStudentView} />
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                {loading ? (
                     <div className="text-center">Loading your courses...</div>
                ) : selectedCourseId ? (
                    <CoursePlayer courseId={selectedCourseId} onBack={() => setSelectedCourseId(null)} />
                ) : (
                    <StudentDashboard courses={enrolledCourses} onSelectCourse={setSelectedCourseId} />
                )}
            </main>
        </div>
    );
};

export default StudentPortal;