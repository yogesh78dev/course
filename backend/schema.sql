-- CourseAdmin Pro Database Schema (MySQL)
-- This schema defines the structure for the online course platform's backend.

-- =============================================
-- Core User & Authentication Tables
-- =============================================

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NULL,
    role ENUM('Student', 'Gold Member', 'Admin') NOT NULL,
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    avatar_url VARCHAR(255),
    password_reset_otp VARCHAR(10) NULL,
    password_reset_expires DATETIME NULL,
    joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE unverified_users (
    email VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE instructors (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- Course Structure Tables
-- =============================================

CREATE TABLE categories (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    duration VARCHAR(100),
    poster_image_url VARCHAR(255),
    banner_image_url VARCHAR(255),
    intro_video_url VARCHAR(255),
    access_type ENUM('lifetime', 'expiry') NOT NULL DEFAULT 'lifetime',
    access_duration_days INT,
    enable_certificate BOOLEAN NOT NULL DEFAULT FALSE,
    instructor_id CHAR(36),
    category_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE modules (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    course_id CHAR(36) NOT NULL,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE lessons (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('video', 'pdf', 'quiz', 'assignment') NOT NULL,
    content_url VARCHAR(255),
    duration_minutes INT NOT NULL DEFAULT 0,
    attachment_url VARCHAR(255),
    module_id CHAR(36) NOT NULL,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- =============================================
-- Student Interaction Tables
-- =============================================

CREATE TABLE enrollments (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP NULL,
    completion_percentage INT NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    UNIQUE (user_id, course_id), -- A user can only enroll in a course once
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE watch_history (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    lesson_id CHAR(36) NOT NULL,
    progress_percentage INT NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status ENUM('Pending', 'Approved', 'Hidden') NOT NULL DEFAULT 'Pending',
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (user_id, course_id), -- One review per user per course
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE certificates (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    certificate_code VARCHAR(255) UNIQUE NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE (user_id, course_id)
);

-- =============================================
-- Sales & Promotions Tables
-- =============================================

CREATE TABLE coupons (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    type ENUM('Percentage', 'Fixed Amount') NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    usage_limit INT, -- NULL for unlimited
    first_time_buyer_only BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE coupon_courses (
    coupon_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    PRIMARY KEY (coupon_id, course_id),
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE sales (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    original_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    amount DECIMAL(10, 2) NOT NULL, -- Final amount paid
    status ENUM('Paid', 'Pending', 'Failed') NOT NULL,
    coupon_id CHAR(36) NULL,
    payment_gateway VARCHAR(50),
    gateway_order_id VARCHAR(255) NULL,
    gateway_payment_id VARCHAR(255) NULL,
    gateway_signature VARCHAR(255) NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL
);

CREATE TABLE coupon_usage (
    id CHAR(36) PRIMARY KEY,
    coupon_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    sale_id CHAR(36) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
);

-- =============================================
-- Notifications Tables
-- =============================================

CREATE TABLE notification_templates (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target ENUM('All Users', 'Students', 'Gold Members') NOT NULL,
    action_type ENUM('None', 'View Course', 'View Coupon') DEFAULT 'None',
    action_payload VARCHAR(255), -- e.g., course_id or coupon_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sent_notifications (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target ENUM('All Users', 'Students', 'Gold Members') NOT NULL,
    action_type ENUM('None', 'View Course', 'View Coupon') DEFAULT 'None',
    action_payload VARCHAR(255),
    channels JSON NOT NULL, -- Array of strings like ['In-App', 'Push']
    sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =============================================
-- SEED DATA
-- =============================================

-- Default password for all users is 'password'
SET @password_hash = '$2a$10$e.kYDx0J8e3c.09117a2.uD1oT8iUfJ/8R.bShswAX08RCAPM2v2';

INSERT INTO categories (id, name) VALUES
('cat-1', 'Web Development'),
('cat-2', 'Data Science'),
('cat-3', 'Design'),
('cat-4', 'Marketing');

INSERT INTO instructors (id, name, email, bio, avatar_url) VALUES
('inst-1', 'John Doe', 'john.doe@example.com', 'Expert in React and frontend development with over 10 years of experience.', 'https://picsum.photos/seed/johndoe/100'),
('inst-2', 'Jane Smith', 'jane.smith@example.com', 'Data scientist and Python enthusiast, passionate about making data accessible.', 'https://picsum.photos/seed/janesmith/100'),
('inst-3', 'Peter Jones', 'peter.jones@example.com', 'Creative director and UI/UX designer with a focus on user-centered design.', 'https://picsum.photos/seed/peterjones/100'),
('inst-4', 'Susan Lee', 'susan.lee@example.com', 'Digital marketing strategist with a track record of successful campaigns.', 'https://picsum.photos/seed/susanlee/100');

INSERT INTO users (id, name, email, phone_number, password_hash, role, avatar_url, joined_date) VALUES
('usr-1', 'Alice Johnson', 'alice@example.com', '123-456-7890', @password_hash, 'Gold Member', 'https://picsum.photos/seed/alice/100', '2023-01-15'),
('usr-2', 'Bob Williams', 'bob@example.com', NULL, @password_hash, 'Student', 'https://picsum.photos/seed/bob/100', '2023-02-20'),
('usr-3', 'Charlie Brown', 'charlie@example.com', NULL, @password_hash, 'Student', 'https://picsum.photos/seed/charlie/100', '2023-03-10'),
('usr-4', 'Admin User', 'admin@example.com', NULL, @password_hash, 'Admin', 'https://picsum.photos/seed/admin/100', '2022-12-01');

INSERT INTO courses (id, title, description, price, duration, poster_image_url, banner_image_url, intro_video_url, access_type, access_duration_days, enable_certificate, instructor_id, category_id) VALUES
('crs-1', 'React for Beginners', 'A comprehensive guide to React.', 49.99, '10 hours', 'https://picsum.photos/seed/react/400/225', 'https://picsum.photos/seed/react-banner/1000/300', 'https://vimeo.com/123456', 'lifetime', NULL, TRUE, 'inst-1', 'cat-1'),
('crs-2', 'Python for Data Science', 'Learn Python for data analysis.', 79.99, '15 hours', 'https://picsum.photos/seed/python/400/225', 'https://picsum.photos/seed/python-banner/1000/300', 'https://vimeo.com/234567', 'expiry', 365, TRUE, 'inst-2', 'cat-2'),
('crs-3', 'UI/UX Design Fundamentals', 'Master the basics of UI/UX.', 39.99, '8 hours', 'https://picsum.photos/seed/design/400/225', 'https://picsum.photos/seed/design-banner/1000/300', 'https://vimeo.com/345678', 'lifetime', NULL, FALSE, 'inst-3', 'cat-3'),
('crs-4', 'Advanced Digital Marketing', 'Become a marketing expert.', 99.99, '20 hours', 'https://picsum.photos/seed/marketing/400/225', 'https://picsum.photos/seed/marketing-banner/1000/300', '', 'expiry', 180, TRUE, 'inst-4', 'cat-4');

INSERT INTO modules (id, title, course_id, order_index) VALUES
('mod-1', 'Module 1: Introduction', 'crs-1', 0),
('mod-2', 'Module 2: Core Concepts', 'crs-1', 1),
('mod-3', 'Module 1: Python Fundamentals', 'crs-2', 0);

INSERT INTO lessons (id, title, description, type, content_url, duration_minutes, attachment_url, module_id, order_index) VALUES
('les-1', 'What is React?', 'An introduction to the React library and its core concepts.', 'video', 'https://vimeo.com/123456', 15, '', 'mod-1', 0),
('les-2', 'Setting up your environment', 'A step-by-step guide to setting up your local development environment.', 'pdf', '', 30, '/pdfs/setup-guide.pdf', 'mod-1', 1),
('les-3', 'Components and Props', 'Learn about React components and how to pass data with props.', 'video', 'https://vimeo.com/123457', 45, '', 'mod-2', 0),
('les-4', 'State and Lifecycle', 'Understand component state and lifecycle methods.', 'video', 'https://vimeo.com/123457', 60, '', 'mod-2', 1),
('les-5', 'Module 2 Quiz', 'Test your knowledge on core React concepts.', 'quiz', '/quizzes/module2.json', 20, '', 'mod-2', 2),
('les-6', 'Introduction to Python', 'Get started with the basics of Python programming.', 'video', 'https://vimeo.com/234567', 30, '', 'mod-3', 0);

INSERT INTO coupons (id, code, type, value, start_date, end_date, usage_limit, first_time_buyer_only) VALUES
('cpn-1', 'SUMMER25', 'Percentage', 25, '2024-06-01', '2024-08-31', 100, FALSE),
('cpn-2', 'WELCOME10', 'Fixed Amount', 10, '2024-01-01', '2024-12-31', NULL, TRUE),
('cpn-3', 'EXPIRED50', 'Percentage', 50, '2023-01-01', '2023-01-31', 5, FALSE);

INSERT INTO coupon_courses (coupon_id, course_id) VALUES
('cpn-1', 'crs-1'),
('cpn-1', 'crs-3');

INSERT INTO sales (id, user_id, course_id, original_amount, amount, status, sale_date) VALUES
('sal-1', 'usr-1', 'crs-1', 49.99, 49.99, 'Paid', '2023-05-10'),
('sal-2', 'usr-2', 'crs-2', 79.99, 79.99, 'Paid', '2023-05-12'),
('sal-3', 'usr-3', 'crs-3', 39.99, 39.99, 'Pending', '2023-05-15'),
('sal-4', 'usr-1', 'crs-4', 99.99, 99.99, 'Paid', '2023-05-18'),
('sal-5', 'usr-2', 'crs-1', 49.99, 49.99, 'Paid', '2023-05-19');

-- Enrollments derived from sales data. Expiry dates calculated for 'expiry' type courses.
INSERT INTO enrollments (id, user_id, course_id, enrollment_date, expiry_date, completion_percentage) VALUES
('enr-1', 'usr-1', 'crs-1', '2023-05-10', NULL, 0),
('enr-2', 'usr-2', 'crs-2', '2023-05-12', '2024-05-11', 0),
('enr-3', 'usr-1', 'crs-4', '2023-05-18', '2023-11-14', 100),
('enr-4', 'usr-2', 'crs-1', '2023-05-19', NULL, 50);

INSERT INTO watch_history (id, user_id, lesson_id, progress_percentage, watched_at, updated_at) VALUES
('wh-1', 'usr-2', 'les-1', 100, '2023-06-10 10:00:00', '2023-06-10 10:00:00'),
('wh-2', 'usr-2', 'les-3', 50, '2023-06-11 11:30:00', '2023-06-11 11:30:00');

INSERT INTO reviews (id, course_id, user_id, rating, comment, review_date, status) VALUES
('rev-1', 'crs-1', 'usr-1', 5, 'Excellent course, very clear explanations!', '2023-06-01', 'Approved'),
('rev-2', 'crs-1', 'usr-2', 4, 'Good content, but could be more in-depth.', '2023-06-02', 'Approved'),
('rev-3', 'crs-2', 'usr-3', 5, 'Loved it! The instructor is fantastic.', '2023-06-03', 'Pending'),
('rev-4', 'crs-3', 'usr-2', 3, 'It was okay. A bit basic for me.', '2023-06-04', 'Hidden'),
('rev-5', 'crs-4', 'usr-1', 5, 'This course is a game-changer. Highly recommended!', '2023-06-05', 'Approved'),
('rev-6', 'crs-2', 'usr-1', 4, 'Really helpful for my career.', '2023-06-06', 'Approved');

INSERT INTO certificates (id, user_id, course_id, certificate_code) VALUES
('cert-1', 'usr-1', 'crs-4', 'CERT-CRS4-USR1-XYZ');

INSERT INTO sent_notifications (id, title, message, target, action_type, action_payload, channels, sent_date) VALUES
('sent-not-1', 'New Course Available!', 'Check out our new "Advanced Digital Marketing" course.', 'All Users', 'View Course', 'crs-4', '["In-App", "Push"]', '2023-06-10'),
('sent-not-2', 'Summer Sale!', 'Use code SUMMER25 for 25% off on selected courses.', 'All Users', 'View Coupon', 'cpn-1', '["In-App"]', '2023-06-01');

INSERT INTO notification_templates (id, name, title, message, target, action_type, action_payload) VALUES
('tpl-1', 'New Course Announcement', '🚀 New Course Alert!', 'A brand new course has just been launched. Check it out now!', 'All Users', 'View Course', 'crs-4'),
('tpl-2', 'Weekly Coupon Reminder', '💸 Don''t Miss Out!', 'Your weekly discount is here. Use the code to get a special offer.', 'Gold Members', 'View Coupon', 'cpn-1');