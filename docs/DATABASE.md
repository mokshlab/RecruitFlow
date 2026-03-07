# Database Design - RecruitFlow Platform

MongoDB database schema documentation using Mongoose ODM.

---

## Collections Overview

| Collection | Purpose | Document Count (Typical) |
|------------|---------|---------------------------|
| **users** | User profiles and applications | 100-1000+ |
| **jobs** | Job listings | 50-500 |
| **admins** | Admin accounts | 1-10 |

---

## User Model

### Schema Definition

```javascript
{
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
    // Hashed with bcrypt (10 salt rounds)
  },
  phone: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  skills: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    maxLength: 1000
  },
  profilePhoto: {
    type: String  // GridFS file URL
  },
  resume: {
    type: String  // GridFS file URL
  },
  appliedJobs: [{
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Shortlisted', 'Rejected'],
      default: 'Pending'
    }
  }],
  bookmarkedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
},
{
  timestamps: true  // Adds createdAt and updatedAt
}
```

### Indexes

```javascript
// Performance optimization indexes
email: { unique: true }               // Fast login/registration
experience: 1                          // Filter by experience
skills: 1                              // Search by skills
isDeleted: 1                           // Exclude deleted users
'appliedJobs.jobId': 1                 // Check if user applied
bookmarkedJobs: 1                      // Bookmark queries
createdAt: -1                          // Sort by registration date
```

### Sample Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Demo User",
  "email": "demo.user@example.com",
  "password": "$2a$10$XqZ8...",
  "phone": "+91-9506095060",
  "gender": "Male",
  "experience": 7,
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "description": "Full stack developer with 7 years of experience...",
  "profilePhoto": "https://backend.com/api/files/65a1b2c3d4e5f6g7h8i9j0k1",
  "resume": "https://backend.com/api/files/75a1b2c3d4e5f6g7h8i9j0k2",
  "appliedJobs": [
    {
      "jobId": "607f1f77bcf86cd799439012",
      "appliedAt": "2026-01-10T10:30:00.000Z",
      "status": "Under Review"
    }
  ],
  "bookmarkedJobs": [
    "707f1f77bcf86cd799439013",
    "807f1f77bcf86cd799439014"
  ],
  "isDeleted": false,
  "createdAt": "2026-01-01T08:00:00.000Z",
  "updatedAt": "2026-01-10T14:30:00.000Z"
}
```

---

## Job Model

### Schema Definition

```javascript
{
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    type: Number,
    required: true,
    min: 0
  },
  experienceRequired: {
    type: Number,
    required: true,
    min: 0
  },
  jobType: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship']
  },
  requirements: [{
    type: String,
    trim: true
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  applicants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Shortlisted', 'Rejected'],
      default: 'Pending'
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
},
{
  timestamps: true
}
```

### Indexes

```javascript
// Single-field indexes
createdAt: -1                          // Sort by posting date
experienceRequired: 1                  // Filter by experience
salary: 1                              // Filter by salary
jobType: 1                             // Filter by job type
location: 1                            // Filter by location
isDeleted: 1                           // Exclude deleted jobs
postedBy: 1                            // Jobs by admin
'applicants.userId': 1                 // Check user's application
'applicants.status': 1                 // Filter by application status

// Text search index
{ title: 'text', companyName: 'text', location: 'text' }

// Compound indexes for common queries
{ isDeleted: 1, createdAt: -1 }        // Active jobs by date
{ experienceRequired: 1, salary: 1 }    // Multi-filter queries
{ location: 1, jobType: 1 }            // Location + type filter
{ isDeleted: 1, experienceRequired: 1, salary: 1 }  // Advanced filters
```

### Sample Document

```json
{
  "_id": "607f1f77bcf86cd799439012",
  "title": "Senior Full Stack Developer",
  "description": "Build scalable web applications...",
  "companyName": "Infosys Limited",
  "location": "Bengaluru, Karnataka",
  "salary": 2000000,
  "experienceRequired": 5,
  "jobType": "Full-time",
  "requirements": [
    "5+ years of MERN stack experience",
    "Strong knowledge of React.js",
    "Experience with cloud platforms"
  ],
  "postedBy": "507f191e810c19729de860ea",
  "applicants": [
    {
      "userId": "507f1f77bcf86cd799439011",
      "appliedAt": "2026-01-10T10:30:00.000Z",
      "status": "Under Review"
    }
  ],
  "isDeleted": false,
  "createdAt": "2026-01-05T08:00:00.000Z",
  "updatedAt": "2026-01-10T10:30:00.000Z"
}
```

---

## Admin Model

### Schema Definition

```javascript
{
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
    // Hashed with bcrypt (10 salt rounds)
  },
  isDefault: {
    type: Boolean,
    default: false
    // Prevents deletion of root admin
  }
},
{
  timestamps: true
}
```

### Indexes

```javascript
username: { unique: true }             // Fast login
isDefault: 1                           // Identify root admin
```

### Sample Document

```json
{
  "_id": "507f191e810c19729de860ea",
  "username": "admin",
  "password": "$2a$10$YqZ9...",
  "isDefault": true,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

---

## GridFS Collections (File Storage)

GridFS splits files into chunks and stores metadata separately.

### fs.files (Metadata)

```javascript
{
  _id: ObjectId,
  length: Number,              // File size in bytes
  chunkSize: Number,           // Default 255KB
  uploadDate: Date,
  filename: String,            // Original filename
  contentType: String,         // MIME type
  metadata: {
    userId: ObjectId,          // User who uploaded
    fileType: String           // 'resume' or 'profilePhoto'
  }
}
```

### fs.chunks (Binary Data)

```javascript
{
  _id: ObjectId,
  files_id: ObjectId,          // References fs.files._id
  n: Number,                   // Chunk sequence number
  data: Binary                 // File chunk data
}
```

---

## Relationships

```
Admin (1) ─────── (N) Job
                        │
                        │ (N)
                        │
User (1) ─────── (N) Application ─────── (1) Job
  │
  │ (N)
  │
  └──────────── (N) Bookmark ─────── (1) Job
```

### Data Integrity

- **Cascade Updates**: When admin updates job, all user applications reflect changes
- **Soft Deletes**: Jobs and users marked as deleted, not permanently removed
- **Dual References**: Applications stored in both User and Job models for performance
- **MongoDB Transactions**: Used for operations affecting multiple documents

---

## Query Examples

### Find Jobs by Salary Range
```javascript
Job.find({
  salary: { $gte: 1000000, $lte: 2000000 },
  isDeleted: false
})
.sort({ createdAt: -1 })
.limit(20);
```

### Get User's Applications with Job Details
```javascript
User.findById(userId)
  .populate({
    path: 'appliedJobs.jobId',
    select: 'title companyName location salary'
  });
```

### Text Search
```javascript
Job.find({
  $text: { $search: "react developer bengaluru" },
  isDeleted: false
})
.sort({ score: { $meta: "textScore" } });
```

### Get Job Applicants with User Info
```javascript
Job.findById(jobId)
  .populate({
    path: 'applicants.userId',
    select: 'name email phone experience skills resume'
  });
```

---

## Performance Optimization

### Index Strategy

1. **Single-field indexes** for common filters (experience, salary, location)
2. **Compound indexes** for multi-field queries
3. **Text indexes** for search functionality
4. **Unique indexes** for email and username

### Connection Pooling

```javascript
{
  minPoolSize: 2,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
}
```

### Pagination

All list endpoints use cursor-based pagination:
- Default: 50 items per page
- Maximum: 100 items per page
- Skip expensive `count()` operations when possible

---

For implementation details, see [backend/models/](../backend/models/).
