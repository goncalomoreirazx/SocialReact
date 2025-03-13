import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MagnifyingGlassIcon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Handle click outside of search component
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key to close results
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        setShowResults(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  // Handle search input
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowResults(false);
      setError(null);
      return;
    }

    setIsSearching(true);
    setShowResults(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/search?searchTerm=${encodeURIComponent(searchTerm)}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching:', error);
      setError('Failed to search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleNavigateToProfile = (userId) => {
    navigate(`/profile/${userId}`);
    setShowResults(false);
    setSearchTerm('');
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (searchTerm.trim()) {
      setShowResults(true);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div id="search-container" ref={searchContainerRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-2 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus-within:ring-2 focus-within:ring-blue-300 dark:focus-within:ring-blue-500 focus-within:bg-white dark:focus-within:bg-gray-800">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-300 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputFocus}
          className="bg-transparent border-none focus:outline-none px-2 w-full text-sm sm:text-base text-gray-700 dark:text-gray-200"
          aria-label="Search users"
          aria-expanded={showResults}
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 focus:outline-none focus:text-gray-600 dark:focus:text-gray-100 p-1 rounded-full"
            aria-label="Clear search"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50 border border-gray-200 dark:border-gray-700 animate-fade-scale"
          style={{ minWidth: '250px' }} 
        >
          {isSearching ? (
            <div className="p-4 text-center">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 dark:border-blue-400 mb-2"></div>
              <p className="text-gray-500 dark:text-gray-300">Searching users...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500 dark:text-red-400">
              <p>{error}</p>
              <button 
                onClick={handleSearch}
                className="mt-2 text-blue-500 dark:text-blue-400 hover:underline text-sm"
              >
                Try again
              </button>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {searchResults.map(user => (
                <div
                  key={user.id}
                  onClick={() => handleNavigateToProfile(user.id)}
                  className="flex items-center p-3 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer transition-colors duration-150"
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${user.username}'s profile`}
                  onKeyDown={(e) => e.key === 'Enter' && handleNavigateToProfile(user.id)}
                >
                  {user.profile_picture ? (
                    <img
                      src={`http://localhost:5000/uploads/${user.profile_picture}`}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300">
                      <UserIcon className="h-6 w-6" />
                    </div>
                  )}
                  <div className="ml-3 overflow-hidden">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{user.username}</p>
                    {user.bio && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{user.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <div className="inline-block p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 dark:text-gray-300" />
              </div>
              <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">No users found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Search;