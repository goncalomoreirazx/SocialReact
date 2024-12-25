import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, UserCircleIcon, PlusCircleIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import LoginModal from '../components/auth/LoginModal';  // Make sure to import from the correct path

function Navbar() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
              <Link to="/messages" className="nav-link text-gray-600">
                <ChatBubbleLeftIcon className="h-6 w-6" />
                <span className="hidden md:block">Messages</span>
              </Link>
              <Link to="/create" className="nav-link text-gray-600">
                <PlusCircleIcon className="h-6 w-6" />
                <span className="hidden md:block">Create</span>
              </Link>
              <Link to="/profile" className="nav-link text-gray-600">
                <UserCircleIcon className="h-6 w-6" />
                <span className="hidden md:block">Profile</span>
              </Link>
              {/* Changed Link to button for Login */}
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
            </div>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}

export default Navbar;