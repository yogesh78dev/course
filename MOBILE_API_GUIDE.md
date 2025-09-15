# CourseAdmin Pro - Mobile App API Guide

This document provides a comprehensive overview of the REST API endpoints available for the CourseAdmin Pro mobile application. It is intended for mobile application developers integrating with the backend.

## General Information

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: Authenticated endpoints require a JSON Web Token (JWT) to be included in the `Authorization` header of the request.
  - **Format**: `Authorization: Bearer <YOUR_JWT_TOKEN>`
  - The token is obtained from the login or registration endpoints.

---

## 1. Authentication

Endpoints for student registration, login, and password management.

### 1.1 Registration with OTP (Email & Password)

This is a two-step process to ensure email validity.

#### Step 1: Send Registration OTP

- **Endpoint**: `POST /auth/register-send-otp`
- **Purpose**: Checks if an email is available and sends a verification OTP.
- **Authentication**: Public.
- **Request Body**:
  ```json
  {
    "name": "New Student",
    "email": "student@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Verification OTP sent to your email."
  }
  ```
- **Error Response (400 Bad Request)**: `{"message": "An account with this email already exists."}`

#### Step 2: Verify OTP and Create Account

- **Endpoint**: `POST /auth/register-verify-and-create`
- **Purpose**: Verifies the OTP and creates the student account.
- **Authentication**: Public.
- **Request Body**:
  ```json
  {
    "email": "student@example.com",
    "otp": "123456"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "message": "Account verified and created successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "usr-random-uuid",
        "name": "New Student",
        "email": "student@example.com",
        "role": "Student",
        "avatar": "https://picsum.photos/seed/1678886400/100",
        "joinedDate": "2024-07-28"
    }
  }
  ```
- **Error Response (400 Bad Request)**: `{"message": "Invalid or expired OTP."}`

### 1.2 Login Student

- **Endpoint**: `POST /auth/login-student`
- **Purpose**: Authenticates a student and returns a JWT.
- **Authentication**: Public.
- **Request Body**:
  ```json
  {
    "email": "student@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
      "message": "Student login successful",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": { ... }
  }
  ```
- **Error Response (401 Unauthorized)**:
  ```json
  {
      "message": "Incorrect password. Please try again."
  }
  ```

### 1.3 Login with Gmail (OTP-Free)

- **Endpoint**: `POST /auth/login-gmail`
- **Purpose**: Handles login/registration via a Gmail account. If the user doesn't exist, a new account is created. This flow does **not** require OTP.
- **Authentication**: Public.
- **Request Body**:
  ```json
  {
    "email": "gmail.user@example.com",
    "name": "Gmail User"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
      "message": "Gmail login successful",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": { ... }
  }
  ```

---

## 2. Password Reset Flow

### 2.1 Forgot Password

- **Endpoint**: `POST /auth/forgot-password`
- **Purpose**: Initiates the password reset process by sending an OTP to the user's email.
- **Authentication**: Public.
- **Request Body**: `{"email": "user@example.com"}`
- **Success Response (200 OK)**:
  ```json
  {
      "message": "If an account with that email exists, a password reset code has been sent."
  }
  ```

### 2.2 Verify OTP

- **Endpoint**: `POST /auth/verify-otp`
- **Purpose**: Verifies the OTP sent to the user.
- **Authentication**: Public.
- **Request Body**: `{"email": "user@example.com", "otp": "123456"}`
- **Success Response (200 OK)**:
  ```json
  {
      "message": "OTP verified successfully."
  }
  ```
- **Error Response (400 Bad Request)**: `{"message": "Invalid or expired OTP."}`

### 2.3 Reset Password

- **Endpoint**: `POST /auth/reset-password`
- **Purpose**: Sets a new password for the user after successful OTP verification.
- **Authentication**: Public.
- **Request Body**: `{"email": "user@example.com", "otp": "123456", "password": "newStrongPassword"}`
- **Success Response (200 OK)**:
  ```json
  {
      "message": "Password has been reset successfully."
  }
  ```

### 2.4 Resend OTP

- **Endpoint**: `POST /auth/resend-otp`
- **Purpose**: Resends a new OTP to the user's email.
- **Authentication**: Public.
- **Request Body**: `{"email": "user@example.com"}`
- **Success Response (200 OK)**:
  ```json
  {
      "message": "If an account with that email exists, a new password reset code has been sent."
  }
  ```

---

## 3. Public Course Discovery

Endpoints for browsing courses without authentication.

### 3.1 Get All Public Courses

- **Endpoint**: `GET /courses/public`
- **Purpose**: Retrieves a list of all available courses for discovery.
- **Authentication**: Public.
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Successfully fetched all public courses.",
    "data": [
      {
        "id": "crs-1",
        "title": "React for Beginners",
        "price": 49.99,
        "duration": "10 hours",
        "posterImageUrl": "https://.../react.jpg",
        "enableCertificate": true,
        "category": "Web Development",
        "instructorName": "John Doe"
      }
    ]
  }
  ```

### 3.2 Get Public Course Details

- **Endpoint**: `GET /courses/public/:id`
- **Purpose**: Retrieves full details of a specific course, including its curriculum.
- **Authentication**: Public.
- **Success Response (200 OK)**: Returns the full `Course` object with `modules` and `lessons`.

---

## 4. Purchase Flow

A secure, two-step process for enrolling users in a course.

### 4.1 Initiate Purchase

- **Endpoint**: `POST /student/purchase/initiate`
- **Purpose**: Creates a pending order and returns details needed for the payment gateway.
- **Authentication**: Bearer Token.
- **Request Body**:
  ```json
  {
    "courseId": "crs-2",
    "couponCode": "WELCOME10" // Optional
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Order created successfully. Proceed to payment.",
    "data": {
        "saleId": "sale-uuid-123",
        "gatewayOrderId": "order_mock_12345",
        "amount": 69.99,
        "currency": "INR",
        "gatewayKey": "your_public_gateway_key"
    }
  }
  ```
- **Error Response (400 Bad Request)**: `{"message": "You are already enrolled in this course."}`

### 4.2 Verify Payment

- **Endpoint**: `POST /student/purchase/verify`
- **Purpose**: Verifies payment details from the gateway. On success, it marks the order as 'Paid' and enrolls the student.
- **Authentication**: Bearer Token.
- **Request Body**:
  ```json
  {
    "saleId": "sale-uuid-123",
    "gatewayPaymentId": "pay_mock_abcdef",
    "gatewayOrderId": "order_mock_12345",
    "gatewaySignature": "mock_signature_from_gateway"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Payment successful. You are now enrolled in the course."
  }
  ```
- **Error Response (400 Bad Request)**: `{"message": "Payment verification failed."}`

### 4.3 Get My Purchase History

- **Endpoint**: `GET /student/purchase/history`
- **Purpose**: Retrieves a list of all past transactions for the logged-in student.
- **Authentication**: Bearer Token.
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Successfully fetched sales history.",
    "data": [
      {
        "id": "sal-1",
        "amount": 49.99,
        "status": "Paid",
        "date": "2023-05-10",
        "courseId": "crs-1",
        "courseTitle": "React for Beginners"
      }
    ]
  }
  ```

---

## 5. Student Profile & Courses (Authenticated)

Endpoints for authenticated students to manage their profile and learning.

### 5.1 Get My Profile

- **Endpoint**: `GET /student/me`
- **Purpose**: Retrieves the full profile of the logged-in student, including their `enrolledCourses` and `watchHistory`.
- **Authentication**: Bearer Token.
- **Success Response (200 OK)**: Returns the full `User` object.

### 5.2 Update My Profile

- **Endpoint**: `PUT /student/me`
- **Purpose**: Updates the student's name, phone number, or avatar. The avatar must be a base64 encoded data URL string.
- **Authentication**: Bearer Token.
- **Request Body** (all fields are optional):
  ```json
  {
    "name": "Updated Student Name",
    "phoneNumber": "555-123-4567",
    "avatar": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
  }
  ```
- **Success Response (200 OK)**: Returns the updated partial `User` object.

### 5.3 Get My Enrolled Courses

- **Endpoint**: `GET /student/my-courses`
- **Purpose**: Retrieves a list of courses the student is enrolled in.
- **Authentication**: Bearer Token.
- **Success Response (200 OK)**: Returns an array of `Course` objects, each with a `completionPercentage` field.

### 5.4 Get Enrolled Course Details

- **Endpoint**: `GET /student/my-courses/:courseId`
- **Purpose**: Gets full details for an enrolled course, including curriculum, personal watch history, submitted review, completion percentage, and certificate status.
- **Authentication**: Bearer Token.
- **Success Response (200 OK)**:
  ```json
  {
      "message": "Successfully fetched enrolled course details.",
      "data": {
          "course": { ... },
          "watchHistory": [ { "lessonId": "les-1", "progress": 100 } ],
          "myReview": { "rating": 5, "comment": "Great course!" },
          "completionPercentage": 100,
          "myCertificate": { 
              "id": "cert-1", 
              "certificateCode": "CERT-...", 
              "issueDate": "2024-07-29" 
          }
      }
  }
  ```

### 5.5 Update Lesson Progress

- **Endpoint**: `POST /student/my-courses/progress`
- **Purpose**: Creates or updates the watch progress for a lesson. Returns the new overall course completion percentage.
- **Authentication**: Bearer Token.
- **Request Body**:
  ```json
  {
    "lessonId": "les-1",
    "progress": 100
  }
  ```
- **Success Response (200 OK)**: 
  ```json
  {
      "message": "Lesson progress updated successfully.",
      "data": {
          "newCompletionPercentage": 50
      }
  }
  ```

---

## 6. Reviews (Authenticated)

### 6.1 Get My Reviews

- **Endpoint**: `GET /student/my-reviews`
- **Purpose**: Retrieves all reviews submitted by the logged-in student.
- **Authentication**: Bearer Token.
- **Success Response (200 OK)**:
  ```json
  {
      "message": "Successfully fetched your reviews.",
      "data": [
          {
              "id": "rev-1",
              "rating": 5,
              "comment": "Excellent course!",
              "status": "Approved",
              "date": "2023-06-01T00:00:00.000Z",
              "courseId": "crs-1",
              "courseTitle": "React for Beginners"
          }
      ]
  }
  ```

### 6.2 Submit/Update Course Review

- **Endpoint**: `POST /student/courses/:courseId/review`
- **Purpose**: Submits a new review or updates an existing one for an enrolled course.
- **Authentication**: Bearer Token.
- **Request Body**:
  ```json
  {
    "rating": 5,
    "comment": "This course was amazing!"
  }
  ```
- **Success Response (201 Created)**: Returns the newly created `Review` object.

---

## 7. Certificates (Authenticated)

### 7.1 Claim Certificate

- **Endpoint**: `POST /student/my-courses/:courseId/claim-certificate`
- **Purpose**: Claims a certificate for a completed course. The server will verify that the course is 100% complete and offers a certificate.
- **Authentication**: Bearer Token.
- **Success Response (201 Created)**: 
  ```json
  {
      "message": "Certificate claimed successfully!",
      "data": {
          "id": "cert-new-uuid",
          "certificateCode": "CERT-...",
          "issueDate": "2024-07-29"
      }
  }
  ```
- **Error Response (400 Bad Request)**: `{"message": "Course is not yet completed."}` or `{"message": "Certificate has already been claimed."}`

### 7.2 Get My Certificates

- **Endpoint**: `GET /student/my-certificates`
- **Purpose**: Retrieves a list of all certificates earned by the student.
- **Authentication**: Bearer Token.
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Successfully fetched your certificates.",
    "data": [
        {
            "id": "cert-1",
            "userId": "usr-1",
            "courseId": "crs-4",
            "certificateCode": "CERT-CRS4-USR1-XYZ",
            "issueDate": "2024-07-29",
            "courseTitle": "Advanced Digital Marketing",
            "instructorName": "Susan Lee"
        }
    ]
  }
  ```

---

## 8. Notifications (Authenticated)

### 8.1 Get My Notifications

- **Endpoint**: `GET /student/my-notifications`
- **Purpose**: Retrieves notifications targeted to the student.
- **Authentication**: Bearer Token.
- **Success Response (200 OK)**:
  ```json
  {
      "message": "Successfully fetched your notifications.",
      "data": [
          {
              "id": "sent-not-1",
              "title": "New Course Available!",
              "message": "Check out our new 'Advanced Digital Marketing' course.",
              "timestamp": "2023-06-10 12:00",
              "read": false
          }
      ]
  }
  ```