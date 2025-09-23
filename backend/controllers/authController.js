// /backend/controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        let user;
        if (email) {
            user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ msg: 'User with that email already exists' });
            }
        } else if (name) {
            user = await User.findOne({ name });
            if (user) {
                return res.status(400).json({ msg: 'User with that username already exists' });
            }
        } else {
            return res.status(400).json({ msg: 'Name or email is required' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'student'
        });

        await user.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.login = async (req, res) => {
    const { email, name, password } = req.body;
    
    // Debug logging
    console.log('🔍 Login attempt details:', { email, name, password });
    
    try {
        let user;

        if (email) {
            user = await User.findOne({ email });
            console.log('🔍 Email search result:', user ? `Found user: ${user.name}` : 'No user found');
        } else if (name) {
            user = await User.findOne({ name });
            console.log('🔍 Name search result:', user ? `Found user: ${user.name}, role: ${user.role}, classId: ${user.classId}` : 'No user found');
        } else {
            return res.status(400).json({ msg: 'Please provide email or username' });
        }
        
        if (!user) {
            console.log('❌ User not found in database');
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        console.log('🔍 Password comparison starting...');
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('🔍 Password match result:', isMatch);
        
        if (!isMatch) {
            console.log('❌ Password does not match');
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        console.log('✅ Login successful for user:', user.name);

        const payload = {
            user: {
                id: user.id,
                role: user.role,
                name: user.name,
                email: user.email,
                school: user.school,
                classId: user.classId // Make sure this is included
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) {
                    console.log('❌ JWT signing error:', err);
                    throw err;
                }
                console.log('✅ JWT token created successfully');
                res.json({ token, user: payload.user });
            }
        );
    } catch (err) {
        console.error('❌ Login error:', err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET /api/auth/me
// @desc    Get logged in user info
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};