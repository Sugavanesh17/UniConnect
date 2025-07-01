import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useSocket } from '../contexts/SocketContext.jsx';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Globe, 
  Lock, 
  Plus, 
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  UserPlus,
  Send,
  Paperclip,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import SearchableDropdown from '../components/common/SearchableDropdown.jsx';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const { user, token } = useAuth();
  const { socket, joinProject, leaveProject, sendMessage } = useSocket();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newTask, setNewTask] = useState({ title: '', assignedTo: '', dueDate: '' });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportUser, setReportUser] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProject();
    if (socket) {
      joinProject(projectId);
      
      socket.on('new-message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      return () => {
        leaveProject(projectId);
        socket.off('new-message');
      };
    }
  }, [projectId, socket]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      } else if (response.status === 403) {
        // User doesn't have access, fetch basic info instead
        const basicResponse = await fetch(`${API_BASE_URL}/projects/${projectId}/basic`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (basicResponse.ok) {
          const basicData = await basicResponse.json();
          setProject(basicData.project);
        } else {
          navigate('/projects');
        }
      } else if (response.status === 404) {
        navigate('/projects');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(projectId, newMessage);
      setNewMessage('');
    }
  };

  const handleJoinProject = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/join-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: `I would like to join ${project.title}. I'm interested in contributing to this project.` 
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Join request sent successfully! The project owner will review your request.');
        fetchProject(); // Refresh project data to show updated join requests
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send join request');
      }
    } catch (error) {
      console.error('Error sending join request:', error);
      toast.error('Failed to send join request');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    // Debug: Check user permissions
    console.log('User:', user);
    console.log('Project owner:', project?.owner);
    console.log('Project members:', project?.members);
    console.log('Is owner:', isOwner);
    console.log('Is member:', isMember);
    console.log('Can edit:', canEdit);
    
    try {
      // Format the task data properly
      const taskData = {
        title: newTask.title,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null
      };

      // Only add assignedTo if it has a value
      if (newTask.assignedTo && newTask.assignedTo.trim() !== '') {
        taskData.assignedTo = newTask.assignedTo;
      }

      console.log('Creating task with data:', taskData); // Debug log
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      console.log('Response status:', response.status); // Debug log

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Task created successfully');
        fetchProject();
        setNewTask({ title: '', assignedTo: '', dueDate: '' });
        setShowTaskForm(false);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData); // Debug log
        toast.error(errorData.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Task status updated successfully');
        fetchProject();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task status');
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'todo': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const openReportModal = (user) => {
    setReportUser(user);
    setShowReportModal(true);
    setReportReason('');
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportUser(null);
    setReportReason('');
  };

  const handleReportSubmit = async () => {
    if (!reportUser || !reportReason.trim()) return;
    setReportLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: reportUser._id, reason: reportReason })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Report submitted');
        closeReportModal();
      } else {
        toast.error(data.message || 'Failed to submit report');
      }
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h2>
        <Link to="/projects" className="text-primary-600 hover:text-primary-700">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  const isMember = project.members?.some(member => member.user._id === user?._id);
  const isOwner = project.owner._id === user?._id;
  const isAdmin = user?.role === 'admin';
  const canEdit = isOwner || (isMember && project.members.find(m => m.user._id === user?._id)?.role === 'contributor');
  const canDelete = isOwner || isAdmin;
  const hasFullAccess = isOwner || isMember || isAdmin;
  const hasPendingRequest = project.hasPendingRequest;

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Project deleted successfully');
        navigate('/projects');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Delete project error:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleJoinRequest = async (requestId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/join-request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || `Join request ${status} successfully`);
        fetchProject(); // Refresh project data
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${status} join request`);
      }
    } catch (error) {
      console.error('Error handling join request:', error);
      toast.error(`Failed to ${status} join request`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Projects</span>
        </Link>
        
        <div className="flex items-center space-x-2">
          {isOwner && (
            <Link
              to={`/projects/${projectId}/settings`}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          )}
          
          {canDelete && (
            <button
              onClick={handleDeleteProject}
              className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Project Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              {project.privacy === 'public' ? (
                <Globe className="w-6 h-6 text-green-600" />
              ) : (
                <Lock className="w-6 h-6 text-blue-600" />
              )}
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            </div>
            <p className="text-gray-600 max-w-2xl">{project.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{project.members?.length || 0} members</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
          </div>

          {!isMember && !isOwner && !hasPendingRequest && (
            <button
              onClick={handleJoinProject}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Request to Join</span>
            </button>
          )}

          {hasPendingRequest && (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
              <span className="text-sm">Join request pending approval</span>
            </div>
          )}

          {!isMember && !isOwner && project.privacy === 'draft' && (
            <div className="text-gray-500 text-sm">
              This project is in draft mode
            </div>
          )}
        </div>

        {/* Tech Stack */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Technology Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-primary-100 text-primary-800 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs and Tab Content */}
      {hasFullAccess ? (
        <>
          {/* Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2">
            <div className="flex space-x-1">
              {['overview', 'tasks', 'chat', 'members'].map((tab) => (
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
              {isOwner && project.joinRequests?.length > 0 && (
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'requests'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                  }`}
                >
                  Join Requests ({project.joinRequests.filter(r => r.status === 'pending').length})
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Project Overview</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{project.description}</p>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Tasks</h3>
                  {canEdit && (
                    <button
                      onClick={() => setShowTaskForm(!showTaskForm)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Task</span>
                    </button>
                  )}
                </div>

                {showTaskForm && (
                  <form onSubmit={handleCreateTask} className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <input
                      type="text"
                      placeholder="Task name"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <SearchableDropdown
                      options={project.members?.map(member => ({
                        value: member.user._id,
                        label: `${member.user.name} (${member.role})`,
                        avatar: member.user.avatar // if you have avatar URLs, otherwise remove this line
                      })) || []}
                      value={newTask.assignedTo}
                      onChange={val => setNewTask({ ...newTask, assignedTo: val })}
                      placeholder="Assign to..."
                      className="mb-2"
                    />
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                      >
                        Create Task
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTaskForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {project.tasks?.map((task) => (
                    <div key={task._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getTaskStatusIcon(task.status)}
                          <span className="font-medium">{task.title}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getTaskStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {task.assignedTo && (
                            <div>Assigned to: {task.assignedTo.name || 'Unknown user'}</div>
                          )}
                          {task.dueDate && (
                            <div>Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                      {canEdit && (
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      )}
                    </div>
                  ))}
                  {(!project.tasks || project.tasks.length === 0) && (
                    <p className="text-gray-500 text-center py-8">No tasks yet</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Project Chat</h3>
                <div className="h-96 bg-gray-50 rounded-lg p-4 overflow-y-auto">
                  {messages.map((message, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {message.userName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{message.userName}</div>
                          <div className="text-gray-700">{message.message}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Project Members</h3>
                <div className="space-y-4">
                  {project.members?.map((member) => (
                    <div key={member.user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{member.user.name}</div>
                          <div className="text-sm text-gray-600">{member.user.university}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          member.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                          member.role === 'contributor' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {member.role}
                        </span>
                        {isOwner && member.user._id !== user._id && (
                          <button onClick={() => openReportModal(member.user)} className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Report User</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Join Requests</h3>
                <div className="space-y-4">
                  {project.joinRequests?.map((request) => (
                    <div key={request._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {request.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{request.user.name}</div>
                          <div className="text-sm text-gray-600">{request.user.university}</div>
                          {request.message && (
                            <div className="text-sm text-gray-500 mt-1">"{request.message}"</div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            Requested {new Date(request.requestedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {request.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleJoinRequest(request._id, 'approved')}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleJoinRequest(request._id, 'rejected')}
                              className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!project.joinRequests || project.joinRequests.length === 0) && (
                    <p className="text-gray-500 text-center py-8">No join requests</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        // Restricted access view for non-members
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600 mb-6">
            You need to be a member of this project to view its details, tasks, and chat.
          </p>
          {!hasPendingRequest && (
            <button
              onClick={handleJoinProject}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Request to Join</span>
            </button>
          )}
          {hasPendingRequest && (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg inline-block">
              <span className="text-sm">Join request pending approval</span>
            </div>
          )}
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-auto animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Report User</h2>
            <p className="text-gray-700 mb-4">Report <span className="font-semibold">{reportUser?.name}</span> for inappropriate behaviour in this project.</p>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Describe the issue..."
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              disabled={reportLoading}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={closeReportModal}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
                disabled={reportLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-sm"
                disabled={reportLoading || !reportReason.trim()}
              >
                {reportLoading ? 'Reporting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;