const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, canEditProject, canViewProject } = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

const router = express.Router({ mergeParams: true });

// Create a new task in a project
router.post('/:projectId/tasks', [
  protect,
  canEditProject,
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid user ID'),
  body('dueDate').optional().isISO8601().toDate(),
  body('status').optional().isIn(['todo', 'in-progress', 'done'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, assignedTo, dueDate, status } = req.body;
    const projectId = req.params.projectId;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const task = await Task.create({
      project: projectId,
      title,
      assignedTo,
      dueDate,
      status
    });
    res.status(201).json({ success: true, task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all tasks for a project
router.get('/:projectId/tasks', protect, canViewProject, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: 1 });
    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
router.put('/:projectId/tasks/:taskId', [
  protect,
  canEditProject,
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('assignedTo').optional().isMongoId(),
  body('dueDate').optional().isISO8601().toDate(),
  body('status').optional().isIn(['todo', 'in-progress', 'done'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, assignedTo, dueDate, status } = req.body;
    const { projectId, taskId } = req.params;
    const task = await Task.findOneAndUpdate(
      { _id: taskId, project: projectId },
      { $set: { title, assignedTo, dueDate, status } },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ success: true, task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:projectId/tasks/:taskId', protect, canEditProject, async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const task = await Task.findOneAndDelete({ _id: taskId, project: projectId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 