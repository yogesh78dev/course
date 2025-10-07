import React from 'react';
import { User } from '../../types';
import { useAppContext } from '../../context/AppContext';
import Modal from './Modal';

interface UserEnrollmentsModalProps {
    user: User | null;
    onClose: () => void;
}

const UserEnrollmentsModal: React.FC<UserEnrollmentsModalProps> = ({ user, onClose }) => {
    const { courses } = useAppContext();

    if (!user) return null;

    const getAccessStatus = (expiryDate: string | null) => {
        if (expiryDate === null) {
            return { text: 'Active', color: 'bg-green-100 text-green-800' };
        }
        const now = new Date();
        const expiry = new Date(expiryDate);
        if (now > expiry) {
            return { text: 'Expired', color: 'bg-red-100 text-red-800' };
        }
        return { text: 'Active', color: 'bg-green-100 text-green-800' };
    };

    return (
        <Modal isOpen={!!user} onClose={onClose} title={`Course Enrollments for ${user.name}`}>
            <div className="space-y-4">
                {user.enrolledCourses?.length > 0 ? (
                    user.enrolledCourses?.map(enrollment => {
                        const course = courses.find(c => c.id === enrollment.courseId);
                        if (!course) return null;
                        const status = getAccessStatus(enrollment.expiryDate);
                        return (
                            <div key={enrollment.courseId} className="bg-gray-50 p-4 rounded-lg border flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{course.title}</p>
                                    <p className="text-sm text-gray-500">
                                        Enrolled on: {enrollment.enrollmentDate} |
                                        Expires: {enrollment.expiryDate ? enrollment.expiryDate : 'Never'}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                                    {status.text}
                                </span>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        This user is not enrolled in any courses.
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default UserEnrollmentsModal;