# API Reference - RecruitFlow Platform

Complete REST API documentation for the RecruitFlow Platform.

**Base URL**: `https://your-backend-url.com/api`  
**Authentication**: JWT Bearer Token

---

## Authentication Endpoints

### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Admin Login
```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Main@2026"
}
```

---

## Public Job Endpoints

### Get All Jobs
```http
GET /api/jobs?page=1&limit=20&experience=0&salary=500000&location=Bengaluru
```

**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 50)
- `experience` (optional): Minimum years of experience required
- `salary` (optional): Minimum salary
- `location` (optional): Filter by location (partial match)
- `jobType` (optional): "Full-time", "Part-time", "Contract", "Internship"

**Response** (200 OK):
```json
{
  "success": true,
  "jobs": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Senior Full Stack Developer",
      "companyName": "Infosys Limited",
      "location": "Bengaluru, Karnataka",
      "salary": 2000000,
      "experienceRequired": 5,
      "jobType": "Full-time",
      "description": "...",
      "requirements": ["..."],
      "createdAt": "2026-01-10T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalJobs": 100,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get Job Details
```http
GET /api/jobs/:id
```

**Response** (200 OK): Returns complete job object including applicant count.

---

## User Protected Routes

**Authentication Required**: Include JWT token in Authorization header:
```
Authorization: Bearer <your-token>
```

### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91-9876543210",
    "gender": "Male",
    "experience": 3,
    "skills": ["JavaScript", "React", "Node.js"],
    "description": "Full stack developer...",
    "profilePhoto": "https://backend.com/api/files/...",
    "resume": "https://backend.com/api/files/...",
    "appliedJobs": [...],
    "bookmarkedJobs": [...]
  }
}
```

### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

name: John Doe
phone: +91-9876543210
experience: 3
skills: ["JavaScript", "React", "Node.js"]
description: Full stack developer...
profilePhoto: [file]
resume: [file]
```

**Response** (200 OK): Returns updated user object.

### Apply for Job
```http
POST /api/users/jobs/:id/apply
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application": {
    "jobId": "507f1f77bcf86cd799439011",
    "status": "Pending",
    "appliedAt": "2026-01-12T14:30:00.000Z"
  }
}
```

### Withdraw Application
```http
DELETE /api/users/jobs/:id/withdraw
Authorization: Bearer <token>
```

### Get All Applications
```http
GET /api/users/applied-jobs
Authorization: Bearer <token>
```

**Response** (200 OK): Returns array of jobs user has applied to with application status.

### Bookmark Job
```http
POST /api/users/jobs/:id/bookmark
Authorization: Bearer <token>
```

### Remove Bookmark
```http
DELETE /api/users/jobs/:id/bookmark
Authorization: Bearer <token>
```

### Get Bookmarked Jobs
```http
GET /api/users/bookmarked-jobs
Authorization: Bearer <token>
```

---

## Admin Protected Routes

**Authentication Required**: Include admin JWT token in Authorization header:
```
Authorization: Bearer <admin-token>
```

### Dashboard Statistics
```http
GET /api/admin/stats
Authorization: Bearer <admin-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalJobs": 45,
    "totalApplications": 320,
    "recentApplications": [...],
    "recentUsers": [...]
  }
}
```

### Get All Jobs (Admin)
```http
GET /api/admin/jobs?page=1&limit=20
Authorization: Bearer <admin-token>
```

**Response**: Returns all jobs including deleted jobs (soft delete).

### Create Job
```http
POST /api/admin/jobs
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Senior Developer",
  "companyName": "Tech Corp",
  "location": "Bengaluru",
  "salary": 1500000,
  "experienceRequired": 5,
  "jobType": "Full-time",
  "description": "...",
  "requirements": ["..."]
}
```

### Update Job
```http
PUT /api/admin/jobs/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Updated Title",
  "salary": 1600000,
  ...
}
```

### Delete Job (Soft Delete)
```http
DELETE /api/admin/jobs/:id
Authorization: Bearer <admin-token>
```

### Get Job Applicants
```http
GET /api/admin/jobs/:jobId/applicants
Authorization: Bearer <admin-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "applicants": [
    {
      "userId": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91-9876543210",
      "experience": 3,
      "skills": ["JavaScript", "React"],
      "resume": "https://backend.com/api/files/...",
      "appliedAt": "2026-01-10T10:30:00.000Z",
      "status": "Pending"
    }
  ]
}
```

### Update Application Status
```http
PATCH /api/admin/jobs/:jobId/applicants/:applicantId/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "Shortlisted"
}
```

**Valid Statuses**: "Pending", "Under Review", "Shortlisted", "Rejected"

### Get All Users
```http
GET /api/admin/users?page=1&limit=20
Authorization: Bearer <admin-token>
```

### Delete User (Soft Delete)
```http
DELETE /api/admin/users/:id
Authorization: Bearer <admin-token>
```

### Get All Admins
```http
GET /api/admin/admins
Authorization: Bearer <admin-token>
```

### Create Admin (Default Admin Only)
```http
POST /api/admin/admins
Authorization: Bearer <default-admin-token>
Content-Type: application/json

{
  "username": "newadmin",
  "password": "SecurePass@123"
}
```

### Delete Admin (Default Admin Only)
```http
DELETE /api/admin/admins/:id
Authorization: Bearer <default-admin-token>
```

**Note**: Cannot delete the default admin account.

---

## System Endpoints

### Health Check
```http
GET /api/health
```

**Response** (200 OK):
```json
{
  "status": "OK",
  "timestamp": "2026-01-12T14:30:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

### API Documentation
```http
GET /api/docs
```

Returns HTML page with interactive API documentation.

### Download File from GridFS
```http
GET /api/files/:fileId
```

Returns the file (resume or profile photo) stored in GridFS.

---

## Error Responses

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input or validation error
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate resource (e.g., email already exists)
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

---

## Rate Limiting

**API Endpoints**: 100 requests per 15 minutes per IP  
**Auth Endpoints**: 5 requests per 15 minutes per IP  
**File Uploads**: 10 uploads per 15 minutes per IP

When rate limit is exceeded:
```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

---

## WebSocket Events

For real-time features, connect to Socket.io server:

**Client-side Connection**:
```javascript
import io from 'socket.io-client';

const socket = io('https://your-backend.onrender.com', {
  auth: { token: userToken }
});
```

### Events Received by Users

**new-job-posted**
```javascript
socket.on('new-job-posted', (job) => {
  console.log('New job:', job);
});
```

**application-status-updated**
```javascript
socket.on('application-status-updated', (data) => {
  console.log('Status update:', data);
  // { jobId, jobTitle, status }
});
```

**job-deleted**
```javascript
socket.on('job-deleted', (jobId) => {
  console.log('Job deleted:', jobId);
});
```

### Events Received by Admins

**new-application**
```javascript
socket.on('new-application', (data) => {
  console.log('New application:', data);
  // { jobId, jobTitle, applicantName, applicantEmail }
});
```

---

For more information, see the [main README](../README.md).
