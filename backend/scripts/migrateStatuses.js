// Migration script to update old status values to new professional ones
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const User = require('../models/User');
const Job = require('../models/Job');

async function migrateStatuses() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔄 Migrating old status values to new schema...\n');
    
    let updatedUsers = 0;
    let updatedJobs = 0;
    
    // Old -> New status mapping
    const statusMap = {
      'Accepted': 'Shortlisted',
      'Not Selected': 'Rejected',
      'In Review': 'Under Review',
      'Reviewing': 'Under Review'
    };
    
    // Update User applications
    console.log('1️⃣  Updating user applications...');
    const users = await User.find({ appliedJobs: { $exists: true, $ne: [] } });
    
    for (const user of users) {
      let changed = false;
      
      for (const app of user.appliedJobs) {
        if (statusMap[app.status]) {
          console.log(`   ✏️  ${user.email}: ${app.status} → ${statusMap[app.status]}`);
          app.status = statusMap[app.status];
          changed = true;
        }
      }
      
      if (changed) {
        await user.save();
        updatedUsers++;
      }
    }
    console.log(`   ✅ Updated ${updatedUsers} users\n`);
    
    // Update Job applicants
    console.log('2️⃣  Updating job applicants...');
    const jobs = await Job.find({ applicants: { $exists: true, $ne: [] } });
    
    for (const job of jobs) {
      let changed = false;
      
      for (const applicant of job.applicants) {
        if (statusMap[applicant.status]) {
          console.log(`   ✏️  Job "${job.title}": ${applicant.status} → ${statusMap[applicant.status]}`);
          applicant.status = statusMap[applicant.status];
          changed = true;
        }
      }
      
      if (changed) {
        await job.save();
        updatedJobs++;
      }
    }
    console.log(`   ✅ Updated ${updatedJobs} jobs\n`);
    
    console.log('✅ Migration completed successfully!');
    console.log(`   - Users updated: ${updatedUsers}`);
    console.log(`   - Jobs updated: ${updatedJobs}`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    process.exit(1);
  }
}

migrateStatuses();
