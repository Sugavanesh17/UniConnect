const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const Project = require('./models/Project');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const adminRoutes = require('./routes/admin');
const taskRoutes = require('./routes/tasks');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uniconnect')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', taskRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'UniConnect API is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`👥 User joined project: ${projectId}`);
  });

  socket.on('leave-project', (projectId) => {
    socket.leave(`project-${projectId}`);
    console.log(`👋 User left project: ${projectId}`);
  });

  socket.on('send-message', async (data) => {
    try {
      const project = await Project.findById(data.projectId);
      if (!project) {
        socket.emit('error-message', { message: 'Project not found.' });
        return;
      }
      const member = project.members.find(m => m.user.toString() === data.userId);
      if (!member || !['owner', 'contributor'].includes(member.role)) {
        socket.emit('error-message', { message: 'You do not have permission to send messages in this project.' });
        return;
      }
      io.to(`project-${data.projectId}`).emit('new-message', data);
    } catch (err) {
      console.error('Socket send-message error:', err);
      socket.emit('error-message', { message: 'Server error sending message.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 UniConnect server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, io };