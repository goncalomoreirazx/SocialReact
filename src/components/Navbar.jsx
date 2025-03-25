import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  HomeIcon, 
  UserCircleIcon, 
  PlusCircleIcon, 
  ChatBubbleLeftIcon, 
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import LoginModal from './auth/LoginModal';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useMessageNotifications } from '../contexts/MessageNotificationContext';
import ThemeToggle from './theme/ThemeToggle';
import Search from './Search';

function Navbar() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { friendRequests } = useNotifications();
  const { unreadCount, clearUnreadCount } = useMessageNotifications();
  const mobileMenuRef = useRef(null);
  
  // Handle clicking outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Clear unread count when clicking on Messages
  useEffect(() => {
    const handleMessagesClick = () => {
      clearUnreadCount();
      setIsMobileMenuOpen(false);
    };
    
    const messagesLinks = document.querySelectorAll('a[href="/messages"]');
    messagesLinks.forEach(link => {
      link.addEventListener('click', handleMessagesClick);
    });
    
    return () => {
      messagesLinks.forEach(link => {
        link.removeEventListener('click', handleMessagesClick);
      });
    };
  }, [clearUnreadCount]);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation links renderer for DRY code
  const renderNavLinks = (isMobile = false) => {
    const baseClasses = isMobile 
      ? "flex items-center gap-3 w-full p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
      : "nav-link text-gray-600 dark:text-gray-300 relative";
  
    const baseIconClasses = isMobile ? "h-6 w-6 text-blue-500 dark:text-blue-400" : "h-6 w-6";
    const textClasses = isMobile ? "text-gray-700 dark:text-gray-200" : "hidden md:block";
    
    return (
      <>
        <Link to="/" className={baseClasses} onClick={() => setIsMobileMenuOpen(false)}>
          <HomeIcon className={baseIconClasses} />
          <span className={textClasses}>Home</span>
        </Link>
        
        {user ? (
          <>
            <Link to="/friends" className={baseClasses} onClick={() => setIsMobileMenuOpen(false)}>
              <div className="relative">
                <UsersIcon className={baseIconClasses} />
                {friendRequests > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {friendRequests}
                  </span>
                )}
              </div>
              <span className={textClasses}>Friends</span>
              {friendRequests > 0 && isMobile && (
                <span className="ml-auto bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-xs px-2 py-1 rounded-full">
                  {friendRequests} new
                </span>
              )}
            </Link>
            
            <Link to="/messages" className={baseClasses} onClick={() => setIsMobileMenuOpen(false)}>
              <div className="relative">
                <ChatBubbleLeftIcon className={baseIconClasses} />
                {unreadCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                    data-testid="message-badge"
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className={textClasses}>Messages</span>
              {unreadCount > 0 && isMobile && (
                <span className="ml-auto bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-xs px-2 py-1 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </Link>
            
            <Link to={`/profile/${user.id}`} className={baseClasses} onClick={() => setIsMobileMenuOpen(false)}>
              <UserCircleIcon className={baseIconClasses} />
              <span className={textClasses}>Profile</span>
            </Link>
            
            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className={baseClasses}
            >
              <ArrowRightOnRectangleIcon className={baseIconClasses} />
              <span className={textClasses}>Logout</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setIsLoginModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className={baseClasses}
            >
              <UserCircleIcon className={baseIconClasses} />
              <span className={textClasses}>Login</span>
            </button>
            
            <Link to="/register" className={baseClasses} onClick={() => setIsMobileMenuOpen(false)}>
              <UserCircleIcon className={baseIconClasses} />
              <span className={textClasses}>Register</span>
            </Link>
          </>
        )}
      </>
    );
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Desktop Search */}
            <div className="flex items-center gap-4">
              <Link to="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                Social React
              </Link>
              {user && (
                <div className="hidden md:block w-64">
                  <Search />
                </div>
              )}
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {renderNavLinks()}
              <ThemeToggle className="ml-1" />
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <ThemeToggle className="mr-1" />
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden fixed top-16 inset-x-0 z-40 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-100 dark:border-gray-700 animate-fade-scale origin-top transition-colors duration-200"
          style={{ maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}
        >
          <div className="p-4">
            {/* Mobile Search */}
            {user && (
              <div className="mb-4">
                <Search />
              </div>
            )}
            
            <div className="flex flex-col space-y-1">
              {renderNavLinks(true)}
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}

export default Navbar;