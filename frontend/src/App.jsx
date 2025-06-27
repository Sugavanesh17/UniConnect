import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { SocketProvider } from './contexts/SocketContext.jsx';

// Layout Components
import Navbar from './components/layout/Navbar.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import CreateProjectPage from './pages/CreateProjectPage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <main className="container mx-auto px-8 py-8 max-w-8xl">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects/create" 
            element={
              <ProtectedRoute>
                <CreateProjectPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects/:projectId" 
            element={
              <ProtectedRoute>
                <ProjectDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
