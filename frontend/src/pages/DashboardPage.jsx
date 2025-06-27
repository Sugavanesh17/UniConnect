import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  FolderOpen, 
  Users, 
  Star, 
  TrendingUp, 
  Clock, 
  Plus,
  ArrowRight,
  Activity,
  Target,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/projects/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name}! Here's what's happening with your projects.
          </p>
        </div>
        <Link
          to="/projects/create"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium hover:scale-105 hover:shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Project
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.stats?.totalProjects || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.stats?.activeProjects || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collaborators</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.stats?.totalCollaborators || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trust Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.stats?.trustScore || user?.trustScore || 50}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
            <Link
              to="/projects"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center hover:scale-105 transition-transform duration-200"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {dashboardData?.recentProjects && dashboardData.recentProjects.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentProjects.map((project) => (
                <div key={project._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200">
                        <Link to={`/projects/${project._id}`}>
                          {project.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {project.description?.substring(0, 60)}...
                      </p>
                      <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {project.members?.length || 1} members
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'active' ? 'bg-green-100 text-green-700' :
                          project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No projects yet</p>
              <Link
                to="/projects/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>

          {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent activities</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/projects/create"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 hover:scale-105 group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Create Project</h3>
              <p className="text-sm text-gray-600">Start a new collaboration</p>
            </div>
          </Link>

          <Link
            to="/projects"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 hover:scale-105 group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
              <FolderOpen className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Browse Projects</h3>
              <p className="text-sm text-gray-600">Find projects to join</p>
            </div>
          </Link>

          <Link
            to="/users"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 hover:scale-105 group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Find Collaborators</h3>
              <p className="text-sm text-gray-600">Connect with other students</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;