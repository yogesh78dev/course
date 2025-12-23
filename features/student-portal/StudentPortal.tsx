
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { KeyIcon, VideoIcon, GiftIcon } from '../../components/icons/index';

const StudentPortal: React.FC = () => {
    const { currentStudent, courses, webinars } = useAppContext();

    if (!currentStudent) {
        return (
            <div className="text-center p-10">
                <h2 className="text-2xl font-bold text-gray-700">No Student Selected</h2>
                <p className="text-gray-500">Exit student view and select a student to preview their portal.</p>
            </div>
        );
    }
    
    const enrolledCourses = currentStudent.enrolledCourses?.map(enrollment => {
        return courses.find(c => c.id === enrollment.courseId);
    }).filter(Boolean);

    const freeCourses = courses.filter(c => c.price === 0);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Welcome, {currentStudent.name}!</h2>
                <p className="text-gray-600 mt-1">This is a preview of the student portal.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Enrolled Courses */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <KeyIcon className="w-6 h-6 mr-3 text-primary" />
                        My Enrolled Courses
                    </h3>
                    <div className="space-y-4">
                        {enrolledCourses && enrolledCourses.length > 0 ? (
                            enrolledCourses.map(course => (
                            course && <div key={course.id} className="bg-gray-50 p-4 rounded-lg border flex items-center space-x-4">
                                <img src={course.posterImageUrl} alt={course.title} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-gray-900">{course.title}</p>
                                    <p className="text-sm text-gray-500">by {course.instructorName}</p>
                                    <div className="mt-2">
                                        <button className="text-sm font-semibold text-primary hover:underline">Continue Learning &rarr;</button>
                                    </div>
                                </div>
                            </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                You are not enrolled in any courses yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Free Courses */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                     <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <GiftIcon className="w-6 h-6 mr-3 text-green-500" />
                        Free Courses
                    </h3>
                    <div className="space-y-4">
                         {freeCourses.length > 0 ? (
                            freeCourses.map(course => (
                                <div key={course.id} className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-center space-x-4">
                                    <img src={course.posterImageUrl} alt={course.title} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-900">{course.title}</p>
                                        <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">FREE</span>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{course.description}</p>
                                        <button className="text-sm font-semibold text-green-700 mt-2 hover:underline">Enroll Now</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <div className="text-center py-10 text-gray-500">
                                No free courses available at the moment.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Webinars Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <VideoIcon className="w-6 h-6 mr-3 text-purple-500" />
                    Upcoming Webinars & Events
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {webinars.map(webinar => (
                         <div key={webinar.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                             <div className="relative h-40 bg-gray-200">
                                 {webinar.thumbnailUrl ? (
                                    <img src={webinar.thumbnailUrl} alt={webinar.title} className="w-full h-full object-cover" />
                                 ) : (
                                     <div className="w-full h-full flex items-center justify-center text-gray-400">
                                         <VideoIcon className="w-12 h-12" />
                                     </div>
                                 )}
                                 <div className="absolute top-2 right-2">
                                     <span className={`px-2 py-1 text-xs font-bold rounded text-white ${webinar.type === 'Live' ? 'bg-red-500' : 'bg-blue-500'}`}>
                                         {webinar.type}
                                     </span>
                                 </div>
                             </div>
                             <div className="p-4">
                                 <h4 className="font-bold text-gray-900 mb-1 truncate">{webinar.title}</h4>
                                 <p className="text-xs text-gray-500 mb-2">{new Date(webinar.scheduleDate).toLocaleString()}</p>
                                 <p className="text-sm text-gray-600 mb-4 line-clamp-2">{webinar.description}</p>
                                 <div className="flex justify-between items-center">
                                      <span className={`text-sm font-semibold ${webinar.isFree ? 'text-green-600' : 'text-gray-800'}`}>
                                         {webinar.isFree ? 'Free' : `₹${webinar.price}`}
                                     </span>
                                     <button className="px-3 py-1.5 bg-primary text-white text-sm rounded hover:bg-primary-700">
                                         {webinar.type === 'Live' ? 'Register' : 'Watch'}
                                     </button>
                                 </div>
                             </div>
                         </div>
                    ))}
                    {webinars.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-500">
                            No webinars scheduled.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentPortal;