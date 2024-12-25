import React, { useState } from 'react';

import { X, Eye, EyeOff } from 'lucide-react';

const LoginModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
      userInput: '',
      password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
  
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
      
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
  
        if (response.ok) {
          onClose();
        } else {
          const data = await response.json();
          setError(data.message || 'Login failed');
        }
      } catch (error) {
        setError('Network error occurred');
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
  
          <div className="p-8"> {/* Increased padding from p-6 to p-8 */}
            <h2 className="text-3xl text-center font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent transition-opacity mb-8"> {/* Increased margin bottom and font size */}
              Welcome Back
            </h2>
  
            <form onSubmit={handleSubmit} className="space-y-6"> {/* Increased space between form elements */}
              {/* Username/Email Field */}
              <div className="space-y-2"> {/* Added space between label and input */}
                <label className="block text-base font-medium text-gray-700">
                  Username or Email
                </label>
                <input
                  type="text"
                  name="userInput"
                  value={formData.userInput}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your username or email"
                  required
                />
              </div>
  
              {/* Password Field */}
              <div className="space-y-2"> {/* Added space between label and input */}
                <label className="block text-base font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
  
              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-sm text-center py-2"> {/* Added vertical padding */}
                  {error}
                </div>
              )}
  
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 text-lg" /* Increased padding and text size */
              >
                Sign In
              </button>
  
              {/* Forgot Password Link */}
              <div className="text-center pt-4"> {/* Added top padding */}
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot your password?
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };
  
  export default LoginModal;