import { User, Course, Sale, Category, Notification, UserRole, Review, ReviewStatus, Coupon, CouponType, SentNotification, NotificationTarget, NotificationActionType, NotificationChannel, NotificationTemplate, Instructor } from '../types';

// MOCK DATA
export const initialCategories: Category[] = [
    { id: 'cat-1', name: 'Web Development' },
    { id: 'cat-2', name: 'Data Science' },
    { id: 'cat-3', name: 'Design' },
    { id: 'cat-4', name: 'Marketing' },
];

export const vimeoVideos = [
    { id: 'vid-1', title: 'Introduction to React', url: 'https://vimeo.com/123456' },
    { id: 'vid-2', title: 'State and Props', url: 'https://vimeo.com/123457' },
    { id: 'vid-3', title: 'Python Basics', url: 'https://vimeo.com/234567' },
    { id: 'vid-4', title: 'Data Analysis with Pandas', url: 'https://vimeo.com/234568' },
    { id: 'vid-5', title: 'Design Principles', url: 'https://vimeo.com/345678' },
];

export const initialInstructors: Instructor[] = [
    { id: 'inst-1', name: 'John Doe', email: 'john.doe@example.com', bio: 'Expert in React and frontend development with over 10 years of experience.', avatar: 'https://picsum.photos/seed/johndoe/100' },
    { id: 'inst-2', name: 'Jane Smith', email: 'jane.smith@example.com', bio: 'Data scientist and Python enthusiast, passionate about making data accessible.', avatar: 'https://picsum.photos/seed/janesmith/100' },
    { id: 'inst-3', name: 'Peter Jones', email: 'peter.jones@example.com', bio: 'Creative director and UI/UX designer with a focus on user-centered design.', avatar: 'https://picsum.photos/seed/peterjones/100' },
    { id: 'inst-4', name: 'Susan Lee', email: 'susan.lee@example.com', bio: 'Digital marketing strategist with a track record of successful campaigns.', avatar: 'https://picsum.photos/seed/susanlee/100' },
];


export const initialCourses: Course[] = [
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
        enableCertificate:false,
        modules: [
            { id: 'mod-1', title: 'Module 1: Introduction', lessons: [
                { id: 'les-1', title: 'What is React?', type: 'video', contentUrl: 'https://vimeo.com/123456', duration: 15, description: 'An introduction to the React library and its core concepts.', tags: ['react', 'beginner'], attachmentUrl: '' },
                { id: 'les-2', title: 'Setting up your environment', type: 'pdf', contentUrl: '', duration: 30, description: 'A step-by-step guide to setting up your local development environment.', tags: ['setup', 'environment'], attachmentUrl: '/pdfs/setup-guide.pdf' },
            ]},
            { id: 'mod-2', title: 'Module 2: Core Concepts', lessons: [
                { id: 'les-3', title: 'Components and Props', type: 'video', contentUrl: 'https://vimeo.com/123457', duration: 45, description: 'Learn about React components and how to pass data with props.', tags: ['components', 'props'], attachmentUrl: '' },
                { id: 'les-4', title: 'State and Lifecycle', type: 'video', contentUrl: 'https://vimeo.com/123457', duration: 60, description: 'Understand component state and lifecycle methods.', tags: ['state', 'lifecycle'], attachmentUrl: '' },
                { id: 'les-5', title: 'Module 2 Quiz', type: 'quiz', contentUrl: '/quizzes/module2.json', duration: 20, description: 'Test your knowledge on core React concepts.', tags: ['quiz', 'assessment'], attachmentUrl: '' },
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
        enableCertificate:false,
        modules: [
             { id: 'mod-3', title: 'Module 1: Python Fundamentals', lessons: [
                { id: 'les-6', title: 'Introduction to Python', type: 'video', contentUrl: 'https://vimeo.com/234567', duration: 30, description: 'Get started with the basics of Python programming.', tags: ['python', 'basics'], attachmentUrl: '' },
            ]}
        ]
    },
    { 
        id: 'crs-3', 
        title: 'UI/UX Design Fundamentals', 
        description: 'Master the basics of UI/UX.', 
        price: 39.99, 
        category: 'Design', 
        duration: '8 hours', 
        instructorId: 'inst-3',
        posterImageUrl: 'https://picsum.photos/seed/design/400/225',
        bannerImageUrl: 'https://picsum.photos/seed/design-banner/1000/300',
        introVideoUrl: 'https://vimeo.com/345678',
        accessType: 'lifetime',
        enableCertificate:false,
        accessDuration: null,
        modules: []
    },
    { 
        id: 'crs-4', 
        title: 'Advanced Digital Marketing', 
        description: 'Become a marketing expert.', 
        price: 99.99, 
        category: 'Marketing', 
        duration: '20 hours', 
        instructorId: 'inst-4',
        posterImageUrl: 'https://picsum.photos/seed/marketing/400/225',
        bannerImageUrl: 'https://picsum.photos/seed/marketing-banner/1000/300',
        introVideoUrl: '',
        accessType: 'expiry',
        enableCertificate:false,
        accessDuration: 180,
        modules: []
    },
];

export const initialUsers: User[] = [
    { id: 'usr-1', name: 'Alice Johnson', email: 'alice@example.com',phoneNumber:"",status:"Active", role: UserRole.GOLD_MEMBER, joinedDate: '2023-01-15', avatar: 'https://picsum.photos/seed/alice/100', enrolledCourses: [], watchHistory: [] },
    { id: 'usr-2', name: 'Bob Williams', email: 'bob@example.com',phoneNumber:"",status:"Active", role: UserRole.STUDENT, joinedDate: '2023-02-20', avatar: 'https://picsum.photos/seed/bob/100', enrolledCourses: [], watchHistory: [
        { courseId: 'crs-1', lessonId: 'les-1', watchedAt: '2023-06-10T10:00:00Z', progress: 100 },
        { courseId: 'crs-1', lessonId: 'les-3', watchedAt: '2023-06-11T11:30:00Z', progress: 50 },
    ]},
    { id: 'usr-3', name: 'Charlie Brown', email: 'charlie@example.com',phoneNumber:"",status:"Active", role: UserRole.STUDENT, joinedDate: '2023-03-10', avatar: 'https://picsum.photos/seed/charlie/100', enrolledCourses: [], watchHistory: [] },
    { id: 'usr-4', name: 'Admin User', email: 'admin@example.com',phoneNumber:"",status:"Active", role: UserRole.ADMIN, joinedDate: '2022-12-01', avatar: 'https://picsum.photos/seed/admin/100', enrolledCourses: [], watchHistory: [] },
];

export const initialSales: Sale[] = [
    { id: 'sal-1', user: {id: 'usr-1', name: 'Alice Johnson'}, course: {id: 'crs-1', title: 'React for Beginners'}, amount: 49.99, date: '2023-05-10', status: 'Paid' },
    { id: 'sal-2', user: {id: 'usr-2', name: 'Bob Williams'}, course: {id: 'crs-2', title: 'Python for Data Science'}, amount: 79.99, date: '2023-05-12', status: 'Paid' },
    { id: 'sal-3', user: {id: 'usr-3', name: 'Charlie Brown'}, course: {id: 'crs-3', title: 'UI/UX Design Fundamentals'}, amount: 39.99, date: '2023-05-15', status: 'Pending' },
    { id: 'sal-4', user: {id: 'usr-1', name: 'Alice Johnson'}, course: {id: 'crs-4', title: 'Advanced Digital Marketing'}, amount: 99.99, date: '2023-05-18', status: 'Paid' },
    { id: 'sal-5', user: {id: 'usr-2', name: 'Bob Williams'}, course: {id: 'crs-1', title: 'React for Beginners'}, amount: 49.99, date: '2023-05-19', status: 'Paid' },
];

export const initialNotifications: Notification[] = [
    { id: 'not-1', message: "New sale: 'React for Beginners'", timestamp: '2 hours ago', read: false },
    { id: 'not-2', message: "User 'Bob Williams' has registered.", timestamp: '1 day ago', read: false },
    { id: 'not-3', message: "Weekly revenue report is ready.", timestamp: '3 days ago', read: true },
];

export const initialReviews: Review[] = [
    { id: 'rev-1', courseId: 'crs-1', userId: 'usr-1', rating: 5, comment: 'Excellent course, very clear explanations!', date: '2023-06-01', status: ReviewStatus.APPROVED },
    { id: 'rev-2', courseId: 'crs-1', userId: 'usr-2', rating: 4, comment: 'Good content, but could be more in-depth.', date: '2023-06-02', status: ReviewStatus.APPROVED },
    { id: 'rev-3', courseId: 'crs-2', userId: 'usr-3', rating: 5, comment: 'Loved it! The instructor is fantastic.', date: '2023-06-03', status: ReviewStatus.PENDING },
    { id: 'rev-4', courseId: 'crs-3', userId: 'usr-2', rating: 3, comment: 'It was okay. A bit basic for me.', date: '2023-06-04', status: ReviewStatus.HIDDEN },
    { id: 'rev-5', courseId: 'crs-4', userId: 'usr-1', rating: 5, comment: 'This course is a game-changer. Highly recommended!', date: '2023-06-05', status: ReviewStatus.APPROVED },
    { id: 'rev-6', courseId: 'crs-2', userId: 'usr-1', rating: 4, comment: 'Really helpful for my career.', date: '2023-06-06', status: ReviewStatus.APPROVED },
];

export const initialCoupons: Coupon[] = [
    { id: 'cpn-1', code: 'SUMMER25', type: CouponType.PERCENTAGE, value: 25, startDate: '2024-06-01', endDate: '2024-08-31', usageCount: 42, usageLimit: 100, courseIds: ['crs-1', 'crs-3'], firstTimeBuyerOnly: false },
    { id: 'cpn-2', code: 'WELCOME10', type: CouponType.FIXED, value: 10, startDate: '2024-01-01', endDate: '2024-12-31', usageCount: 112, usageLimit: null, courseIds: [], firstTimeBuyerOnly: true },
    { id: 'cpn-3', code: 'EXPIRED50', type: CouponType.PERCENTAGE, value: 50, startDate: '2023-01-01', endDate: '2023-01-31', usageCount: 5, usageLimit: 5, courseIds: [], firstTimeBuyerOnly: false },
];

export const initialSentNotifications: SentNotification[] = [
    {
        id: 'sent-not-1',
        title: 'New Course Available!',
        message: 'Check out our new "Advanced Digital Marketing" course.',
        target: NotificationTarget.ALL,
        action: { type: NotificationActionType.VIEW_COURSE, payload: 'crs-4' },
        sentDate: '2023-06-10',
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
    },
    {
        id: 'sent-not-2',
        title: 'Summer Sale!',
        message: 'Use code SUMMER25 for 25% off on selected courses.',
        target: NotificationTarget.ALL,
        action: { type: NotificationActionType.VIEW_COUPON, payload: 'cpn-1' },
        sentDate: '2023-06-01',
        channels: [NotificationChannel.IN_APP],
    }
];

export const initialNotificationTemplates: NotificationTemplate[] = [
    {
        id: 'tpl-1',
        name: 'New Course Announcement',
        title: '🚀 New Course Alert!',
        message: 'A brand new course has just been launched. Check it out now!',
        target: NotificationTarget.ALL,
        action: { type: NotificationActionType.VIEW_COURSE, payload: 'crs-4' }
    },
    {
        id: 'tpl-2',
        name: 'Weekly Coupon Reminder',
        title: '💸 Don\'t Miss Out!',
        message: 'Your weekly discount is here. Use the code to get a special offer.',
        target: NotificationTarget.GOLD_MEMBERS,
        action: { type: NotificationActionType.VIEW_COUPON, payload: 'cpn-1' }
    }
];
