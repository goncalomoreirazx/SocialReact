import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    userInput: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);
  const initialFocusRef = useRef(null);

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && initialFocusRef.current) {
      initialFocusRef.current.focus();
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: formData.userInput,
          password: formData.password,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        login(data.user, data.token);
        onClose();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      aria-modal="true"
      role="dialog"
      aria-labelledby="login-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-scale"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6 sm:p-8">
          <h2 
            id="login-modal-title" 
            className="text-2xl sm:text-3xl text-center font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent transition-opacity mb-6 sm:mb-8"
          >
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="userInput" className="block text-sm sm:text-base font-medium text-gray-700">
                Username or Email
              </label>
              <input
                id="userInput"
                ref={initialFocusRef}
                type="text"
                name="userInput"
                value={formData.userInput}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                placeholder="Enter your username or email"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-700">
                  Password
                </label>
                <a href="#" className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div 
                className="bg-red-50 text-red-600 text-sm p-3 rounded-md" 
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 text-sm sm:text-base disabled:bg-blue-400 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/register" className="text-blue-600 hover:text-blue-800 hover:underline">
                  Register
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;