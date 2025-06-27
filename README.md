# UniConnect - Cross-University Collaboration Platform

UniConnect is a secure, full-stack MERN application designed to facilitate collaboration between university students across different institutions. The platform provides project management, trust scoring, real-time communication, and admin controls.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based authentication with role-based access control
- **Project Management** - Create, manage, and collaborate on projects with privacy controls
- **Trust Score System** - Community-driven trust scoring with detailed activity logging
- **Real-time Communication** - Socket.io powered chat system with role-based access
- **Task Management** - Trello-style taskboards integrated within projects
- **Admin Dashboard** - Comprehensive admin controls for platform management

### Security Features
- **Privacy Controls** - Public, private, and draft project modes
- **NDA Agreements** - Required for private project access
- **Trust Score Tracking** - Detailed logging of user activities
- **Role-based Access** - Owner, contributor, and viewer roles
- **Input Validation** - Comprehensive server-side validation

### User Experience
- **Modern UI** - Beautiful, responsive design with Tailwind CSS
- **Real-time Updates** - Live notifications and chat
- **Cross-platform** - Works on desktop and mobile devices
- **Intuitive Navigation** - Clean, user-friendly interface

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **bcrypt** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **Socket.io Client** - Real-time communication
- **React Hot Toast** - Notifications

## 📁 Project Structure

```
UniConnect/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── App.jsx      # Main app component
│   └── public/          # Static assets
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd UniConnect
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   Create `.env` files in both `backend/` and `frontend/` directories:

   **Backend (.env)**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/uniconnect
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:3000
   ```

   **Frontend (.env)**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both backend (port 5000) and frontend (port 3000) servers.

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@university.edu",
  "password": "password123",
  "university": "MIT",
  "bio": "Computer Science student",
  "skills": ["JavaScript", "React", "Node.js"],
  "github": "https://github.com/johndoe",
  "linkedin": "https://linkedin.com/in/johndoe"
}
```

#### POST /api/auth/login
Login user
```json
{
  "email": "john@university.edu",
  "password": "password123"
}
```

#### GET /api/auth/me
Get current user profile

### Project Endpoints

#### GET /api/projects
Get all projects (with filtering)
```
Query parameters: privacy, status, techStack, university, page, limit, sort, order
```

#### POST /api/projects
Create a new project
```json
{
  "title": "AI Study Buddy",
  "description": "An AI-powered study assistant",
  "techStack": ["Python", "TensorFlow", "React"],
  "privacy": "public",
  "tags": ["AI", "Education"]
}
```

#### GET /api/projects/:projectId
Get project details

#### PUT /api/projects/:projectId
Update project

#### DELETE /api/projects/:projectId
Delete project

### Task Endpoints

#### POST /api/projects/:projectId/tasks
Create a new task
```json
{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication",
  "assignedTo": "user_id",
  "dueDate": "2024-01-15",
  "status": "todo"
}
```

#### PUT /api/projects/:projectId/tasks/:taskId
Update task

#### DELETE /api/projects/:projectId/tasks/:taskId
Delete task

### User Endpoints

#### GET /api/users
Get all users (with filtering)
```
Query parameters: search, university, skills, page, limit, sort, order
```

#### PUT /api/users/profile
Update user profile

### Admin Endpoints

#### GET /api/admin/dashboard
Get admin dashboard stats

#### GET /api/admin/users
Get all users for admin

#### PUT /api/admin/users/:userId/status
Update user status

#### PUT /api/admin/users/:userId/trust-score
Update user trust score

## 🔐 Security Features

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Token expiration and refresh
- Role-based access control

### Data Protection
- Input validation and sanitization
- CORS configuration
- Rate limiting
- XSS protection

### Privacy Controls
- Project privacy levels (public, private, draft)
- NDA agreements for private projects
- User data protection

## 🎯 Trust Score System

The trust score system tracks user activities and assigns points:

- **Account Creation**: +5 points
- **Project Creation**: +10 points
- **Project Completion**: +20 points
- **Positive Feedback**: +5 points
- **Negative Feedback**: -10 points
- **Project Views**: +1 point

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to Heroku, Railway, or similar platform

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or similar platform
3. Update environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@uniconnect.com or create an issue in the repository.

## 🔮 Future Features

- File upload and sharing
- Video conferencing integration
- Advanced analytics dashboard
- Mobile app development
- Integration with university systems
- Advanced search and filtering
- Project templates
- Mentorship programs

---

**UniConnect** - Connecting students, building the future together! 🎓✨ 