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
      'project_created',
      'project_joined',
      'project_viewed',
      'file_uploaded',
      'task_completed',
      'positive_review',
      'negative_review',
      'admin_adjustment',
      'account_verified',
      'longevity_bonus'
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
    
    // Update user's trust score
    const User = require('./User');
    await User.findByIdAndUpdate(userId, {
      $inc: { trustScore: points },
      lastActive: new Date()
    });
    
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
        user: mongoose.Types.ObjectId(userId),
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

module.exports = mongoose.model('TrustLog', trustLogSchema); 