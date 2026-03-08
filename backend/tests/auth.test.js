// backend/tests/auth.test.js
// Simple authentication tests

const path = require('path');
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Simple test helper - no full framework needed
const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000';

// Test data
const testUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'Test@1234',
  gender: 'Male'
};

const testAdmin = {
  username: 'testadmin',
  password: 'Admin@1234'
};

// Helper to connect to test database
async function connectTestDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recruit_flow_test');
    console.log('✅ Connected to test database');
  } catch (error) {
    console.error('❌ Test DB connection failed:', error.message);
    process.exit(1);
  }
}

// Helper to clean up test data
async function cleanupTestData() {
  try {
    await User.deleteOne({ email: testUser.email });
    await Admin.deleteOne({ username: testAdmin.username });
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('⚠️  Cleanup warning:', error.message);
  }
}

// Helper to create test admin
async function createTestAdmin() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testAdmin.password, salt);
    await Admin.create({ username: testAdmin.username, password: hashedPassword });
    console.log('✅ Test admin created');
  } catch (error) {
    console.error('⚠️  Admin creation warning:', error.message);
  }
}

// Test runner
async function runTests() {
  console.log('\n🧪 Starting Authentication Tests...\n');
  
  await connectTestDB();
  await cleanupTestData();
  
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: User Registration
  console.log('Test 1: User Registration');
  try {
    const res = await request(BASE_URL)
      .post('/api/auth/register')
      .send(testUser)
      .expect(200);
    
    if (res.body.success && res.body.token) {
      console.log('✅ PASS: User registered successfully');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Registration response invalid');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: User registration failed -', error.message);
    testsFailed++;
  }

  // Test 2: User Login
  console.log('\nTest 2: User Login');
  try {
    const res = await request(BASE_URL)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);
    
    if (res.body.success && res.body.token) {
      console.log('✅ PASS: User login successful');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Login response invalid');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: User login failed -', error.message);
    testsFailed++;
  }

  // Test 3: Invalid User Login
  console.log('\nTest 3: Invalid User Login (should fail)');
  try {
    const res = await request(BASE_URL)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword' })
      .expect(400);
    
    if (!res.body.success) {
      console.log('✅ PASS: Invalid login rejected correctly');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Invalid login should have been rejected');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Invalid login test error -', error.message);
    testsFailed++;
  }

  // Test 4: Duplicate Registration
  console.log('\nTest 4: Duplicate Registration (should fail)');
  try {
    const res = await request(BASE_URL)
      .post('/api/auth/register')
      .send(testUser)
      .expect(400);
    
    if (!res.body.success) {
      console.log('✅ PASS: Duplicate registration rejected correctly');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Duplicate registration should have been rejected');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Duplicate registration test error -', error.message);
    testsFailed++;
  }

  // Test 5: Admin Login Setup
  await createTestAdmin();
  
  // Test 6: Admin Login
  console.log('\nTest 5: Admin Login');
  try {
    const res = await request(BASE_URL)
      .post('/api/auth/admin/login')
      .send(testAdmin)
      .expect(200);
    
    if (res.body.success && res.body.token) {
      console.log('✅ PASS: Admin login successful');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Admin login response invalid');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Admin login failed -', error.message);
    testsFailed++;
  }

  // Test 7: Invalid Admin Login
  console.log('\nTest 6: Invalid Admin Login (should fail)');
  try {
    const res = await request(BASE_URL)
      .post('/api/auth/admin/login')
      .send({ username: testAdmin.username, password: 'WrongPassword' })
      .expect(400);
    
    if (!res.body.success) {
      console.log('✅ PASS: Invalid admin login rejected correctly');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Invalid admin login should have been rejected');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Invalid admin login test error -', error.message);
    testsFailed++;
  }

  // Cleanup
  await cleanupTestData();
  await mongoose.connection.close();

  // Results
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📈 Total: ${testsPassed + testsFailed}`);
  console.log('='.repeat(50) + '\n');

  process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
runTests();
