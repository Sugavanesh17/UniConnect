import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import SearchableDropdown from '../components/common/SearchableDropdown.jsx';
import { 
  FolderOpen, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye,
  Lock,
  Globe,
  Calendar, 
  Star,
  ArrowRight,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const deleteButtonRef = useRef();

  // Sort options for the dropdown
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'members', label: 'Most Members' },
    { value: 'name', label: 'Name A-Z' }
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchTerm, filter, sortBy]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProjects = () => {
    let filtered = projects;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.owner?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply privacy filter
    if (filter !== 'all') {
      filtered = filtered.filter(project => project.privacy === filter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'members':
          return (b.members?.length || 0) - (a.members?.length || 0);
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  };

  const getPrivacyIcon = (privacy) => {
    switch (privacy) {
      case 'public':
        return <Globe className="w-4 h-4 text-green-600" />;
      case 'private':
        return <Lock className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getPrivacyLabel = (privacy) => {
    switch (privacy) {
      case 'public':
        return 'Public';
      case 'private':
        return 'Private';
      default:
        return '';
    }
  };

  const getPrivacyColor = (privacy) => {
    switch (privacy) {
      case 'public':
        return 'bg-green-100 text-green-700';
      case 'private':
        return 'bg-red-100 text-red-700';
      default:
        return '';
    }
  };

  const openDeleteModal = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/projects/${projectToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        toast.success('Project deleted successfully');
        fetchProjects();
        closeDeleteModal();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Delete project error:', error);
      toast.error('Failed to delete project');
    } finally {
      setDeleteLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">
            Discover and join amazing collaborative projects
          </p>
        </div>
        <Link
          to="/projects/create"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Project
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 items-center">
            {['all', 'public', 'private'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-full font-medium border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${filter === type
                    ? 'bg-blue-600 text-white border-blue-600 shadow'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50'}`}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <SearchableDropdown
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            placeholder="Sort by..."
            className="w-48"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const isOwner = project.owner._id === user?._id;
            const isAdmin = user?.role === 'admin';
            const canDelete = isOwner || isAdmin;
            const isMember = project.members?.some(m => m.user === user?._id || m.user?._id === user?._id);
            const canView = isOwner || isMember;

            // Handler for requesting to join a private project
            const handleRequestToJoin = async () => {
              try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${process.env.REACT_APP_API_URL}/projects/${project._id}/join-request`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({})
                });
                const data = await response.json();
                if (response.ok) {
                  toast.success(data.message || 'Join request sent!');
                } else {
                  toast.error(data.message || 'Failed to send join request');
                }
              } catch (error) {
                toast.error('Failed to send join request');
              }
            };

            return (
              <div key={project._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                        {project.title}
                      </h3>
                      <p className={`text-gray-600 text-sm line-clamp-3 mb-4 ${project.privacy === 'private' && !canView ? 'italic text-gray-400 flex items-center gap-1' : ''}`}> 
                        {project.privacy === 'private' && !canView ? <Lock className="inline w-4 h-4 mr-1" /> : null}
                        {project.description}
                      </p>
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => openDeleteModal(project)}
                        className="ml-2 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Project Owner */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <span className="text-white text-sm font-medium">
                            {project.owner?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {project.owner?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {project.owner?.university || 'University'}
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getPrivacyColor(project.privacy)} group-hover:scale-105 transition-transform duration-200`}>
                        {getPrivacyIcon(project.privacy)}
                        <span>{getPrivacyLabel(project.privacy)}</span>
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{project.members?.length || 0} members</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {project.owner?.trustScore && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{project.owner.trustScore}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    {project.privacy === 'private' && !canView ? (
                      <button
                        onClick={handleRequestToJoin}
                        className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium group-hover:scale-105 hover:shadow-md"
                      >
                        <span>Request to Join</span>
                        <Lock className="w-4 h-4 ml-2" />
                      </button>
                    ) : (
                      <Link
                        to={`/projects/${project._id}`}
                        className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium group-hover:scale-105 hover:shadow-md"
                      >
                        <span>View Project</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filter !== 'all' ? 'No projects found' : 'No projects available'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Be the first to create a project!'
            }
          </p>
          {!searchTerm && filter === 'all' && (
          <Link
            to="/projects/create"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
              <Plus className="w-5 h-5 mr-2" />
              Create First Project
          </Link>
          )}
        </div>
      )}

      {/* Results Count */}
      {filteredProjects.length > 0 && (
        <div className="text-center text-gray-600">
          Showing {filteredProjects.length} of {projects.length} projects
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-auto animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Project</h2>
            <p className="text-gray-700 mb-6">Are you sure you want to delete <span className="font-semibold text-red-600">"{projectToDelete?.title}"</span>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                ref={deleteButtonRef}
                onClick={handleDeleteProject}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-sm"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;