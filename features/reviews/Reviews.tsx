import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Review, ReviewStatus } from '../../types';
import { StarIcon, CheckIcon, EyeOffIcon, DeleteIcon } from '../../components/icons/index';
import Tooltip from '../../components/ui/Tooltip';

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className="w-5 h-5 text-yellow-400" filled={i < rating} />
        ))}
    </div>
);

const Reviews: React.FC = () => {
    const { reviews, users, courses, updateReviewStatus, deleteReview } = useAppContext();
    const [filterStatus, setFilterStatus] = useState<ReviewStatus | 'All'>('All');

    const filteredReviews = filterStatus === 'All'
        ? reviews
        : reviews.filter(review => review.status === filterStatus);
    
    const getReviewData = (review: Review) => {
        const user = users.find(u => u.id === review.userId);
        const course = courses.find(c => c.id === review.courseId);
        return { user, course };
    };

    const getStatusClass = (status: ReviewStatus) => {
        switch (status) {
            case ReviewStatus.APPROVED:
                return 'bg-green-100 text-green-800';
            case ReviewStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800';
            case ReviewStatus.HIDDEN:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filterButtons: { label: string; value: ReviewStatus | 'All' }[] = [
        { label: 'All Reviews', value: 'All' },
        { label: 'Pending', value: ReviewStatus.PENDING },
        { label: 'Approved', value: ReviewStatus.APPROVED },
        { label: 'Hidden', value: ReviewStatus.HIDDEN },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Reviews & Ratings</h2>
            </div>

            <div className="flex space-x-2 border-b border-gray-200">
                {filterButtons.map(btn => (
                     <button 
                        key={btn.value}
                        onClick={() => setFilterStatus(btn.value)}
                        className={`px-4 py-2 font-medium text-sm ${filterStatus === btn.value ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-sm text-gray-600">Course</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">User</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Rating</th>
                            <th className="p-4 font-semibold text-sm text-gray-600 max-w-sm">Comment</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-sm text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredReviews.map(review => {
                            const { user, course } = getReviewData(review);
                            if (!user || !course) return null;

                            return (
                                <tr key={review.id}>
                                    <td className="p-4 font-medium text-gray-800">{course.title}</td>
                                    <td className="p-4 text-gray-700">{user.name}</td>
                                    <td className="p-4"><StarRating rating={review.rating} /></td>
                                    <td className="p-4 text-gray-600 text-sm max-w-sm truncate" title={review.comment}>{review.comment}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(review.status)}`}>
                                            {review.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex space-x-1">
                                            {review.status !== ReviewStatus.APPROVED && (
                                                <Tooltip text="Approve Review">
                                                    <button onClick={() => updateReviewStatus(review.id, ReviewStatus.APPROVED)} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors" aria-label="Approve review">
                                                        <CheckIcon className="w-5 h-5"/>
                                                    </button>
                                                </Tooltip>
                                            )}
                                            {review.status !== ReviewStatus.HIDDEN && (
                                                <Tooltip text="Hide Review">
                                                    <button onClick={() => updateReviewStatus(review.id, ReviewStatus.HIDDEN)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" aria-label="Hide review">
                                                        <EyeOffIcon className="w-5 h-5"/>
                                                    </button>
                                                </Tooltip>
                                            )}
                                            <Tooltip text="Delete Review">
                                                <button onClick={() => deleteReview(review.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors" aria-label="Delete review">
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
                 {filteredReviews.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No reviews found for this status.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reviews;