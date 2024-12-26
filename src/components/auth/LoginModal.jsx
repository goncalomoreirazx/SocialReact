import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
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

        <div className="p-8">
          <h2 className="text-3xl text-center font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent transition-opacity mb-8">
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
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

            <div className="space-y-2">
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

            {error && (
              <div className="text-red-500 text-sm text-center py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 text-lg"
            >
              Sign In
            </button>

            <div className="text-center pt-4">
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