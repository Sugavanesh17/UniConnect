const mongoose = require('mongoose');

const trustLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'account_created',
      'profile_completed',
      'project_created',
      'project_joined',
      'project_completed',
      'task_completed',
      'positive_review_received',
      'negative_review_received',
      'admin_adjustment',
      'longevity_bonus',
      'inactive_penalty',
      'project_abandoned',
      'collaboration_success',
      'communication_excellent',
      'deadline_missed',
      'helpful_contribution'
    ]
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  points: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
trustLogSchema.index({ user: 1, createdAt: -1 });
trustLogSchema.index({ action: 1 });
trustLogSchema.index({ project: 1 });
trustLogSchema.index({ createdAt: -1 });

// Trust score points configuration
const TRUST_SCORE_POINTS = {
  account_created: 5,
  profile_completed: 3,
  project_created: 15,
  project_joined: 5,
  project_completed: 25,
  task_completed: 8,
  positive_review_received: 10,
  negative_review_received: -15,
  admin_adjustment: 0, // Variable
  longevity_bonus: 5,
  inactive_penalty: -5,
  project_abandoned: -20,
  collaboration_success: 12,
  communication_excellent: 8,
  deadline_missed: -10,
  helpful_contribution: 6
};

// Static method to log trust activity
trustLogSchema.statics.logActivity = async function(userId, action, points, description, metadata = {}) {
  try {
    const log = new this({
      user: userId,
      action,
      points,
      description,
      metadata
    });
    
    await log.save();
    
    // Update user's trust score with bounds (0-100)
    const User = require('./User');
    const user = await User.findById(userId);
    if (user) {
      const newScore = Math.max(0, Math.min(100, user.trustScore + points));
      user.trustScore = newScore;
      user.lastActive = new Date();
      await user.save();
    }
    
    return log;
  } catch (error) {
    console.error('Error logging trust activity:', error);
    throw error;
  }
};

// Static method to get user's trust history
trustLogSchema.statics.getUserTrustHistory = function(userId, limit = 50) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('project', 'title')
    .populate('user', 'name email');
};

// Static method to get trust statistics
trustLogSchema.statics.getTrustStats = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        totalPoints: { $sum: '$points' }
      }
    }
  ]);
};

// Helper method to get points for an action
trustLogSchema.statics.getPointsForAction = function(action) {
  return TRUST_SCORE_POINTS[action] || 0;
};

// Method to calculate trust level
trustLogSchema.statics.getTrustLevel = function(score) {
  if (score >= 90) return { level: 'Elite', color: 'text-purple-600', bgColor: 'bg-purple-100' };
  if (score >= 80) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
  if (score >= 70) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  if (score >= 60) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
  if (score >= 40) return { level: 'Building', color: 'text-orange-600', bgColor: 'bg-orange-100' };
  return { level: 'New', color: 'text-red-600', bgColor: 'bg-red-100' };
};

module.exports = mongoose.model('TrustLog', trustLogSchema); 