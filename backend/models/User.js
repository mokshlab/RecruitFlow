const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  experience: { type: Number, required: true, default: 0 }, // in years
  skills: [{ type: String }],
  description: { type: String },
  profilePhoto: { type: String }, // Path to the file
  resume: { type: String }, // Path to the file
  appliedJobs: [{ 
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    appliedAt: { type: Date, default: Date.now },
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
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
});

// Indexes for performance optimization
userSchema.index({ experience: 1 }); // For filtering users by experience
userSchema.index({ skills: 1 }); // For searching users by skills
userSchema.index({ isDeleted: 1 }); // For filtering active/deleted users
userSchema.index({ 'appliedJobs.jobId': 1 }); // For finding users who applied to specific job
userSchema.index({ 'appliedJobs.status': 1 }); // For filtering by application status
userSchema.index({ bookmarkedJobs: 1 }); // For bookmark lookups

// Compound indexes for common query patterns
userSchema.index({ isDeleted: 1, experience: 1 }); // Active users by experience
userSchema.index({ email: 1, isDeleted: 1 }); // Login queries

module.exports = mongoose.model('User', userSchema);