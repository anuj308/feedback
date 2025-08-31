import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForms } from '../Context/StoreContext';
import { api, endpoints } from '../utils/api';
import UserProfileDropdown from './UserProfileDropdown';

const HomeNavbar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, userData, forms } = useForms();

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleCreateForm = async () => {
    try {
      console.log("🆕 Creating new form...");
      const response = await api.post(endpoints.forms.create, {
        formTitle: "Untitled Form",
        formDescription: "",
        questions: [], // Start with empty questions array
      });
      console.log("✅ Form created successfully:", response.data);
      navigate(`/create/${response.data.data.form._id}`);
    } catch (error) {
      console.error("❌ Failed to create form:", error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left side - Logo/Brand */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                <path d="M8 6h4v2H8V6zM8 10h4v2H8v-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Feedback App</h1>
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search forms by title..."
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-600 transition-colors"
              />
            </div>
          </form>
        </div>

        {/* Right side - Actions & Profile */}
        <div className="flex items-center space-x-4">
          
          {/* Create Form Button */}
          <button
            onClick={handleCreateForm}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Form
          </button>

          {/* Forms Count (optional info) */}
          {forms && forms.length > 0 && (
            <div className="hidden sm:flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>{forms.length} form{forms.length !== 1 ? 's' : ''}</span>
            </div>
          )}

          {/* User Profile Dropdown */}
          {isAuthenticated && userData ? (
            <UserProfileDropdown user={userData} />
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar;
