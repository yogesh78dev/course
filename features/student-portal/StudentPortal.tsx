import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../services/api';
import { Course, CourseDetailsPayload, WatchHistoryMap, StudentReview, Certificate } from '../../types';
import StudentHeader from '../../components/layout/StudentHeader';
import { CheckIcon, StarIcon } from '../../components/icons/index';
import Modal from '../../components/ui/Modal';

interface StudentPortalProps {
    onLogout: () => void;
    onExitStudentView: () => void;
}
type StudentView = 'dashboard' | 'player' | 'certificates';

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
                    {courses?.map(course => (
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
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const fetchDetails = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.getStudentEnrolledCourseDetails(courseId);
            setDetails(res.data);
            if (res.data.myReview) {
                setRating(res.data.myReview.rating);
                setComment(res.data.myReview.comment);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleMarkAsComplete = async (lessonId: string) => {
        try {
            const res = await api.updateStudentLessonProgress(lessonId, 100);
            if(details) {
                setDetails(prev => prev ? ({ 
                    ...prev, 
                    completionPercentage: res.data.newCompletionPercentage,
                    watchHistory: [ ...prev.watchHistory, { lessonId, progress: 100 }]
                }) : null);
            }
        } catch (error) {
            console.error("Failed to update progress", error);
        }
    };

    const handleClaimCertificate = async () => {
        try {
            await api.claimCertificate(courseId);
            alert("Certificate claimed! You can view it in 'My Certificates'.");
            fetchDetails(); // Refresh details to show certificate
        } catch(err: any) {
            alert(`Could not claim certificate: ${err.message}`);
        }
    }

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please select a rating.");
            return;
        }
        try {
            const res = await api.submitStudentCourseReview(courseId, rating, comment);
            if(details) {
                setDetails(prev => prev ? ({...prev, myReview: res.data as any }) : null)
            }
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

    const canClaimCertificate = details.completionPercentage === 100 && details.course.enableCertificate && !details.myCertificate;

    return (
       <div className="max-w-7xl mx-auto">
         <button onClick={onBack} className="text-primary font-semibold mb-4">&larr; Back to My Courses</button>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <div className="bg-black aspect-video rounded-lg flex items-center justify-center text-white mb-4">
                    <p>Video Player Placeholder</p>
                </div>
                <div className="bg-white p-4 rounded-lg border mb-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg">Your Progress</h2>
                        <span className="font-bold text-primary">{details.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                         <div className="bg-primary h-2.5 rounded-full" style={{width: `${details.completionPercentage}%`}}></div>
                    </div>
                    {canClaimCertificate && (
                        <button onClick={handleClaimCertificate} className="mt-4 bg-yellow-400 text-yellow-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-500">
                            🎉 Claim Your Certificate!
                        </button>
                    )}
                    {details.myCertificate && (
                         <div className="mt-4 p-3 bg-green-50 text-green-800 border border-green-200 rounded-lg">
                            <strong>Certificate Earned!</strong> You can view it in the "My Certificates" section.
                         </div>
                    )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{details.course.title}</h1>
                <div className="flex border-b mb-4">
                    <button onClick={() => setActiveTab('overview')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Overview</button>
                    <button onClick={() => setActiveTab('review')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'review' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>My Review</button>
                </div>
                {activeTab === 'overview' && <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: details.course.description }}></div>}
                {activeTab === 'review' && (
                    <form onSubmit={handleReviewSubmit} className="space-y-4 bg-white p-4 rounded-lg border">
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
                {details.course.modules?.map(module => (
                    <div key={module.id} className="mb-4">
                        <h3 className="font-bold bg-gray-100 p-2 rounded">{module.title}</h3>
                        <ul className="mt-2 space-y-1">
                            {module.lessons?.map(lesson => {
                                const isCompleted = (watchHistoryMap[lesson.id]?.progress || 0) === 100;
                                return (
                                    <li key={lesson.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
                                        <div className="flex items-center">
                                            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mr-3 ${isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                                {isCompleted && <CheckIcon className="w-4 h-4 text-white"/>}
                                            </div>
                                            <span className="text-sm">{lesson.title}</span>
                                        </div>
                                        {!isCompleted && <button onClick={() => handleMarkAsComplete(lesson.id)} className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">Complete</button>}
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

// Sub-component for certificates view
const CertificatesView: React.FC = () => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

    useEffect(() => {
        api.getMyCertificates()
            .then(res => setCertificates(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center">Loading your certificates...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Certificates</h1>
             {certificates.length > 0 ? (
                <div className="space-y-4">
                    {certificates?.map(cert => (
                        <div key={cert.id} className="bg-white p-4 rounded-lg border shadow-sm flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{cert.courseTitle}</h3>
                                <p className="text-sm text-gray-500">Issued on: {cert.issueDate}</p>
                            </div>
                            <button onClick={() => setSelectedCert(cert)} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg">View Certificate</button>
                        </div>
                    ))}
                </div>
            ) : (
                <p>You have not earned any certificates yet.</p>
            )}

            <Modal isOpen={!!selectedCert} onClose={() => setSelectedCert(null)} title="Certificate of Completion" size="3xl">
                {selectedCert && (
                    <div className="p-8 bg-gray-50 border-4 border-primary-200 text-center">
                        <h2 className="text-sm uppercase tracking-widest text-gray-500">Certificate of Completion</h2>
                        <p className="text-lg text-gray-600 my-4">This is to certify that</p>
                        <h1 className="text-4xl font-bold text-primary">{selectedCert.userId}</h1>
                        <p className="text-lg text-gray-600 my-4">has successfully completed the course</p>
                        <h3 className="text-2xl font-semibold text-gray-800">{selectedCert.courseTitle}</h3>
                        <p className="mt-8 text-sm text-gray-500">Issued by {selectedCert.instructorName} on {selectedCert.issueDate}</p>
                        <p className="text-xs text-gray-400 mt-2">Certificate ID: {selectedCert.certificateCode}</p>
                    </div>
                )}
            </Modal>
        </div>
    )
}

// Main portal component
const StudentPortal: React.FC<StudentPortalProps> = ({ onLogout, onExitStudentView }) => {
    const [currentView, setCurrentView] = useState<StudentView>('dashboard');
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

    const handleSelectCourse = (courseId: string) => {
        setSelectedCourseId(courseId);
        setCurrentView('player');
    };

    const handleBackToDashboard = () => {
        setSelectedCourseId(null);
        setCurrentView('dashboard');
    };

    const renderContent = () => {
        if (loading) {
            return <div className="text-center">Loading your courses...</div>
        }
        switch (currentView) {
            case 'dashboard':
                return <StudentDashboard courses={enrolledCourses} onSelectCourse={handleSelectCourse} />;
            case 'player':
                return selectedCourseId ? <CoursePlayer courseId={selectedCourseId} onBack={handleBackToDashboard} /> : <p>No course selected.</p>;
            case 'certificates':
                return <CertificatesView />;
            default:
                return <StudentDashboard courses={enrolledCourses} onSelectCourse={handleSelectCourse} />;
        }
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-800">
            <StudentHeader onLogout={onLogout} onExitStudentView={onExitStudentView} />
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default StudentPortal;