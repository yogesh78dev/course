// This file acts as an in-memory database for the backend.
const { UserRole, ReviewStatus, CouponType, NotificationTarget, NotificationActionType, NotificationChannel } = require('./constants');

let categories = [
    { id: 'cat-1', name: 'Web Development' },
    { id: 'cat-2', name: 'Data Science' },
    { id: 'cat-3', name: 'Design' },
    { id: 'cat-4', name: 'Marketing' },
];

let instructors = [
    { id: 'inst-1', name: 'John Doe', email: 'john.doe@example.com', bio: 'Expert in React and frontend development with over 10 years of experience.', avatar: 'https://picsum.photos/seed/johndoe/100' },
    { id: 'inst-2', name: 'Jane Smith', email: 'jane.smith@example.com', bio: 'Data scientist and Python enthusiast, passionate about making data accessible.', avatar: 'https://picsum.photos/seed/janesmith/100' },
    { id: 'inst-3', name: 'Peter Jones', email: 'peter.jones@example.com', bio: 'Creative director and UI/UX designer with a focus on user-centered design.', avatar: 'https://picsum.photos/seed/peterjones/100' },
    { id: 'inst-4', name: 'Susan Lee', email: 'susan.lee@example.com', bio: 'Digital marketing strategist with a track record of successful campaigns.', avatar: 'https://picsum.photos/seed/susanlee/100' },
];

let courses = [
    { 
        id: 'crs-1', 
        title: 'React for Beginners', 
        description: 'A comprehensive guide to React.', 
        price: 49.99, 
        category: 'Web Development', 
        duration: '10 hours', 
        instructorId: 'inst-1',
        posterImageUrl: 'https://picsum.photos/seed/react/400/225',
        bannerImageUrl: 'https://picsum.photos/seed/react-banner/1000/300',
        introVideoUrl: 'https://vimeo.com/123456',
        accessType: 'lifetime',
        accessDuration: null,
        modules: [
            { id: 'mod-1', title: 'Module 1: Introduction', lessons: [
                { id: 'les-1', title: 'What is React?', type: 'video', contentUrl: 'https://vimeo.com/123456', duration: 15, description: 'An introduction to the React library and its core concepts.', tags: ['react', 'beginner'], attachmentUrl: '' },
                { id: 'les-2', title: 'Setting up your environment', type: 'pdf', contentUrl: '', duration: 30, description: 'A step-by-step guide to setting up your local development environment.', tags: ['setup', 'environment'], attachmentUrl: '/pdfs/setup-guide.pdf' },
            ]},
            { id: 'mod-2', title: 'Module 2: Core Concepts', lessons: [
                { id: 'les-3', title: 'Components and Props', type: 'video', contentUrl: 'https://vimeo.com/123457', duration: 45, description: 'Learn about React components and how to pass data with props.', tags: ['components', 'props'], attachmentUrl: '' },
            ]}
        ]
    },
    { 
        id: 'crs-2', 
        title: 'Python for Data Science', 
        description: 'Learn Python for data analysis.', 
        price: 79.99, 
        category: 'Data Science', 
        duration: '15 hours', 
        instructorId: 'inst-2',
        posterImageUrl: 'https://picsum.photos/seed/python/400/225',
        bannerImageUrl: 'https://picsum.photos/seed/python-banner/1000/300',
        introVideoUrl: 'https://vimeo.com/234567',
        accessType: 'expiry',
        accessDuration: 365,
        modules: [
             { id: 'mod-3', title: 'Module 1: Python Fundamentals', lessons: [
                { id: 'les-6', title: 'Introduction to Python', type: 'video', contentUrl: 'https://vimeo.com/234567', duration: 30, description: 'Get started with the basics of Python programming.', tags: ['python', 'basics'], attachmentUrl: '' },
            ]}
        ]
    },
];

let users = [
    { id: 'usr-1', name: 'Alice Johnson', email: 'alice@example.com', role: UserRole.GOLD_MEMBER, joinedDate: '2023-01-15', avatar: 'https://picsum.photos/seed/alice/100', enrolledCourses: [], watchHistory: [] },
    { id: 'usr-2', name: 'Bob Williams', email: 'bob@example.com', role: UserRole.STUDENT, joinedDate: '2023-02-20', avatar: 'https://picsum.photos/seed/bob/100', enrolledCourses: [], watchHistory: [] },
    { id: 'usr-3', name: 'Charlie Brown', email: 'charlie@example.com', role: UserRole.STUDENT, joinedDate: '2023-03-10', avatar: 'https://picsum.photos/seed/charlie/100', enrolledCourses: [], watchHistory: [] },
    { id: 'usr-4', name: 'Admin User', email: 'admin@example.com', role: UserRole.ADMIN, joinedDate: '2022-12-01', avatar: 'https://picsum.photos/seed/admin/100', enrolledCourses: [], watchHistory: [] },
];

let sales = [
    { id: 'sal-1', user: {id: 'usr-1', name: 'Alice Johnson'}, course: {id: 'crs-1', title: 'React for Beginners'}, amount: 49.99, date: '2023-05-10', status: 'Paid' },
    { id: 'sal-2', user: {id: 'usr-2', name: 'Bob Williams'}, course: {id: 'crs-2', title: 'Python for Data Science'}, amount: 79.99, date: '2023-05-12', status: 'Paid' },
];

let reviews = [
    { id: 'rev-1', courseId: 'crs-1', userId: 'usr-1', rating: 5, comment: 'Excellent course, very clear explanations!', date: '2023-06-01', status: ReviewStatus.APPROVED },
    { id: 'rev-2', courseId: 'crs-1', userId: 'usr-2', rating: 4, comment: 'Good content, but could be more in-depth.', date: '2023-06-02', status: ReviewStatus.APPROVED },
];

let coupons = [
    { id: 'cpn-1', code: 'SUMMER25', type: CouponType.PERCENTAGE, value: 25, startDate: '2024-06-01', endDate: '2024-08-31', usageCount: 42, usageLimit: 100, courseIds: ['crs-1', 'crs-3'], firstTimeBuyerOnly: false },
    { id: 'cpn-2', code: 'WELCOME10', type: CouponType.FIXED, value: 10, startDate: '2024-01-01', endDate: '2024-12-31', usageCount: 112, usageLimit: null, courseIds: [], firstTimeBuyerOnly: true },
];

let sentNotifications = [
    {
        id: 'sent-not-1',
        title: 'New Course Available!',
        message: 'Check out our new "Advanced Digital Marketing" course.',
        target: NotificationTarget.ALL,
        action: { type: NotificationActionType.VIEW_COURSE, payload: 'crs-4' },
        sentDate: '2023-06-10',
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
    },
];

let notificationTemplates = [
    {
        id: 'tpl-1',
        name: 'New Course Announcement',
        title: '🚀 New Course Alert!',
        message: 'A brand new course has just been launched. Check it out now!',
        target: NotificationTarget.ALL,
        action: { type: NotificationActionType.VIEW_COURSE, payload: 'crs-4' }
    },
];

module.exports = {
    categories,
    instructors,
    courses,
    users,
    sales,
    reviews,
    coupons,
    sentNotifications,
    notificationTemplates
};
