import React, { useState, useRef } from 'react';
import { Eye, EyeOff, Camera, Loader } from 'lucide-react';

const RegisterForm = ({ onSuccess }) => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

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

  const removeImage = () => {
    setPreviewImage(null);
    setFormData(prev => ({
      ...prev,
      profilePicture: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      setIsSubmitting(true);
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword') {
          submitData.append(key, formData[key]);
        }
      });
  
      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          body: submitData
        });
  
        const data = await response.json();
  
        if (response.ok) {
          console.log('Registration successful', data);
          // Clear the form
          setFormData({
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            birthDate: '',
            profilePicture: null
          });
          setPreviewImage(null);
          // Call the success callback
          onSuccess();
        } else {
          setErrors(data.errors || { general: data.message || 'Registration failed' });
        }
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ general: 'Network error occurred' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="w-full bg-gray-100 py-6 px-4 min-h-[calc(100vh-64px)] sm:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Create your account
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Join our community and start sharing
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-5 sm:p-6 md:p-8 animate-fade-in">
          <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Two-column layout for larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Email Field */}
                <div className="space-y-1">
                  <label htmlFor="email" className="text-sm sm:text-base text-gray-700 font-medium block">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Username Field */}
                <div className="space-y-1">
                  <label htmlFor="username" className="text-sm sm:text-base text-gray-700 font-medium block">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Choose a username"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.username}</p>
                  )}
                </div>
              </div>

              {/* Another two-column layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Password Field */}
                <div className="space-y-1">
                  <label htmlFor="password" className="text-sm sm:text-base text-gray-700 font-medium block">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Create a password"
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
                  {errors.password && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="text-sm sm:text-base text-gray-700 font-medium block">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Birth Date Field */}
              <div className="space-y-1">
                <label htmlFor="birthDate" className="text-sm sm:text-base text-gray-700 font-medium block">
                  Birth Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="birthDate"
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                />
                {errors.birthDate && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.birthDate}</p>
                )}
              </div>

              {/* Profile Picture Field */}
              <div className="space-y-2">
                <label htmlFor="profile-picture" className="text-sm sm:text-base text-gray-700 font-medium block">
                  Profile Picture <span className="text-gray-500 text-xs sm:text-sm">(optional)</span>
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {previewImage ? (
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Profile preview"
                        className="w-24 h-24 object-cover rounded-full border-2 border-blue-100 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors duration-200"
                        aria-label="Remove image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : null}
                  
                  <div className={`flex-1 ${previewImage ? 'w-auto' : 'w-full'}`}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="profilePicture"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                      id="profile-picture"
                    />
                    <label
                      htmlFor="profile-picture"
                      className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm sm:text-base font-medium py-2 px-4 rounded-md flex items-center justify-center border border-blue-300 w-full transition-colors duration-200"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      {previewImage ? 'Change Photo' : 'Upload Profile Picture'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <p className="text-sm text-gray-700 mb-2 font-medium">Password requirements:</p>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1 pl-5 list-disc">
                  <li>At least 6 characters long</li>
                  <li>We recommend including upper and lowercase letters, numbers, and special characters</li>
                </ul>
              </div>

              {/* Terms and Privacy */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-600">
                    I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                  </label>
                </div>
              </div>

              {/* General Error Message */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md">
                  {errors.general}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-md px-6 py-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>

              {/* Login Link */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Sign in
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;