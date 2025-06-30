import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  Shield, 
  Users, 
  FolderOpen, 
  AlertTriangle, 
  TrendingUp,
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportsTab, setShowReportsTab] = useState(false);
  const [resolveModal, setResolveModal] = useState({ open: false, report: null, note: '', loading: false });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'projects') fetchProjects();
    else if (activeTab === 'reports') fetchReports();
  }, [activeTab]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {});
      } else {
        console.error('Failed to fetch dashboard data:', response.status);
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users:', response.status);
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/projects`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      } else {
        console.error('Failed to fetch projects:', response.status);
        toast.error('Failed to load projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      } else {
        console.error('Failed to fetch reports:', response.status);
        toast.error('Failed to load reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    }
  };

  const updateUserStatus = async (userId, status, reason) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive: status === 'active', reason })
      });
      if (response.ok) {
        toast.success(`User ${status === 'active' ? 'activated' : 'deactivated'} successfully`);
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const updateTrustScore = async (userId, trustScore, reason) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/trust-score`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ points: trustScore, reason })
      });
      if (response.ok) {
        toast.success('Trust score updated successfully');
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update trust score');
      }
    } catch (error) {
      console.error('Error updating trust score:', error);
      toast.error('Failed to update trust score');
    }
  };

  const handleReport = async (reportId, status, adminNotes) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, adminNotes })
      });
      if (response.ok) {
        toast.success('Report handled successfully');
        fetchReports();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to handle report');
      }
    } catch (error) {
      console.error('Error handling report:', error);
      toast.error('Failed to handle report');
    }
  };

  const handleDeleteProject = async (projectId, projectTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        toast.success('Project deleted successfully');
        fetchProjects(); // Refresh the projects list
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Delete project error:', error);
      toast.error('Failed to delete project');
    }
  };

  const openResolveModal = (report) => setResolveModal({ open: true, report, note: '', loading: false });
  const closeResolveModal = () => setResolveModal({ open: false, report: null, note: '', loading: false });
  const handleResolve = async () => {
    if (!resolveModal.report) return;
    setResolveModal((prev) => ({ ...prev, loading: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/reports/${resolveModal.report._id}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ adminNote: resolveModal.note })
      });
      if (response.ok) {
        toast.success('Report resolved');
        fetchReports();
        closeResolveModal();
      } else {
        toast.error('Failed to resolve report');
      }
    } catch (error) {
      toast.error('Failed to resolve report');
    } finally {
      setResolveModal((prev) => ({ ...prev, loading: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, projects, and platform security</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.users?.total || 0}</div>
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-xs text-green-600 mt-1">{stats.users?.active || 0} active</div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <FolderOpen className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.projects?.total || 0}</div>
          <div className="text-sm text-gray-600">Total Projects</div>
          <div className="text-xs text-green-600 mt-1">{stats.projects?.active || 0} active</div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.pendingReports || 0}</div>
          <div className="text-sm text-gray-600">Pending Reports</div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Ban className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.flaggedUsers || 0}</div>
          <div className="text-sm text-gray-600">Flagged Users</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2">
        <div className="flex space-x-1">
          {['dashboard', 'users', 'projects', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Platform Overview</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Recent Activity</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">New user registered</span>
                    <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Project created</span>
                    <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Report submitted</span>
                    <span className="text-xs text-gray-500 ml-auto">6 hours ago</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">System Health</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Server Status</span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Online</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Database</span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Healthy</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Active Sessions</span>
                    <span className="text-sm font-medium text-gray-900">{stats.users?.active || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">User Management</h3>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">University</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Trust Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{user.university}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {user.trustScore}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateUserStatus(user._id, user.isActive ? 'suspended' : 'active', 'Admin action')}
                            className={`px-3 py-1 text-xs rounded-lg font-medium ${
                              user.isActive
                                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {user.isActive ? 'Suspend' : 'Activate'}
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Project Management</h3>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {projects.map((project) => (
                <div key={project._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{project.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Owner: {project.owner?.name}</span>
                      <span>Status: {project.status}</span>
                      <span>Privacy: {project.privacy}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200">
                      View
                    </button>
                    <button className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-lg hover:bg-red-200">
                      Flag
                    </button>
                    <button 
                      onClick={() => handleDeleteProject(project._id, project.title)}
                      className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Reports & Flags</h3>
            {reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No reports available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Reported User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Reporter</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r._id} className="border-t">
                        <td className="px-6 py-4 align-top whitespace-nowrap text-sm text-gray-900">{r.reportedUser?.name || 'N/A'}</td>
                        <td className="px-6 py-4 align-top whitespace-nowrap text-sm text-gray-900">{r.reportedBy?.name || 'N/A'}</td>
                        <td className="px-6 py-4 align-top whitespace-nowrap text-sm text-gray-900">{r.project?.title || 'N/A'}</td>
                        <td className="px-6 py-4 align-top max-w-xs truncate text-sm text-gray-700" title={r.reason}>{r.reason}</td>
                        <td className="px-6 py-4 align-top text-sm">
                          {r.status === 'open' ? <span className="text-yellow-600 font-semibold">Open</span> : <span className="text-green-600 font-semibold">Resolved</span>}
                        </td>
                        <td className="px-6 py-4 align-top text-sm">
                          {r.status === 'open' ? (
                            <button onClick={() => openResolveModal(r)} className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">Resolve</button>
                          ) : (
                            <span className="text-xs text-gray-500">Done</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {resolveModal.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-auto animate-fade-in">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Resolve Report</h2>
                  <p className="text-gray-700 mb-4">Add a note for resolving the report on <span className="font-semibold">{resolveModal.report?.reportedUser?.name}</span>.</p>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Resolution note (optional)"
                    value={resolveModal.note}
                    onChange={e => setResolveModal((prev) => ({ ...prev, note: e.target.value }))}
                    disabled={resolveModal.loading}
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={closeResolveModal}
                      className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
                      disabled={resolveModal.loading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResolve}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition shadow-sm"
                      disabled={resolveModal.loading}
                    >
                      {resolveModal.loading ? 'Resolving...' : 'Resolve'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;