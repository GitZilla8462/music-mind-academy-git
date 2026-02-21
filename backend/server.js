const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import Models
const User = require('./models/User');
const School = require('./models/School');
const Class = require('./models/Class');
const Lesson = require('./models/Lesson');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const submissionRoutes = require('./routes/submissions');
const assignmentRoutes = require('./routes/assignmentRoutes');
const loopsRoutes = require('./routes/loopsRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const musicresourcesRoutes = require('./routes/musicresourcesRoutes'); // 🆕 NEW IMPORT
const roomRoutes = require('./routes/roomRoutes'); // Beat Escape Room sharing
const melodyRoomRoutes = require('./routes/melodyRoomRoutes'); // Melody Mystery sharing
const errorLogRoutes = require('./routes/errorLogRoutes'); // First-party error logging

// Create the Express application
const app = express();

// Middleware to parse JSON bodies and enable CORS
app.use(express.json());
app.use(cors());

// Add request logging middleware to debug connectivity
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.headers.authorization) {
    console.log('Auth header present');
  }
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

// Define the MongoDB connection URL
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher_app';

// Connect to MongoDB with connection pooling
mongoose.connect(dbUrl, {
    maxPoolSize: 50,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Use the imported routes - API ROUTES FIRST
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/loops', loopsRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/musicresources', musicresourcesRoutes); // 🆕 NEW ROUTE
app.use('/api/rooms', roomRoutes); // Beat Escape Room sharing
app.use('/api/melody-rooms', melodyRoomRoutes); // Melody Mystery sharing
app.use('/api/errors', errorLogRoutes); // First-party error logging (bypasses school firewalls)

// A simple test route to check if the server is working
app.get('/', (req, res) => {
  res.json({
      message: 'Music Education Platform API is running!',
      version: '1.0.0',
      endpoints: {
          auth: '/api/auth/login',
          admin: {
              stats: '/api/admin/stats',
              teachers: '/api/admin/teachers',
              students: '/api/admin/students',
              schools: '/api/admin/schools'
          },
          loops: '/api/loops',
          lessons: '/api/lessons',
          musicresources: '/api/musicresources/assignments'
      }
  });
});

// ================================
// SERVE AUDIO FILES FROM BACKEND WITH CACHING
// ================================
// 🚀 BANDWIDTH OPTIMIZATION: Aggressive caching for audio/video files
// This reduces bandwidth usage by 80%+ by allowing browsers to cache files
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '7d',  // Default cache for 7 days
  setHeaders: (res, filepath) => {
    // Audio files get long-term caching (7 days)
    if (filepath.endsWith('.mp3') || filepath.endsWith('.wav') || filepath.endsWith('.ogg') || filepath.endsWith('.m4a')) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');  // 7 days, immutable
      console.log(`📦 Serving audio file with 7-day cache: ${path.basename(filepath)}`);
    }
    // Video files also get long-term caching (7 days)
    else if (filepath.endsWith('.mp4') || filepath.endsWith('.webm')) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');  // 7 days, immutable
      console.log(`📹 Serving video file with 7-day cache: ${path.basename(filepath)}`);
    }
    // Other static files get shorter cache (1 hour)
    else {
      res.setHeader('Cache-Control', 'public, max-age=3600');  // 1 hour
    }
  }
}));

// ================================
// ADD THESE LINES FOR REACT SPA ROUTING
// ================================

// Serve static files from React build folder (only used if frontend deployed with backend)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Handle React routing - catch all non-API requests and serve React app
app.get('*', (req, res, next) => {
  // Don't interfere with API routes
  if (req.path.startsWith('/api/')) {
    return next(); // Let the 404 handler below handle API routes
  }
  
  // For all other routes, serve the React app
  console.log(`Serving React app for route: ${req.path}`);
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// ================================
// END OF REACT SPA ROUTING ADDITIONS
// ================================

// Initialize default admin user
const initializeAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('AdminPassword123!', 12);
      const admin = new User({
        name: 'System Administrator',
        email: 'admin@musiceducation.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
      await admin.save();
      console.log('✅ Default admin user created successfully');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

// Added a check for an existing class to prevent re-initialization on every server restart
const initializeSampleData = async () => {
  try {
    const classCount = await Class.countDocuments();
    if (classCount > 0) {
        console.log('✅ Classes already exist, skipping sample data initialization.');
        return;
    }

    const schoolCount = await School.countDocuments();
    if (schoolCount === 0) {
      const sampleSchools = [
        { name: 'Lincoln Elementary School', address: '123 Main Street, Springfield, IL 62701', phone: '(555) 100-2000', email: 'admin@lincoln.edu', principal: 'Dr. Jane Anderson', type: 'Elementary' },
        { name: 'Roosevelt High School', address: '456 Oak Avenue, Springfield, IL 62702', phone: '(555) 200-3000', email: 'office@roosevelt.edu', principal: 'Mr. Robert Wilson', type: 'High School' }
      ];
      await School.insertMany(sampleSchools);
      console.log('✅ Sample schools created');
    }
    const bcrypt = require('bcryptjs');
    const { v4: uuidv4 } = require('uuid');
    const generateClassCode = () => uuidv4();
    const hashedPassword = await bcrypt.hash('teacher123', 12);
    const teacher1 = await User.create({ name: 'Sarah Johnson', email: 'sarah.johnson@school.edu', password: hashedPassword, phone: '(555) 123-4567', school: 'Lincoln Elementary School', subjects: ['Music Theory', 'Vocal Training'], role: 'teacher', studentsCount: 0 });
    const teacher2 = await User.create({ name: 'Michael Chen', email: 'michael.chen@school.edu', password: hashedPassword, phone: '(555) 234-5678', school: 'Roosevelt High School', subjects: ['Piano', 'Composition'], role: 'teacher', studentsCount: 0 });
    const studentHashedPassword = await bcrypt.hash('student123', 12);
    const student1 = await User.create({ name: 'Alice Johnson', email: 'alice.johnson@email.com', password: studentHashedPassword, phone: '(555) 111-2222', school: 'Lincoln Elementary School', teacher: teacher1._id, role: 'student', grade: 'A-', progress: 85 });
    const student2 = await User.create({ name: 'Bob Smith', email: 'bob.smith@email.com', password: studentHashedPassword, phone: '(555) 222-3333', school: 'Roosevelt High School', teacher: teacher2._id, role: 'student', grade: 'B+', progress: 72 });
    const class1 = await Class.create({ className: 'Music Theory 101', teacher: teacher1._id, teacherName: teacher1.name, students: [student1._id], classCode: generateClassCode() });
    student1.class = class1._id;
    await student1.save();
    const class2 = await Class.create({ className: 'Piano Fundamentals', teacher: teacher2._id, teacherName: teacher2.name, students: [student2._id], classCode: generateClassCode() });
    student2.class = class2._id;
    await student2.save();
    await User.findByIdAndUpdate(teacher1._id, { $inc: { studentsCount: 1 } });
    await User.findByIdAndUpdate(teacher2._id, { $inc: { studentsCount: 1 } });
    await School.findOneAndUpdate({ name: 'Lincoln Elementary School' }, { $inc: { teacherCount: 1, studentCount: 1 } });
    await School.findOneAndUpdate({ name: 'Roosevelt High School' }, { $inc: { teacherCount: 1, studentCount: 1 } });
    console.log('✅ Sample data initialization complete');
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
};

// Initialize sample lessons
const initializeLessons = async () => {
  try {
    const lessonCount = await Lesson.countDocuments();
    if (lessonCount > 0) {
      console.log('✅ Lessons already exist, skipping lesson initialization.');
      return;
    }

    // Import and run the lesson seeder
    const { seedLessons } = require('./data/seedLessons');
    await seedLessons();
    console.log('✅ Sample lessons initialized');
  } catch (error) {
    console.error('❌ Error initializing lessons:', error);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal server error', message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong' });
});

// 404 handler - now only for API routes
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found', path: req.originalUrl, method: req.method });
});

// Start the server - FIXED FOR RAILWAY DEPLOYMENT
const PORT = process.env.PORT || 5000;
mongoose.connection.once('open', async () => {
  console.log('🚀 MongoDB connected successfully');
  await initializeAdmin();
  await initializeSampleData();
  await initializeLessons();
  
  // CRITICAL: Bind to 0.0.0.0 for Railway deployment accessibility
  app.listen(PORT, '0.0.0.0', () => {
    console.log('=================================');
    console.log(`🌟 Server running on port ${PORT}`);
    console.log('=================================');
    console.log('🔐 Default Credentials:');
    console.log('   Admin Email: admin@musiceducation.com');
    console.log('   Admin Password: AdminPassword123!');
    console.log('   ');
    console.log('   Teacher Email: sarah.johnson@school.edu');
    console.log('   Teacher Password: teacher123');
    console.log('   ');
    console.log('   Student Email: alice.johnson@email.com');
    console.log('   Student Password: student123');
    console.log('=================================');
    console.log('📚 API Endpoints:');
    console.log('   Lessons: http://localhost:' + PORT + '/api/lessons');
    console.log('   Film Music: http://localhost:' + PORT + '/api/lessons/category/film-music');
    console.log('   Music Resources: http://localhost:' + PORT + '/api/musicresources/assignments');
    console.log('=================================');
    console.log('💾 BANDWIDTH OPTIMIZATION ENABLED:');
    console.log('   Audio files cached for 7 days');
    console.log('   Expected bandwidth savings: 80%+');
    console.log('=================================');
  });
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});