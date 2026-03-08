const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isDefault: { type: Boolean, default: false } // To identify the root admin
});

// Indexes for performance optimization
adminSchema.index({ isDefault: 1 }); // For finding default admin quickly

// Compound index for admin login queries
adminSchema.index({ username: 1, isDefault: 1 });

module.exports = mongoose.model('Admin', adminSchema);