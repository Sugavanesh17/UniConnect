import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import SearchableDropdown from '../components/common/SearchableDropdown.jsx';
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  Building,
  Star,
  Calendar,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const UsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Filter options for the dropdown
  const filterOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'student', label: 'Students' },
    { value: 'admin', label: 'Admins' }
  ];

  // Sort options for the dropdown
  const sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'trustScore', label: 'Trust Score' },
    { value: 'recent', label: 'Recently Joined' },
    { value: 'university', label: 'University' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, filter, sortBy]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.university.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (filter !== 'all') {
      filtered = filtered.filter(user => user.role === filter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'trustScore':
          return b.trustScore - a.trustScore;
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'university':
          return a.university.localeCompare(b.university);
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
  };

  const getTrustScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">
            Discover and connect with students and researchers
          </p>
        </div>
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
                placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <SearchableDropdown
              options={filterOptions}
              value={filter}
              onChange={val => { setFilter(val); }}
              placeholder="Filter by role..."
              className="w-48"
            />

            <SearchableDropdown
              options={sortOptions}
              value={sortBy}
              onChange={val => { setSortBy(val); }}
              placeholder="Sort by..."
              className="w-48"
            />
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((userItem) => (
            <div key={userItem._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <span className="text-white text-lg font-medium">
                        {userItem.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {userItem.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {userItem.university}
                      </p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTrustScoreColor(userItem.trustScore)} group-hover:scale-105 transition-transform duration-200`}>
                    {userItem.trustScore}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{userItem.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Building className="w-4 h-4" />
                    <span className="truncate">{userItem.university}</span>
                </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(userItem.createdAt).toLocaleDateString()}</span>
              </div>

                  {userItem.skills && userItem.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                      {userItem.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:scale-105 transition-transform duration-200"
                    >
                      {skill}
                    </span>
                  ))}
                      {userItem.skills.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          +{userItem.skills.length - 3}
                    </span>
                  )}
                </div>
              )}

                  {/* Action Button */}
                  <Link
                    to={`/profile/${userItem._id}`}
                    className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium group-hover:scale-105 hover:shadow-md"
                    >
                    <span>View Profile</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
            </div>
          </div>
        ))}
      </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filter !== 'all' ? 'No users found' : 'No users available'}
          </h3>
          <p className="text-gray-600">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'No users have joined yet'
            }
          </p>
        </div>
      )}

      {/* Results Count */}
      {filteredUsers.length > 0 && (
        <div className="text-center text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      )}
    </div>
  );
};

export default UsersPage;