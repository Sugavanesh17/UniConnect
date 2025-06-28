const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, canViewProject, canEditProject, projectOwner, hasSignedNDA } = require('../middleware/auth');
const Project = require('../models/Project');
const TrustLog = require('../models/TrustLog');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects (filtered by privacy and user access)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      search, 
      privacy, 
      status, 
      techStack, 
      university, 
      page = 1, 
      limit = 20,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Privacy filter
    if (privacy && privacy !== 'all') {
      if (privacy === 'public') {
        filter.privacy = 'public';
      } else if (privacy === 'private') {
        // Only show private projects if user is owner or member
        filter.$or = [
          { privacy: 'private', owner: req.user._id },
          { privacy: 'private', 'members.user': req.user._id }
        ];
      } else if (privacy === 'protected') {
        filter.privacy = 'protected';
      }
    } else {
      // Show public, protected, and user's private projects
      filter.$or = [
        { privacy: 'public' },
        { privacy: 'protected' },
        { privacy: 'private', owner: req.user._id },
        { privacy: 'private', 'members.user': req.user._id }
      ];
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (techStack) {
      const techArray = techStack.split(',').map(tech => tech.trim());
      filter.techStack = { $in: techArray };
    }

    if (university) {
      filter.university = { $regex: university, $options: 'i' };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    // Get projects with pagination
    const projects = await Project.find(filter)
      .populate('owner', 'name university trustScore')
      .populate('members.user', 'name university trustScore')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Project.countDocuments(filter);

    res.json({
      projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProjects: total,
        hasNextPage: skip + projects.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects/my-projects
// @desc    Get user's projects (owned and member of)
// @access  Private
router.get('/my-projects', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('owner', 'name university trustScore')
    .populate('members.user', 'name university trustScore')
    .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', [
  protect,
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('techStack').isArray().withMessage('Tech stack must be an array'),
  body('privacy').isIn(['public', 'private', 'draft']).withMessage('Invalid privacy setting'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    console.log('Received project creation request:', req.body); // Debug log
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array()); // Debug log
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { title, description, techStack, privacy, tags } = req.body;

    const project = await Project.create({
      title,
      description,
      techStack,
      privacy,
      tags: tags || [],
      owner: req.user._id
    });

    // Log trust activity for project creation
    await TrustLog.logActivity(
      req.user._id,
      'project_created',
      10,
      `Created project: ${title}`,
      { projectId: project._id }
    );

    await project.populate('owner', 'name university trustScore');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Dashboard route - get user stats and recent data
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's projects
    const userProjects = await Project.find({
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    }).populate('owner', 'name university trustScore');

    // Get user's owned projects
    const ownedProjects = await Project.find({ owner: userId });
    
    // Get user's joined projects
    const joinedProjects = await Project.find({
      'members.user': userId,
      owner: { $ne: userId }
    });

    // Calculate stats
    const stats = {
      totalProjects: userProjects.length,
      activeProjects: userProjects.filter(p => p.status === 'active').length,
      totalCollaborators: userProjects.reduce((acc, project) => {
        return acc + (project.members?.length || 0);
      }, 0),
      trustScore: req.user.trustScore || 50
    };

    // Get recent projects (last 5)
    const recentProjects = userProjects
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Get recent activities (mock data for now)
    const recentActivities = [
      {
        description: 'You joined a new project',
        timestamp: new Date(),
        type: 'project_joined'
      },
      {
        description: 'Your trust score increased',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        type: 'trust_increased'
      }
    ];

    res.json({
      stats,
      recentProjects,
      recentActivities
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects/:projectId
// @desc    Get project by ID
// @access  Private
router.get('/:projectId', protect, canViewProject, hasSignedNDA, async (req, res) => {
  try {
    // Increment view count
    await req.project.incrementView();

    // Log trust activity for project view
    await TrustLog.logActivity(
      req.user._id,
      'project_viewed',
      1,
      `Viewed project: ${req.project.title}`,
      { projectId: req.project._id }
    );

    await req.project.populate('owner', 'name university trustScore');
    await req.project.populate('members.user', 'name university trustScore');
    await req.project.populate('joinRequests.user', 'name university trustScore');

    res.json({
      success: true,
      project: req.project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/projects/:projectId
// @desc    Update project
// @access  Private (Owner/Contributor)
router.put('/:projectId', [
  protect,
  canEditProject,
  body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').optional().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('techStack').optional().isArray().withMessage('Tech stack must be an array'),
  body('privacy').optional().isIn(['public', 'private', 'draft']).withMessage('Invalid privacy setting'),
  body('status').optional().isIn(['active', 'completed', 'on-hold', 'cancelled']).withMessage('Invalid status'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
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

    const { title, description, techStack, privacy, status, tags } = req.body;
    
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (techStack) updateFields.techStack = techStack;
    if (privacy) updateFields.privacy = privacy;
    if (status) updateFields.status = status;
    if (tags) updateFields.tags = tags;

    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      updateFields,
      { new: true, runValidators: true }
    ).populate('owner', 'name university trustScore')
     .populate('members.user', 'name university trustScore');

    res.json({
      success: true,
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   DELETE /api/projects/:projectId
// @desc    Delete project (soft delete)
// @access  Private (Owner only)
router.delete('/:projectId', protect, projectOwner, async (req, res) => {
  try {
    await Project.findByIdAndUpdate(req.params.projectId, {
      isDeleted: true,
      status: 'cancelled'
    });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/projects/:projectId/join-request
// @desc    Request to join a project
// @access  Private
router.post('/:projectId/join-request', [
  protect,
  body('message').optional().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters')
], async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    if (project.privacy !== 'private') {
      return res.status(400).json({ 
        success: false, 
        message: 'Join requests are only allowed for private projects' 
      });
    }

    if (project.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Project owner cannot request to join their own project' 
      });
    }

    if (project.isMember(req.user._id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already a member of this project' 
      });
    }

    // Check if user already has a pending request
    const existingRequest = project.joinRequests.find(
      request => request.user.toString() === req.user._id.toString() && request.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have a pending join request for this project' 
      });
    }

    project.joinRequests.push({
      user: req.user._id,
      message: req.body.message || '',
      status: 'pending'
    });

    await project.save();

    res.json({
      success: true,
      message: 'Join request sent successfully'
    });
  } catch (error) {
    console.error('Join request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/projects/:projectId/join-request/:requestId
// @desc    Respond to join request (approve/reject)
// @access  Private (Owner only)
router.put('/:projectId/join-request/:requestId', [
  protect,
  projectOwner,
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected')
], async (req, res) => {
  try {
    const { status } = req.body;
    
    const project = await Project.findById(req.params.projectId);
    const request = project.joinRequests.id(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Join request not found' 
      });
    }

    request.status = status;
    request.respondedAt = new Date();
    request.respondedBy = req.user._id;

    if (status === 'approved') {
      await project.addMember(request.user, 'viewer');
      
      // Log trust activity for joining project
      await TrustLog.logActivity(
        request.user,
        'project_joined',
        5,
        `Joined project: ${project.title}`,
        { projectId: project._id }
      );
    }

    await project.save();

    res.json({
      success: true,
      message: `Join request ${status} successfully`
    });
  } catch (error) {
    console.error('Respond to join request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/projects/:projectId/tasks
// @desc    Create a new task in project
// @access  Private (Owner/Contributor)
router.post('/:projectId/tasks', [
  protect,
  canEditProject,
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid user ID'),
  body('dueDate').optional().isISO8601().toDate().withMessage('Invalid date format'),
  body('status').optional().isIn(['todo', 'in-progress', 'completed']).withMessage('Invalid status')
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

    const { title, description, assignedTo, dueDate, status = 'todo' } = req.body;
    const project = req.project;

    const newTask = {
      title,
      description: description || '',
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      status,
      createdBy: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    project.tasks.push(newTask);
    await project.save();

    // Populate the assignedTo field if it exists
    if (assignedTo) {
      const lastTask = project.tasks[project.tasks.length - 1];
      await project.populate('tasks.assignedTo', 'name email');
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: project.tasks[project.tasks.length - 1]
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/projects/:projectId/tasks/:taskId
// @desc    Update a task in project
// @access  Private (Owner/Contributor)
router.put('/:projectId/tasks/:taskId', [
  protect,
  canEditProject,
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid user ID'),
  body('dueDate').optional().isISO8601().toDate().withMessage('Invalid date format'),
  body('status').optional().isIn(['todo', 'in-progress', 'completed']).withMessage('Invalid status')
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

    const { title, description, assignedTo, dueDate, status } = req.body;
    const project = req.project;
    const taskId = req.params.taskId;

    const task = project.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    // Update task fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (status !== undefined) task.status = status;
    
    task.updatedAt = new Date();

    await project.save();

    // Populate the assignedTo field if it exists
    if (task.assignedTo) {
      await project.populate('tasks.assignedTo', 'name email');
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      task: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   DELETE /api/projects/:projectId/tasks/:taskId
// @desc    Delete a task from project
// @access  Private (Owner/Contributor)
router.delete('/:projectId/tasks/:taskId', protect, canEditProject, async (req, res) => {
  try {
    const project = req.project;
    const taskId = req.params.taskId;

    const task = project.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    // Check if user can delete the task (owner or task creator)
    if (project.owner.toString() !== req.user._id.toString() && 
        task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this task' 
      });
    }

    task.remove();
    await project.save();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/projects/:projectId/sign-nda
// @desc    Sign NDA for private project
// @access  Private
router.post('/:projectId/sign-nda', protect, canViewProject, async (req, res) => {
  try {
    const project = req.project;
    
    if (project.privacy !== 'private') {
      return res.status(400).json({ 
        success: false, 
        message: 'NDA is only required for private projects' 
      });
    }

    const member = project.members.find(m => 
      m.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(400).json({ 
        success: false, 
        message: 'You must be a member to sign the NDA' 
      });
    }

    member.hasSignedNDA = true;
    await project.save();

    res.json({
      success: true,
      message: 'NDA signed successfully'
    });
  } catch (error) {
    console.error('Sign NDA error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router; 