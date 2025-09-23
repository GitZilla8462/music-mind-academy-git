const express = require('express');
const router = express.Router();
const User = require('../models/User');
const School = require('../models/School');
const bcrypt = require('bcryptjs');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get dashboard stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalSchools = await School.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active', role: { $in: ['teacher', 'student'] } });
    res.json({ totalTeachers, totalStudents, totalSchools, activeAssignments: 0, activeUsers });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Teacher Management
router.get('/teachers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password').sort({ createdAt: -1 });
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/teachers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, school, subjects, password } = req.body;
    if (!name || !email || !password || !school) return res.status(400).json({ error: 'Name, email, password, and school are required' });
    if (await User.findOne({ email })) return res.status(400).json({ error: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password, 12);
    const teacher = await User.create({ name, email, phone, school, subjects: subjects || [], password: hashedPassword, role: 'teacher', status: 'active' });
    await School.findOneAndUpdate({ name: school }, { $inc: { teacherCount: 1 } });
    res.status(201).json({ message: 'Teacher created successfully', teacher: { id: teacher._id, name: teacher.name, email: teacher.email, school: teacher.school, subjects: teacher.subjects, status: teacher.status, studentsCount: teacher.studentsCount, joinDate: teacher.joinDate } });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/teachers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).select('-password');
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json({ message: 'Teacher updated successfully', teacher });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/teachers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const teacher = await User.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    await School.findOneAndUpdate({ name: teacher.school }, { $inc: { teacherCount: -1 } });
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Student Management
router.get('/students', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/students', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, school, class: studentClass, teacher, password } = req.body;
    if (!name || !email || !password || !school) return res.status(400).json({ error: 'Name, email, password, and school are required' });
    if (await User.findOne({ email })) return res.status(400).json({ error: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password, 12);
    const student = await User.create({ name, email, phone, school, class: studentClass, teacher, password: hashedPassword, role: 'student', status: 'active' });
    await School.findOneAndUpdate({ name: school }, { $inc: { studentCount: 1 } });
    res.status(201).json({ message: 'Student created successfully', student: { id: student._id, name: student.name, email: student.email, school: student.school, class: student.class, teacher: student.teacher, status: student.status, grade: student.grade, progress: student.progress, joinDate: student.joinDate } });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/students/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const student = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student updated successfully', student });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/students/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const student = await User.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    await School.findOneAndUpdate({ name: student.school }, { $inc: { studentCount: -1 } });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// School Management
router.get('/schools', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const schools = await School.find().sort({ createdAt: -1 });
    res.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/schools', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, address, phone, email, principal, type } = req.body;
    if (!name || !address || !phone || !email || !principal || !type) return res.status(400).json({ error: 'All fields are required' });
    const school = await School.create({ name, address, phone, email, principal, type, status: 'active' });
    res.status(201).json({ message: 'School created successfully', school });
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/schools/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const school = await School.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!school) return res.status(404).json({ error: 'School not found' });
    res.json({ message: 'School updated successfully', school });
  } catch (error) {
    console.error('Error updating school:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/schools/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const school = await School.findByIdAndDelete(req.params.id);
    if (!school) return res.status(404).json({ error: 'School not found' });
    res.json({ message: 'School deleted successfully' });
  } catch (error) {
    console.error('Error deleting school:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;