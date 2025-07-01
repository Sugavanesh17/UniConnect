import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useNotifications } from '../../contexts/AuthContext.jsx';
import { 
  Users, 
  FolderOpen, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Shield,
  Home,
  User,
  Bell
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { notifications, setNotifications } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const dropdownRef = useRef();
  const bellRef = useRef();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    // Optionally, send a PATCH/PUT to backend to mark as read persistently
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    ...(isAuthenticated ? [
      { name: 'Dashboard', href: '/dashboard', icon: Settings },
      { name: 'Projects', href: '/projects', icon: FolderOpen },
      { name: 'Users', href: '/users', icon: Users },
      ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: Shield }] : [])
    ] : [])
  ];

  useEffect(() => {
    if (!showDropdown) return;
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-8 sm:px-8 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-200">
                UniConnect
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    isActive
                      ? 'text-blue-600 bg-blue-50 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.name}</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full font-medium ${
                    (user?.trustScore || 0) >= 90 ? 'bg-purple-100 text-purple-700' :
                    (user?.trustScore || 0) >= 80 ? 'bg-green-100 text-green-700' :
                    (user?.trustScore || 0) >= 70 ? 'bg-blue-100 text-blue-700' :
                    (user?.trustScore || 0) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                    (user?.trustScore || 0) >= 40 ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {user?.trustScore || 0}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 hover:scale-105"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Notifications - Only show when authenticated */}
          {isAuthenticated && (
            <div className="relative ml-4 flex items-center">
              <button
                ref={bellRef}
                className={`relative flex items-center justify-center transition-transform ${unreadCount > 0 ? 'animate-bounce' : ''}`}
                onClick={() => setShowDropdown((v) => !v)}
                aria-label="Notifications"
                style={{ minHeight: 40, zIndex: 50 }}
              >
                <Bell className="w-6 h-6 text-gray-600 hover:text-blue-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 translate-x-1/2 -translate-y-1/2 shadow">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-40 max-h-96 overflow-y-auto"
                >
                  <div className="flex items-center justify-between p-4 border-b font-semibold text-gray-900">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">Mark all as read</button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`flex items-start gap-2 px-4 py-3 border-b last:border-b-0 ${!n.read ? 'bg-blue-50' : 'bg-white'} rounded transition`}
                      >
                        {!n.read && <span className="mt-1 w-2 h-2 bg-blue-500 rounded-full inline-block" />}
                        <div className="flex-1">
                          <div className="text-sm text-gray-800">{n.message}</div>
                          <div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-blue-600 p-2 transition-colors duration-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {isAuthenticated ? (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                >
                  <User className="w-5 h-5" />
                  <span>{user?.name}</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full font-medium ${
                    (user?.trustScore || 0) >= 90 ? 'bg-purple-100 text-purple-700' :
                    (user?.trustScore || 0) >= 80 ? 'bg-green-100 text-green-700' :
                    (user?.trustScore || 0) >= 70 ? 'bg-blue-100 text-blue-700' :
                    (user?.trustScore || 0) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                    (user?.trustScore || 0) >= 40 ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {user?.trustScore || 0}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 w-full text-left transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;