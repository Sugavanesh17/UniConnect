import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  FolderOpen, 
  Plus, 
  X, 
  ArrowLeft,
  Users,
  Lock,
  Globe,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const CreateProjectPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    privacy: 'public',
    techStack: [],
    requirements: '',
    maxMembers: 5
  });
  const [techInput, setTechInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addTechStack = () => {
    if (techInput.trim() && !formData.techStack.includes(techInput.trim())) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, techInput.trim()]
      });
      setTechInput('');
    }
  };

  const removeTechStack = (techToRemove) => {
    setFormData({
      ...formData,
      techStack: formData.techStack.filter(tech => tech !== techToRemove)
    });
  };

  const handleTechKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechStack();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Project created successfully!');
        navigate(`/projects/${data.project._id}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const getPrivacyIcon = (privacy) => {
    switch (privacy) {
      case 'public':
        return <Globe className="w-5 h-5" />;
      case 'private':
        return <Lock className="w-5 h-5" />;
      default:
        return <Eye className="w-5 h-5" />;
    }
  };

  const getPrivacyDescription = (privacy) => {
    switch (privacy) {
      case 'public':
        return 'Anyone can view and join your project';
      case 'private':
        return 'Only invited members can access your project';
      default:
        return 'Anyone can view but you approve join requests';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-gray-600 mt-2">
            Start a new collaborative project and invite team members
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FolderOpen className="w-6 h-6 mr-2 text-blue-600" />
              Project Information
            </h2>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                placeholder="Enter project title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                placeholder="Describe your project goals, objectives, and what you're looking for in collaborators..."
              />
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                Requirements & Skills
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={3}
                value={formData.requirements}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                placeholder="What skills or experience are you looking for in team members?"
              />
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Lock className="w-6 h-6 mr-2 text-blue-600" />
              Privacy Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['public', 'protected', 'private'].map((privacy) => (
                <label
                  key={privacy}
                  className={`relative cursor-pointer border-2 rounded-lg p-4 transition-all duration-200 hover:scale-105 ${
                    formData.privacy === privacy
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <input
                    type="radio"
                    name="privacy"
                    value={privacy}
                    checked={formData.privacy === privacy}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      formData.privacy === privacy ? 'bg-blue-600 scale-110' : 'bg-gray-100 group-hover:scale-110'
                    }`}>
                      {getPrivacyIcon(privacy)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 capitalize">
                        {privacy}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getPrivacyDescription(privacy)}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Plus className="w-6 h-6 mr-2 text-blue-600" />
              Technology Stack
            </h2>

            <div>
              <label htmlFor="techStack" className="block text-sm font-medium text-gray-700 mb-2">
                Technologies & Tools
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyPress={handleTechKeyPress}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                  placeholder="e.g., React, Node.js, Python..."
                />
                <button
                  type="button"
                  onClick={addTechStack}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium hover:scale-105 hover:shadow-md"
                >
                  Add
                </button>
              </div>
              
              {formData.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.techStack.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 hover:scale-105 transition-transform duration-200"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechStack(tech)}
                        className="ml-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Team Settings */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="w-6 h-6 mr-2 text-blue-600" />
              Team Settings
            </h2>

            <div>
              <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Team Size
              </label>
              <select
                id="maxMembers"
                name="maxMembers"
                value={formData.maxMembers}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
              >
                <option value={3}>3 members</option>
                <option value={5}>5 members</option>
                <option value={8}>8 members</option>
                <option value={10}>10 members</option>
                <option value={15}>15 members</option>
                <option value={20}>20 members</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium hover:scale-105 hover:shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Create Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectPage;