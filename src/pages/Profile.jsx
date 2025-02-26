import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import PhotoGrid from '../components/profile/PhotoGrid';
import ProfilePosts from '../components/profile/ProfilePosts';
import { Cog6ToothIcon, UserIcon, UsersIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import EditProfileMenu from '../components/profile/EditProfileMenu';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userId } = useParams();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const headerRef = useRef(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Handle scroll behavior for header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past the threshold
        setHeaderVisible(false);
      } else {
        // Scrolling up or at the top
        setHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
        <p className="text-gray-500 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md mx-auto">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">The profile you're looking for doesn't exist or may have been removed.</p>
          <a href="/" className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Sticky Header - Visible on scroll up */}
      <div 
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 bg-white z-30 shadow-md transform transition-transform duration-300 ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ top: '64px' }} // Adjust based on your navbar height
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
              <img
                src={user.profile_picture ? `http://localhost:5000/uploads/${user.profile_picture}` : '/default-avatar.png'}
                alt={user.username}
                className="h-full w-full object-cover"
              />
            </div>
            <h2 className="font-bold text-gray-900 truncate">@{user.username}</h2>
          </div>
          <button
            onClick={() => setIsSideMenuOpen(true)}
            className="text-gray-600 hover:text-gray-900 p-2"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-4 px-4 md:pt-6 md:px-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          {/* Cover Photo Area - You could add a proper cover photo here */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-400 to-purple-500 relative">
            <button
              onClick={() => setIsSideMenuOpen(true)}
              className="absolute top-4 right-4 bg-white/70 backdrop-blur-sm text-gray-700 hover:text-gray-900 p-2 rounded-full hover:bg-white/90 transition-all"
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="px-4 sm:px-6 pb-6 pt-0 relative">
            {/* Profile Picture - Positioned to overlap the cover photo */}
            <div className="relative -mt-16 mb-4 flex justify-center sm:justify-start">
              <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
                <img
                  src={user.profile_picture ? `http://localhost:5000/uploads/${user.profile_picture}` : '/default-avatar.png'}
                  alt={user.username}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="text-center sm:text-left sm:pl-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">@{user.username}</h2>
              <div className="flex items-center justify-center sm:justify-start text-gray-500 mb-2">
                <EnvelopeIcon className="h-4 w-4 mr-1" />
                <p className="text-sm">{user.email}</p>
              </div>
              <p className="text-gray-700 mb-6 max-w-lg mx-auto sm:mx-0">
                {user.bio || "This user hasn't added a bio yet."}
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto sm:mx-0 sm:flex sm:gap-8">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <span className="block text-2xl font-bold text-gray-900">
                    {user.followers}
                  </span>
                  <span className="text-gray-500 text-sm">Followers</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <span className="block text-2xl font-bold text-gray-900">
                    {user.following}
                  </span>
                  <span className="text-gray-500 text-sm">Friends</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'posts' 
                  ? 'text-blue-500 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('posts')}
            >
              Posts
            </button>
            <button
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'photos' 
                  ? 'text-blue-500 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('photos')}
            >
              Photos
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="pb-6">
          {activeTab === 'photos' ? (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pl-2">Photos</h3>
              <PhotoGrid userId={userId} />
            </div>
          ) : (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pl-2">Posts</h3>
              <ProfilePosts userId={userId} />
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Side Menu */}
      <EditProfileMenu 
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        userData={user}
        onUpdate={(updatedData) => setUser(updatedData)}
      />
    </div>
  );
};

export default Profile;