import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import StudentHeader from '../StudentHeader';
import { UserRole } from '../../types';

const StudentPortalView: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const { currentStudent, courses } = useAppContext();
    const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
    
    if (!currentStudent) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Loading student data...</p>
            </div>
        );
    }
    
    const enrolledCourses = courses.filter(course =>
        currentStudent.enrolledCourses.some(enrolled => enrolled.courseId === course.id)
    );

    const findLessonTitle = (courseId: string, lessonId: string) => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return 'Unknown Lesson';
        for (const module of course.modules) {
            const lesson = module.lessons.find(l => l.id === lessonId);
            if (lesson) return lesson.title;
        }
        return 'Unknown Lesson';
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-800">
            <StudentHeader onLogout={onLogout} />
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {currentStudent.name}!</h1>
                        <p className="text-gray-600 mt-1">Let's continue your learning journey.</p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Courses</h2>
                        {enrolledCourses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {enrolledCourses.map(course => (
                                    <div key={course.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden group transform hover:-translate-y-1 transition-transform duration-300">
                                        <img src={course.posterImageUrl} alt={course.title} className="w-full h-40 object-cover" />
                                        <div className="p-5">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{course.title}</h3>
                                            <p className="text-sm text-gray-600 mb-4">{course.category}</p>
                                            <button className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary-700 transition-colors">
                                                Continue Learning
                                            </button>
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
                    
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                         <div className="flex space-x-2 border-b border-gray-200 mb-6">
                            <button 
                                onClick={() => setActiveTab('profile')}
                                className={`px-4 py-2 font-medium text-sm ${activeTab === 'profile' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                My Profile
                            </button>
                            <button 
                                onClick={() => setActiveTab('history')}
                                className={`px-4 py-2 font-medium text-sm ${activeTab === 'history' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Watch History
                            </button>
                        </div>
                        
                        {activeTab === 'profile' && (
                            <div className="space-y-4">
                                 <h3 className="text-xl font-bold text-gray-800 mb-2">Account Details</h3>
                                 <p><span className="font-semibold">Name:</span> {currentStudent.name}</p>
                                 <p><span className="font-semibold">Email:</span> {currentStudent.email}</p>
                                 <p><span className="font-semibold">Member Since:</span> {currentStudent.joinedDate}</p>
                                 <p><span className="font-semibold">Membership:</span> {currentStudent.role}</p>
                                 <button className="mt-4 bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                                    Edit Profile
                                </button>
                            </div>
                        )}

                        {activeTab === 'history' && (
                             <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">My Watch History</h3>
                                {currentStudent.watchHistory.length > 0 ? (
                                     <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="p-3 font-semibold text-sm text-gray-600">Lesson</th>
                                                <th className="p-3 font-semibold text-sm text-gray-600">Course</th>
                                                <th className="p-3 font-semibold text-sm text-gray-600">Watched On</th>
                                                <th className="p-3 font-semibold text-sm text-gray-600">Progress</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {currentStudent.watchHistory.map(item => (
                                                <tr key={item.lessonId}>
                                                    <td className="p-3 text-gray-800">{findLessonTitle(item.courseId, item.lessonId)}</td>
                                                    <td className="p-3 text-gray-600">{courses.find(c => c.id === item.courseId)?.title}</td>
                                                    <td className="p-3 text-gray-600">{new Date(item.watchedAt).toLocaleDateString()}</td>
                                                    <td className="p-3 text-gray-600">{item.progress}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-gray-500">You haven't watched any lessons yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentPortalView;