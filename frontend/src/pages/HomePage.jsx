import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  Users, 
  Shield, 
  MessageSquare, 
  TrendingUp, 
  Globe, 
  Lock,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Shield,
      title: 'Secure Collaboration',
      description: 'End-to-end encrypted communication with role-based access control'
    },
    {
      icon: Users,
      title: 'Cross-University Teams',
      description: 'Connect with students and researchers from universities worldwide'
    },
    {
      icon: MessageSquare,
      title: 'Real-time Chat',
      description: 'Instant messaging and file sharing within project teams'
    },
    {
      icon: TrendingUp,
      title: 'Trust Scoring',
      description: 'Build reputation through verified contributions and collaborations'
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Access diverse perspectives and expertise from around the world'
    },
    {
      icon: Lock,
      title: 'Privacy Controls',
      description: 'Granular privacy settings and NDA support for sensitive projects'
    }
  ];

  const stats = [
    { number: '500+', label: 'Active Projects' },
    { number: '2,000+', label: 'Students' },
    { number: '50+', label: 'Universities' },
    { number: '95%', label: 'Success Rate' }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Connect. Collaborate. Create.
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join the global academic network where students and researchers collaborate 
            on innovative projects with secure, real-time communication and trust-based partnerships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2 group-hover:text-purple-600 transition-colors duration-200">
                {stat.number}
              </div>
              <div className="text-gray-600 group-hover:text-gray-800 transition-colors duration-200">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose UniConnect?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the future of academic collaboration with our comprehensive platform
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors duration-200">{feature.title}</h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-200">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center hover:shadow-2xl transition-shadow duration-300">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Start Collaborating?
        </h2>
        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          Join thousands of students and researchers who are already building the future together
        </p>
        {!isAuthenticated ? (
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg inline-flex items-center space-x-2"
          >
            <span>Create Your Account</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        ) : (
          <Link
            to="/projects"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg inline-flex items-center space-x-2"
          >
            <span>Explore Projects</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        )}
      </section>

      {/* How It Works */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Get started in three simple steps
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl font-bold text-blue-600 group-hover:text-purple-600 transition-colors duration-200">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors duration-200">Create Account</h3>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-200">Sign up with your university email and verify your student status</p>
          </div>
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl font-bold text-blue-600 group-hover:text-purple-600 transition-colors duration-200">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors duration-200">Join Projects</h3>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-200">Browse available projects or create your own and invite collaborators</p>
          </div>
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl font-bold text-blue-600 group-hover:text-purple-600 transition-colors duration-200">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors duration-200">Collaborate</h3>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-200">Work together in real-time with secure communication and file sharing</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;