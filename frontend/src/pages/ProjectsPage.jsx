import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
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
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

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
        return <Eye className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getPrivacyLabel = (privacy) => {
    switch (privacy) {
      case 'public':
        return 'Public';
      case 'private':
        return 'Private';
      default:
        return 'Protected';
    }
  };

  const getPrivacyColor = (privacy) => {
    switch (privacy) {
      case 'public':
        return 'bg-green-100 text-green-700';
      case 'private':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
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
          <div className="flex gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
            >
              <option value="all">All Projects</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="protected">Protected</option>
            </select>

          <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
          >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest</option>
              <option value="members">Most Members</option>
              <option value="name">Name A-Z</option>
          </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                  {project.title}
                </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {project.description}
                </p>
              </div>
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
                  <Link
                    to={`/projects/${project._id}`}
                    className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium group-hover:scale-105 hover:shadow-md"
                  >
                    <span>View Project</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            </div>
        ))}
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
    </div>
  );
};

export default ProjectsPage;