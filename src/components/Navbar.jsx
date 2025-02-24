import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, UserCircleIcon, PlusCircleIcon, ChatBubbleLeftIcon, UsersIcon } from '@heroicons/react/24/outline';
import LoginModal from './auth/LoginModal';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

function Navbar() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const { friendRequests, unreadMessages } = useNotifications();
  
  // Debug counter to ensure component re-renders
  const [renderCount, setRenderCount] = useState(0);
  
  useEffect(() => {
    // Increment render count on each render to prove updates
    setRenderCount(prev => prev + 1);
    
    console.log('Navbar rendering with notification counts:', { 
      friendRequests, 
      unreadMessages,
      renderCount: renderCount + 1,
      user: user?.id
    });
  }, [friendRequests, unreadMessages, user]);

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              Social React
            </Link>

            <div className="flex space-x-2">
              <Link to="/" className="nav-link text-gray-600">
                <HomeIcon className="h-6 w-6" />
                <span className="hidden md:block">Home</span>
              </Link>
              
              {user ? (
                <>
                  <Link to="/find-friends" className="nav-link text-gray-600 relative">
                    <UsersIcon className="h-6 w-6" />
                    <span className="hidden md:block">FindFriends</span>
                    {(friendRequests > 0) && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {friendRequests}
                      </span>
                    )}
                  </Link>
                  <Link to="/messages" className="nav-link text-gray-600 relative">
                    <ChatBubbleLeftIcon className="h-6 w-6" />
                    <span className="hidden md:block">Messages</span>
                    {(unreadMessages > 0) && (
                      <span 
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                        data-testid="message-badge"
                      >
                        {unreadMessages}
                      </span>
                    )}
                  </Link>
                  <Link to="/create" className="nav-link text-gray-600">
                    <PlusCircleIcon className="h-6 w-6" />
                    <span className="hidden md:block">Create</span>
                  </Link>
                  <Link to={`/profile/${user.id}`} className="nav-link text-gray-600">
                    <UserCircleIcon className="h-6 w-6" />
                    <span className="hidden md:block">Profile</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="nav-link text-gray-600 flex items-center"
                  >
                    <UserCircleIcon className="h-6 w-6" />
                    <span className="hidden md:block">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="nav-link text-gray-600 flex items-center"
                  >
                    <UserCircleIcon className="h-6 w-6" />
                    <span className="hidden md:block">Login</span>
                  </button>
                  <Link to="/register" className="nav-link text-gray-600">
                    <UserCircleIcon className="h-6 w-6" />
                    <span className="hidden md:block">Register</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}

export default Navbar;