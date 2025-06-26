# UniConnect - Project Structure

## 🏗️ Complete MERN Stack Application

### 📁 Root Structure
```
UniConnect/
├── package.json                 # Root package.json with workspace scripts
├── README.md                    # Project documentation
├── PROJECT_STRUCTURE.md         # This file
├── backend/                     # Node.js + Express API
└── frontend/                    # React.js Application
```

### 🔧 Backend Structure (`/backend`)
```
backend/
├── package.json                 # Backend dependencies
├── env.example                  # Environment variables template
├── server.js                    # Main Express server
├── models/                      # MongoDB/Mongoose Models
│   ├── User.js                  # User model with trust score
│   ├── Project.js               # Project model with privacy controls
│   └── TrustLog.js              # Trust activity logging
├── middleware/                  # Express middleware
│   ├── auth.js                  # JWT authentication & authorization
│   └── errorHandler.js          # Global error handling
└── routes/                      # API Routes
    ├── auth.js                  # Authentication routes
    ├── users.js                 # User management routes
    ├── projects.js              # Project management routes
    └── admin.js                 # Admin panel routes
```

### 🎨 Frontend Structure (`/frontend`)
```
frontend/
├── package.json                 # Frontend dependencies
├── env.example                  # Frontend environment variables
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── public/
│   └── index.html               # Main HTML file
└── src/
    ├── index.js                 # React entry point
    ├── index.css                # Global styles with Tailwind
    └── App.js                   # Main React component
```

## 🚀 Key Features Implemented

### ✅ Backend Features
- **Authentication System**: JWT-based auth with role-based access
- **User Management**: Registration, login, profile management
- **Project System**: Create, update, delete projects with privacy controls
- **Trust System**: Score-based reputation with activity logging
- **Access Control**: Public/Private/Draft projects with NDA support
- **Admin Panel**: User oversight, trust score adjustments, platform management
- **Real-time Ready**: Socket.io integration prepared
- **Security**: Input validation, rate limiting, error handling

### ✅ Frontend Foundation
- **Modern UI**: Tailwind CSS with custom design system
- **Routing**: React Router with protected routes
- **State Management**: Context API for auth and socket management
- **Component Architecture**: Modular, reusable components
- **Responsive Design**: Mobile-first approach
- **Toast Notifications**: User feedback system

### ✅ Database Models
- **User Model**: Profile, skills, trust score, university info
- **Project Model**: Privacy settings, member roles, join requests
- **TrustLog Model**: Activity tracking and score adjustments

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Real-time**: Socket.io
- **File Upload**: Multer (ready for implementation)

### Frontend
- **Framework**: React.js 18
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: Socket.io client
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm run install-all
   ```

2. **Environment Setup**:
   - Copy `backend/env.example` to `backend/.env`
   - Copy `frontend/env.example` to `frontend/.env`
   - Configure MongoDB URI and JWT secret

3. **Start Development**:
   ```bash
   npm run dev
   ```

4. **Access Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📋 Next Steps

### Backend Implementation Needed
- [ ] File upload routes with GridFS
- [ ] Chat system with Socket.io
- [ ] Task management system
- [ ] Email verification system
- [ ] Search and filtering endpoints
- [ ] Notification system

### Frontend Implementation Needed
- [ ] Authentication components (Login/Register)
- [ ] Dashboard components
- [ ] Project management components
- [ ] User profile components
- [ ] Admin panel components
- [ ] Real-time chat interface
- [ ] File upload components

### Database Enhancements
- [ ] Task model for project tasks
- [ ] Message model for chat
- [ ] File model for document storage
- [ ] Notification model

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: User, Admin roles with middleware
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Cross-origin request handling
- **Error Handling**: Secure error responses
- **Password Hashing**: bcrypt for password security

## 🎯 Core Functionality

### Trust System
- **Score Range**: 0-100 (default: 50)
- **Activities**: Project creation, joining, viewing, file uploads
- **Admin Control**: Manual score adjustments with logging
- **History Tracking**: Complete activity audit trail

### Project Privacy
- **Public**: Visible to all users
- **Private**: Requires invitation and NDA
- **Draft**: Owner only access
- **Role System**: Owner, Contributor, Viewer

### Collaboration Features
- **Join Requests**: For private projects
- **NDA Agreements**: Required for private project access
- **Member Management**: Add/remove with role assignment
- **Activity Logging**: Track all project interactions

This foundation provides a solid, scalable architecture for the UniConnect platform with all core features implemented and ready for frontend development! 