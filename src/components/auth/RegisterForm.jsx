import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    profilePicture: null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        newErrors.birthDate = 'You must be at least 13 years old';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword') { // Don't send confirmPassword to backend
          submitData.append(key, formData[key]);
        }
      });
  
      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          body: submitData // Keep FormData for file upload
        });
  
        if (response.ok) {
          // Handle successful registration
          const data = await response.json();
          console.log('Registration successful', data);
          // You might want to redirect or show a success message
        } else {
          const errorData = await response.json();
          setErrors(errorData.errors || { general: errorData.message || 'Registration failed' });
        }
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ general: 'Network error occurred' });
      }
    }
  };

  return (
    <div className="w-full bg-gray-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-base text-gray-700 font-medium block">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full text-base px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Username Field */}
              <div className="space-y-1">
                <label className="text-base text-gray-700 font-medium block">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full text-base px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  placeholder="Choose a username"
                />
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="text-base text-gray-700 font-medium block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full text-base px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <label className="text-base text-gray-700 font-medium block">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full text-base px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Birth Date Field */}
              <div className="space-y-1">
                <label className="text-base text-gray-700 font-medium block">
                  Birth Date
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full text-base px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
                {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
              </div>

              {/* Profile Picture Field */}
              <div className="space-y-2">
                <label className="text-base text-gray-700 font-medium block">
                  Profile Picture
                </label>
                <input
                  type="file"
                  name="profilePicture"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                  id="profile-picture"
                />
                <label
                  htmlFor="profile-picture"
                  className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 text-base font-semibold py-2 px-4 rounded-md flex items-center justify-center border border-blue-300 w-full"
                >
                  Upload Profile Picture
                </label>
                {previewImage && (
                  <div className="mt-3 flex justify-center">
                    <img
                      src={previewImage}
                      alt="Profile preview"
                      className="w-24 h-24 object-cover rounded-full"
                    />
                  </div>
                )}
              </div>

              {/* General Error Message */}
              {errors.general && (
                <div className="text-red-500 text-base mt-3 text-center">
                  {errors.general}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white text-base font-semibold rounded-md px-6 py-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;