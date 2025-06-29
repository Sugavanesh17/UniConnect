import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  User, 
  Mail, 
  MapPin, 
  Github, 
  Linkedin, 
  Edit3, 
  Save, 
  X, 
  Plus,
  Star,
  Calendar,
  Award,
  RefreshCw
} from 'lucide-react';

const ProfilePage = () => {
  const { user, token, updateUser, refreshUser } = useAuth();
  const { userId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [profileUser, setProfileUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Determine if we're viewing our own profile or someone else's
  const isOwnProfile = !userId || userId === user?._id;
  const displayUser = isOwnProfile ? user : profileUser;
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    university: user?.university || '',
    skills: user?.skills || [],
    github: user?.github || '',
    linkedin: user?.linkedin || ''
  });

  const [trustHistory, setTrustHistory] = useState([]);
  const [loadingTrustHistory, setLoadingTrustHistory] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (isOwnProfile) {
      // Refresh user data when component mounts
      refreshUserData();
    } else {
      // Fetch other user's profile
      fetchUserProfile();
    }
  }, [userId, user?._id]);

  useEffect(() => {
    if (user && isOwnProfile) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        university: user.university || '',
        skills: user.skills || [],
        github: user.github || '',
        linkedin: user.linkedin || ''
      });
    }
  }, [user, isOwnProfile]);

  const fetchUserProfile = async () => {
    if (!userId) return;
    
    setLoadingProfile(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfileUser(data.user);
      } else {
        setError('Failed to load user profile');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const refreshUserData = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
      await fetchTrustHistory();
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchTrustHistory = async () => {
    setLoadingTrustHistory(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/trust-history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrustHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch trust history:', error);
    } finally {
      setLoadingTrustHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        updateUser(data.user);
        setIsEditing(false);
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessage = data.errors.map(err => err.msg).join(', ');
          setError(errorMessage);
        } else {
          setError(data.message || 'Failed to update profile');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const getTrustScoreColor = (score) => {
    if (score >= 90) return 'text-purple-600 bg-purple-100';
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrustScoreLabel = (score) => {
    if (score >= 90) return 'Elite';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Building';
    return 'New';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isOwnProfile && !profileUser) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
        <p className="text-gray-600">The user profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {isOwnProfile ? 'My Profile' : `${displayUser?.name || 'User'}'s Profile`}
          </h1>
          {isOwnProfile && (
            <button
              onClick={refreshUserData}
              disabled={refreshing}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 disabled:opacity-50"
              title="Refresh profile data"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
        <p className="text-gray-600 mt-2">
          {isOwnProfile 
            ? 'Manage your UniConnect profile and settings'
            : 'View user profile and information'
          }
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
            {displayUser?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">{displayUser?.name}</h2>
            <p className="text-gray-600 flex items-center justify-center md:justify-start space-x-1">
              <Mail className="w-4 h-4" />
              <span>{displayUser?.email}</span>
            </p>
            <p className="text-gray-600 flex items-center justify-center md:justify-start space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{displayUser?.university}</span>
            </p>
            <p className="text-gray-500 flex items-center justify-center md:justify-start space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(displayUser?.createdAt).toLocaleDateString()}</span>
            </p>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className={`px-4 py-2 rounded-full font-semibold ${getTrustScoreColor(displayUser?.trustScore || 0)}`}>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>{displayUser?.trustScore || 0}</span>
              </div>
            </div>
            <span className="text-xs text-gray-500">{getTrustScoreLabel(displayUser?.trustScore || 0)} Trust</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Profile Form */}
        {isOwnProfile ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2">
                  University
                </label>
                <input
                  id="university"
                  name="university"
                  type="text"
                  value={formData.university}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Tell us about yourself, your interests, and what you're looking for in collaborations..."
              />
            </div>

            {/* Skills */}
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                Skills & Technologies
              </label>
                <div className="flex space-x-2 mb-3">
                  <input
                  id="skills"
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                  disabled={!isEditing}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="e.g., React, Python, Machine Learning"
                  />
                {isEditing && (
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                )}
                </div>
              
              {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
                </div>
                )}
            </div>

            {/* Social Links */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Profile
                </label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="github"
                    name="github"
                    type="url"
                    value={formData.github}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Profile
                </label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="linkedin"
                    name="linkedin"
                    type="url"
                    value={formData.linkedin}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </form>
        ) : (
          /* Read-only profile view for other users */
          <div className="space-y-6">
            {/* Bio */}
            {displayUser?.bio && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                  {displayUser.bio}
                </div>
              </div>
            )}

            {/* Skills */}
            {displayUser?.skills && displayUser.skills.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills & Technologies
                </label>
                <div className="flex flex-wrap gap-2">
                  {displayUser.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {(displayUser?.github || displayUser?.linkedin) && (
              <div className="grid md:grid-cols-2 gap-6">
                {displayUser?.github && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub Profile
                    </label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <a
                        href={displayUser.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-gray-100 transition-all block"
                      >
                        View Profile
                      </a>
                    </div>
                  </div>
                )}

                {displayUser?.linkedin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <a
                        href={displayUser.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-gray-100 transition-all block"
                      >
                        View Profile
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trust Score History */}
      {isOwnProfile && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Trust Score History</h3>
            <button
              onClick={fetchTrustHistory}
              disabled={loadingTrustHistory}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 disabled:opacity-50"
              title="Refresh trust history"
            >
              <RefreshCw className={`w-4 h-4 ${loadingTrustHistory ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingTrustHistory ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading trust history...</p>
            </div>
          ) : trustHistory.length > 0 ? (
            <div className="space-y-4">
              {trustHistory.map((log, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      log.points > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {log.points > 0 ? '+' : ''}{log.points}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{log.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {log.action.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No trust score history yet</p>
              <p className="text-sm text-gray-500 mt-1">Complete projects and collaborate to build your trust score</p>
            </div>
          )}
        </div>
      )}

      {/* Trust Score Info */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Trust Score System</h3>
            <p className="text-primary-100">
              Your trust score increases through positive interactions, completed projects, and community engagement.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{displayUser?.trustScore || 0}</div>
            <div className="text-primary-100">Current Score</div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white/10 rounded-lg p-3">
            <Award className="w-6 h-6 mx-auto mb-1" />
            <div className="text-sm">Projects</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <Star className="w-6 h-6 mx-auto mb-1" />
            <div className="text-sm">Reviews</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <User className="w-6 h-6 mx-auto mb-1" />
            <div className="text-sm">Collaboration</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <Calendar className="w-6 h-6 mx-auto mb-1" />
            <div className="text-sm">Activity</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;