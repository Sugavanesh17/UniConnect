const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const TrustLog = require('../models/TrustLog');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      user: user.publicProfile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  protect,
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('university').optional().trim().notEmpty().withMessage('University is required'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('github').optional().isURL().withMessage('Please enter a valid GitHub URL'),
  body('linkedin').optional().isURL().withMessage('Please enter a valid LinkedIn URL')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { name, bio, university, skills, github, linkedin } = req.body;
    
    const updateFields = {};
    if (name) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (university) updateFields.university = university;
    if (skills) updateFields.skills = skills;
    if (github !== undefined) updateFields.github = github;
    if (linkedin !== undefined) updateFields.linkedin = linkedin;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.publicProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (public profile)
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: user.publicProfile
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users by skills or university
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { skills, university, limit = 10 } = req.query;
    
    const query = { isActive: true };
    
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      query.skills = { $in: skillsArray };
    }
    
    if (university) {
      query.university = { $regex: university, $options: 'i' };
    }

    const users = await User.find(query)
      .select('name university skills trustScore isEmailVerified')
      .limit(parseInt(limit))
      .sort({ trustScore: -1 });

    res.json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/users/trust-history
// @desc    Get user's trust score history
// @access  Private
router.get('/trust-history', protect, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const trustHistory = await TrustLog.getUserTrustHistory(req.user._id, parseInt(limit));
    
    res.json({
      success: true,
      trustHistory
    });
  } catch (error) {
    console.error('Get trust history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/users/trust-stats
// @desc    Get user's trust statistics
// @access  Private
router.get('/trust-stats', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const trustStats = await TrustLog.getTrustStats(req.user._id, parseInt(days));
    
    res.json({
      success: true,
      trustStats
    });
  } catch (error) {
    console.error('Get trust stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router; 