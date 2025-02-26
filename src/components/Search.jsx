import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Close results when clicking outside
    const handleClickOutside = (e) => {
      if (!e.target.closest('#search-container') && showResults) {
        setShowResults(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showResults]);

  // Handle search input
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/search?searchTerm=${searchTerm}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleNavigateToProfile = (userId) => {
    navigate(`/profile/${userId}`);
    setShowResults(false);
    setSearchTerm('');
  };

  return (
    <div id="search-container" className="relative">
      <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm && setShowResults(true)}
          className="bg-transparent border-none focus:outline-none px-2 w-full"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSearchResults([]);
              setShowResults(false);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto z-20">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : searchResults.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {searchResults.map(user => (
                <div
                  key={user.id}
                  onClick={() => handleNavigateToProfile(user.id)}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <img
                    src={user.profile_picture ? `http://localhost:5000/uploads/${user.profile_picture}` : '/default-avatar.png'}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{user.username}</p>
                    {user.bio && (
                      <p className="text-sm text-gray-500 truncate">{user.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="p-4 text-center text-gray-500">No users found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Search;