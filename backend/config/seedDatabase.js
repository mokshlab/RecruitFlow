// ============================================================================
// Database Seeding Script - Recruit Flow Platform
// ============================================================================
// This script populates the database with realistic sample data including:
// - 6 diverse user profiles (varying experience levels and tech stacks)
// - 10 professional job listings covering all major filters
// - Sample applications with realistic status progression
// - Bookmark data to demonstrate user engagement features
// 
// DEMO PASSWORDS: Sample users use 'User@1234', demo user uses 'Demo$456' (intended for public demo)
// ADMIN PASSWORDS: Superadmin (admin) set via DEFAULT_ADMIN_PASSWORD, normal admin (testadmin) uses 'Check#2026'
// 
// Usage: node backend/config/seedDatabase.js
// Note: This clears existing data except the default admin account
// ============================================================================

const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const User = require('../models/User');
const Job = require('../models/Job');
const Admin = require('../models/Admin');

// Sample users with complete data
const sampleUsers = [
  {
    name: 'Demo User',
    email: 'demo.user@example.com',
    password: 'Demo$456',
    phone: '+91-9506095060',
    gender: 'Male',
    experience: 7,
    description: 'Software Developer at ION Trading with 7+ years of experience building scalable web applications. Currently developing features using TypeScript, AngularJS and Java 8 for ION Treasury Anywhere. Previously worked on ARC Reporting Component with global team of 22 people, developed TypeScript and AngularJS features, and led migration from Silverlight to HTML5.',
    skills: ['TypeScript', 'AngularJS', 'Angular', 'Java 8', 'JavaScript', 'React', 'HTML5', 'CSS3', 'Bootstrap', 'LESS', 'Node.js', 'Express', 'MongoDB', 'SQL', 'AWS', 'Jenkins', 'Git', 'JIRA', 'Agile/Scrum', 'REST API', 'Unit Testing', 'Selenium', 'Robot Framework', 'Galen Framework', 'Data Structures', 'Algorithms', 'OOP', 'CI/CD']
  },
  {
    name: 'Dhanush Kumar',
    email: 'dhanush.kumar@gmail.com',
    password: 'User@1234',
    phone: '+91-9988776644',
    gender: 'Male',
    experience: 0,
    description: 'Recent B.Tech CSE graduate specializing in Artificial Intelligence and Machine Learning from Sri Ramachandra Faculty of Engineering. Team Lead at BigBasket Intern where enhanced team performance in on-time delivery and worked with diverse coworkers. Digital Marketing Freelancer conducting reviews and executing successful campaigns. React Developer Intern creating full-stack web applications with MongoDB, Node.js, Express.js and React. Strong foundation in front-end frameworks, digital marketing, SEO analysis, and client support.',
    skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'HTML', 'CSS', 'JavaScript', 'Front-end Frameworks', 'Digital Marketing', 'SEO Analysis', 'API Implementation', 'Mobile-friendly Design', 'Campaign Planning', 'Relationship Building', 'Proposal Management', 'Branding Strategy', 'Client Support', 'Excel', 'Email Marketing']
  },
  {
    name: 'Priya Krishnan',
    email: 'priya.krishnan@devmail.com',
    password: 'User@1234',
    phone: '+91-9823456711',
    gender: 'Female',
    experience: 4,
    description: 'Backend Developer with DevOps expertise. 4+ years building scalable microservices and managing cloud infrastructure on AWS. Experienced in Python, Node.js, and containerization technologies.',
    skills: ['Python', 'Django', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Terraform', 'REST API', 'Microservices', 'Redis', 'Linux']
  },
  {
    name: 'Sneha Iyer',
    email: 'sneha.iyer@designmail.com',
    password: 'User@1234',
    phone: '+91-9823456713',
    gender: 'Female',
    experience: 3,
    description: 'Mobile Developer specializing in React Native and iOS. 3+ years building cross-platform mobile applications with seamless UX. Published multiple apps on App Store and Play Store.',
    skills: ['React Native', 'JavaScript', 'TypeScript', 'iOS', 'Swift', 'Android', 'Redux', 'REST API', 'Firebase', 'Git', 'App Store', 'Play Store', 'Mobile UI/UX']
  },
  {
    name: 'Manav Nigam',
    email: 'manav.nigam@outlook.com',
    password: 'User@1234',
    phone: '+91-9356567878',
    gender: 'Male',
    experience: 0,
    description: 'Aspiring full-stack developer passionate about software development. Proficient in MERN stack, building robust REST APIs with Node.js and Express, integrating MongoDB for efficient data management, and creating responsive UIs using React, Bootstrap, and Tailwind CSS. Developed multiple full-stack projects including portfolio website, social networking platform (Collably), dynamic news app (Newsbird), AI-powered image processing tool (Sharpify), and travel review platform (Wanderlust). Strong foundation in algorithms and data structures with 250+ problems solved on LeetCode. HackerRank certified in Problem Solving and Node.js.',
    skills: ['C++', 'Python', 'Java', 'JavaScript', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Bootstrap', 'Tailwind CSS', 'HTML', 'CSS', 'Git', 'GitHub', 'REST API', 'JWT', 'Framer Motion', 'bcrypt', 'Multer', 'Cloudinary', 'Data Structures', 'Algorithms', 'OOP', 'Problem Solving', 'LeetCode']
  },
  {
    name: 'Ananya Deshmukh',
    email: 'ananya.deshmukh@mobilemail.com',
    password: 'User@1234',
    phone: '+91-9823456715',
    gender: 'Female',
    experience: 2,
    description: 'QA Automation Engineer with 2 years of experience building robust test automation frameworks. Skilled in Selenium, API testing, and CI/CD integration. ISTQB certified professional.',
    skills: ['Selenium', 'Java', 'TestNG', 'JUnit', 'API Testing', 'Postman', 'RestAssured', 'Jenkins', 'Git', 'Cucumber', 'JIRA', 'SQL', 'Python', 'ISTQB']
  }  
  
];

// Sample jobs with complete data - 10 strategic jobs covering all filters
const sampleJobs = [
  {
    title: 'Senior Full Stack Developer (MERN Stack)',
    companyName: 'Infosys Limited',
    location: 'Bengaluru, Karnataka',
    salary: 2000000,
    experienceRequired: 5,
    jobType: 'Full-time',
    description: 'Infosys is seeking an experienced Full Stack Developer to join our digital transformation team. You will work on large-scale applications serving millions of users globally. This role offers excellent growth opportunities and exposure to cutting-edge technologies in a collaborative environment.',
    requirements: [
      '5+ years of hands-on experience in MERN stack development',
      'Strong proficiency in React.js, Node.js, Express.js, and MongoDB',
      'Experience building and consuming RESTful APIs',
      'Knowledge of modern front-end build pipelines and tools',
      'Experience with cloud platforms (AWS/Azure) preferred',
      'Strong understanding of Agile/Scrum methodologies',
      'Excellent problem-solving and communication skills',
      'B.Tech/M.Tech in Computer Science or equivalent'
    ]
  },
  {
    title: 'Python Backend Developer',
    companyName: 'Tata Consultancy Services (TCS)',
    location: 'Hyderabad, Telangana',
    salary: 1400000,
    experienceRequired: 3,
    jobType: 'Full-time',
    description: 'TCS Digital is looking for talented Python developers to build scalable backend systems and microservices. Work with Fortune 500 clients on innovative projects while enjoying excellent work-life balance and continuous learning opportunities.',
    requirements: [
      '3+ years of Python development experience',
      'Strong expertise in Django or Flask framework',
      'Experience with PostgreSQL/MySQL databases',
      'Understanding of RESTful API design principles',
      'Knowledge of Docker and containerization',
      'Experience with version control (Git)',
      'Familiarity with CI/CD pipelines',
      'Good analytical and debugging skills'
    ]
  },
  {
    title: 'React Native Mobile Developer',
    companyName: 'Paytm (One97 Communications)',
    location: 'Noida, Uttar Pradesh',
    salary: 1800000,
    experienceRequired: 3,
    jobType: 'Full-time',
    description: 'Paytm is looking for talented React Native developers to build features for India\'s leading digital payments platform. Work on applications used by 350+ million users. Fast-paced fintech environment with excellent learning opportunities and competitive benefits.',
    requirements: [
      '3+ years of mobile app development experience',
      'Strong proficiency in React Native framework',
      'Experience with native iOS/Android development is a plus',
      'Knowledge of JavaScript/TypeScript and modern ES6+ features',
      'Experience integrating RESTful APIs and third-party libraries',
      'Published apps on Google Play Store and Apple App Store',
      'Understanding of mobile UI/UX best practices',
      'Experience with payment gateway integration preferred'
    ]
  },
  {
    title: 'QA Automation Engineer',
    companyName: 'HCL Technologies',
    location: 'Chennai, Tamil Nadu',
    salary: 1200000,
    experienceRequired: 3,
    jobType: 'Full-time',
    description: 'HCL is hiring QA Automation Engineers to ensure the quality and reliability of software products for global clients. Build automation frameworks, perform API testing, and work closely with development teams. ISTQB certification training provided.',
    requirements: [
      '3+ years of QA automation experience',
      'Strong knowledge of Selenium WebDriver and Java',
      'Experience with testing frameworks (TestNG, JUnit, Cucumber)',
      'Proficiency in API testing using Postman/RestAssured',
      'Knowledge of CI/CD integration for automated tests',
      'Experience with performance testing tools (JMeter) is a plus',
      'Strong analytical and problem-solving skills',
      'ISTQB certification preferred'
    ]
  },
  {
    title: 'DevOps Engineer',
    companyName: 'Amazon Development Centre India',
    location: 'Bengaluru, Karnataka',
    salary: 2500000,
    experienceRequired: 5,
    jobType: 'Full-time',
    description: 'Amazon India is seeking experienced DevOps Engineers to manage and scale cloud infrastructure supporting Amazon\'s operations in India. Work with cutting-edge AWS technologies, automate everything, and ensure 99.99% uptime for critical services. Competitive compensation with Amazon stock options.',
    requirements: [
      '5+ years of DevOps/Site Reliability Engineering experience',
      'Expert-level knowledge of AWS services and architecture',
      'Strong experience with Infrastructure as Code (Terraform/CloudFormation)',
      'Proficiency in scripting languages (Python, Bash, Shell)',
      'Hands-on experience with Kubernetes and container orchestration',
      'Experience implementing CI/CD pipelines (Jenkins, GitLab CI)',
      'Knowledge of monitoring tools (Prometheus, Grafana, CloudWatch)',
      'AWS certifications (Solutions Architect/DevOps Engineer) preferred'
    ]
  },
  {
    title: 'Software Development Engineer - Trainee',
    companyName: 'Accenture Solutions Pvt Ltd',
    location: 'Mumbai, Maharashtra',
    salary: 450000,
    experienceRequired: 0,
    jobType: 'Internship',
    description: 'Accenture invites fresh graduates to join our comprehensive training program. Gain hands-on experience in software development, work on real projects, and build your career with one of the world\'s leading consulting companies. Excellent conversion opportunities for high performers.',
    requirements: [
      'B.Tech/B.E. in Computer Science or related field (2025/2026 batch)',
      'Strong programming fundamentals in any language (C++/Java/Python)',
      'Good understanding of data structures and algorithms',
      'Knowledge of object-oriented programming concepts',
      'Excellent problem-solving and analytical skills',
      'Eagerness to learn new technologies',
      'Good communication skills in English',
      'Minimum 60% marks in 10th, 12th, and graduation'
    ]
  },
  {
    title: 'Junior Full Stack Developer (MEAN Stack)',
    companyName: 'Cognizant Technology Solutions',
    location: 'Pune, Maharashtra',
    salary: 650000,
    experienceRequired: 1,
    jobType: 'Full-time',
    description: 'Cognizant is looking for energetic Junior Full Stack Developers to join our growing engineering team. Work on client projects using Angular, Node.js, Express, and MongoDB. Perfect opportunity for developers with 1-2 years of experience to advance their careers with mentorship from senior engineers.',
    requirements: [
      '1-2 years of hands-on web development experience',
      'Working knowledge of Angular, Node.js, Express.js, and MongoDB',
      'Understanding of RESTful API design and implementation',
      'Familiarity with Git version control',
      'Basic knowledge of HTML5, CSS3, and JavaScript ES6+',
      'Good problem-solving and debugging skills',
      'Ability to work in Agile teams',
      'B.E/B.Tech in Computer Science or equivalent'
    ]
  },
  {
    title: 'Cloud Solutions Architect',
    companyName: 'Deloitte USI',
    location: 'Hyderabad, Telangana',
    salary: 3500000,
    experienceRequired: 8,
    jobType: 'Full-time',
    description: 'Deloitte USI is seeking experienced Cloud Solutions Architects to design and implement cloud strategies for Fortune 500 clients. Lead cloud migration projects, architect multi-cloud solutions, and mentor technical teams. Work on high-impact consulting engagements with international exposure.',
    requirements: [
      '8+ years of experience in software architecture and cloud technologies',
      'Expert-level knowledge of AWS, Azure, or Google Cloud Platform',
      'Strong experience with cloud-native architecture patterns',
      'Hands-on experience with IaC tools (Terraform, CloudFormation)',
      'Deep understanding of networking, security, and compliance in cloud',
      'Experience leading technical teams and client presentations',
      'Certifications: AWS Solutions Architect or Azure Architect Expert',
      'Excellent stakeholder management and communication skills'
    ]
  },
  {
    title: 'Full Stack Developer (Remote)',
    companyName: 'Razorpay Software Pvt Ltd',
    location: 'Remote',
    salary: 1700000,
    experienceRequired: 4,
    jobType: 'Full-time',
    description: 'Razorpay is India\'s leading fintech unicorn revolutionizing digital payments. We\'re looking for talented Full Stack Developers to build features for our payment gateway and merchant dashboard. Work remotely from anywhere in India while contributing to products serving 8M+ businesses.',
    requirements: [
      '4+ years of full stack development experience',
      'Strong expertise in React.js and Node.js',
      'Experience with payment systems or fintech is a plus',
      'Proficiency in MongoDB/PostgreSQL',
      'Understanding of secure coding practices and PCI compliance',
      'Experience with AWS services (EC2, S3, Lambda)',
      'Strong debugging and problem-solving skills',
      'Self-motivated with excellent remote communication skills'
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await Admin.deleteMany({ isDefault: { $ne: true } }); // Keep default superadmin
    console.log('✅ Existing data cleared\n');

    // Create default superadmin if not exists
    console.log('👨‍💼 Creating default superadmin...');
    const existingSuperAdmin = await Admin.findOne({ isDefault: true });
    let adminId;
    
    if (!existingSuperAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, salt);
      const defaultAdmin = new Admin({
        username: process.env.DEFAULT_ADMIN_USERNAME,
        password: hashedPassword,
        isDefault: true,
      });
      const savedAdmin = await defaultAdmin.save();
      adminId = savedAdmin._id;
      console.log(`✅ Default superadmin created: ${process.env.DEFAULT_ADMIN_USERNAME}\n`);
    } else {
      adminId = existingSuperAdmin._id;
      console.log(`✅ Default superadmin already exists: ${existingSuperAdmin.username}\n`);
    }

    // Create testadmin (normal admin without superadmin privileges)
    console.log('👨‍💼 Creating test admin...');
    const existingTestAdmin = await Admin.findOne({ username: 'testadmin' });
    
    if (!existingTestAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Check#2026', salt);
      await Admin.create({
        username: 'testadmin',
        password: hashedPassword,
        isDefault: false,  // Not a superadmin
      });
      console.log('✅ Test admin created: testadmin\n');
    } else {
      console.log('✅ Test admin already exists: testadmin\n');
    }

    // Create users
    console.log('👥 Creating sample users...');
    const salt = await bcrypt.genSalt(10);
    const usersToInsert = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, salt)
      }))
    );
    const createdUsers = await User.insertMany(usersToInsert);
    console.log(`✅ Created ${createdUsers.length} users\n`);

    // Create jobs
    console.log('💼 Creating sample jobs...');
    const jobsToInsert = sampleJobs.map(job => ({
      ...job,
      postedBy: adminId
    }));
    const createdJobs = await Job.insertMany(jobsToInsert);
    console.log(`✅ Created ${createdJobs.length} jobs\n`);

    // Apply some users to some jobs
    console.log('📝 Creating sample applications...');
    let applicationCount = 0;
    
    const now = new Date();
    const daysAgo = (days) => new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    // Demo User (User 0) - Primary test user with 7 YOE, senior developer
    // Job 0: Senior Full Stack - Infosys (Under Review 3 days ago)
    await Job.findByIdAndUpdate(createdJobs[0]._id, {
      $push: { applicants: { userId: createdUsers[0]._id, status: 'Under Review', appliedAt: daysAgo(3) } }
    });
    await User.findByIdAndUpdate(createdUsers[0]._id, {
      $push: { appliedJobs: { jobId: createdJobs[0]._id, status: 'Under Review', appliedAt: daysAgo(3) } }
    });
    applicationCount++;

    // Job 7: Cloud Architect - Deloitte (Pending 1 day ago)
    await Job.findByIdAndUpdate(createdJobs[7]._id, {
      $push: { applicants: { userId: createdUsers[0]._id, status: 'Pending', appliedAt: daysAgo(1) } }
    });
    await User.findByIdAndUpdate(createdUsers[0]._id, {
      $push: { appliedJobs: { jobId: createdJobs[7]._id, status: 'Pending', appliedAt: daysAgo(1) } }
    });
    applicationCount++;

    // Manav (User 4) - Fresher applies to entry-level jobs
    // Job 5: Internship - Accenture (Rejected 5 days ago)
    await Job.findByIdAndUpdate(createdJobs[5]._id, {
      $push: { applicants: { userId: createdUsers[4]._id, status: 'Rejected', appliedAt: daysAgo(5) } }
    });
    await User.findByIdAndUpdate(createdUsers[4]._id, {
      $push: { appliedJobs: { jobId: createdJobs[5]._id, status: 'Rejected', appliedAt: daysAgo(5) } }
    });
    applicationCount++;

    // Job 6: Junior Full Stack - Cognizant (Shortlisted 2 days ago)
    await Job.findByIdAndUpdate(createdJobs[6]._id, {
      $push: { applicants: { userId: createdUsers[4]._id, status: 'Shortlisted', appliedAt: daysAgo(2) } }
    });
    await User.findByIdAndUpdate(createdUsers[4]._id, {
      $push: { appliedJobs: { jobId: createdJobs[6]._id, status: 'Shortlisted', appliedAt: daysAgo(2) } }
    });
    applicationCount++;

    // Priya (User 2) - Backend/DevOps 4 YOE
    // Job 4: DevOps - Amazon (Shortlisted 4 days ago)
    await Job.findByIdAndUpdate(createdJobs[4]._id, {
      $push: { applicants: { userId: createdUsers[2]._id, status: 'Shortlisted', appliedAt: daysAgo(4) } }
    });
    await User.findByIdAndUpdate(createdUsers[2]._id, {
      $push: { appliedJobs: { jobId: createdJobs[4]._id, status: 'Shortlisted', appliedAt: daysAgo(4) } }
    });
    applicationCount++;

    console.log(`✅ Created ${applicationCount} sample applications\n`);

    // Add bookmarks for realistic user experience
    console.log('🔖 Creating sample bookmarks...');
    let bookmarkCount = 0;

    // Demo User (User 0) - Primary test user bookmarks senior roles
    await User.findByIdAndUpdate(createdUsers[0]._id, {
      $push: { bookmarkedJobs: { $each: [createdJobs[7]._id, createdJobs[8]._id] } }
    });
    bookmarkCount += 2;

    // Dhanush (User 1) - Fresher bookmarks entry-level opportunities
    await User.findByIdAndUpdate(createdUsers[1]._id, {
      $push: { bookmarkedJobs: { $each: [createdJobs[5]._id, createdJobs[6]._id] } }
    });
    bookmarkCount += 2;

    // Priya (User 2) - Backend/DevOps specialist bookmarks relevant roles
    await User.findByIdAndUpdate(createdUsers[2]._id, {
      $push: { bookmarkedJobs: { $each: [createdJobs[1]._id, createdJobs[4]._id] } }
    });
    bookmarkCount += 2;

    // Manav (User 4) - Fresher exploring diverse opportunities
    await User.findByIdAndUpdate(createdUsers[4]._id, {
      $push: { bookmarkedJobs: { $each: [createdJobs[0]._id, createdJobs[2]._id] } }
    });
    bookmarkCount += 2;

    console.log(`✅ Created ${bookmarkCount} sample bookmarks\n`);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Jobs: ${createdJobs.length}`);
    console.log(`   Applications: ${applicationCount}`);
    console.log(`   Bookmarks: ${bookmarkCount}`);
    console.log(`   Admin: ${process.env.DEFAULT_ADMIN_USERNAME}`);
    console.log('\nTest Credentials:');
    console.log(`   User: demo.user@example.com / Demo$456`);
    console.log(`   Superadmin: ${process.env.DEFAULT_ADMIN_USERNAME} / ${process.env.DEFAULT_ADMIN_PASSWORD}`);
    console.log(`   Admin: testadmin / Check#2026\n`);

    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
