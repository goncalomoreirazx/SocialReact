import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { XMarkIcon, PhotoIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const EditProfileMenu = ({ isOpen, onClose, userData, onUpdate }) => {
    const [bio, setBio] = useState(userData?.bio || '');
    const [newProfilePhoto, setNewProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const menuRef = useRef(null);
    const { token } = useAuth();
    
    // Reset form when user data changes
    useEffect(() => {
        if (userData) {
            setBio(userData.bio || '');
            setPhotoPreview(null);
            setNewProfilePhoto(null);
            setError(null);
            setSuccessMessage('');
        }
    }, [userData]);
    
    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);
    
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewProfilePhoto(file);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setNewProfilePhoto(null);
        setPhotoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage('');
        
        const formData = new FormData();
        formData.append('bio', bio);
        if (newProfilePhoto) {
            formData.append('photo', newProfilePhoto);
        }
       
        try {
            const response = await axios.put(
                `http://localhost:5000/api/users/${userData.id}/update`,
                formData,
                {
                    headers: { 
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            setSuccessMessage('Profile updated successfully!');
            onUpdate(response.data);
            
            // Auto close after success
            setTimeout(() => {
                onClose();
            }, 1500);
            
        } catch (error) {
            console.error('Error updating profile:', error.response?.data || error);
            setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 md:bg-opacity-0 z-40" onClick={onClose}></div>
            )}
            
            {/* Slide-in menu */}
            <div 
                ref={menuRef}
                className={`fixed inset-y-0 right-0 w-full sm:w-96 max-w-full z-50 bg-white shadow-xl transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}
                aria-hidden={!isOpen}
            >
                <div className="flex flex-col h-full">
                    <div className="p-4 sm:p-6 border-b">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                            <button 
                                onClick={onClose}
                                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                aria-label="Close menu"
                            >
                                <XMarkIcon className="h-6 w-6 text-gray-500" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        {successMessage && (
                            <div className="mb-4 bg-green-50 p-3 rounded-lg flex items-center text-green-700">
                                <CheckCircleIcon className="h-5 w-5 mr-2" />
                                {successMessage}
                            </div>
                        )}
                        
                        {error && (
                            <div className="mb-4 bg-red-50 p-3 rounded-lg text-red-700">
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Write something about yourself..."
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    rows="4"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                                
                                {photoPreview ? (
                                    <div className="relative w-32 h-32 mx-auto mb-3">
                                        <img 
                                            src={photoPreview} 
                                            alt="Profile preview" 
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                        <button 
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                                        >
                                            <XMarkIcon className="h-5 w-5 text-gray-700" />
                                        </button>
                                    </div>
                                ) : (
                                    userData?.profile_picture && (
                                        <div className="w-32 h-32 mx-auto mb-3 rounded-full overflow-hidden border-2 border-gray-200">
                                            <img 
                                                src={`http://localhost:5000/uploads/${userData.profile_picture}`} 
                                                alt="Current profile" 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/default-avatar.png';
                                                }}
                                            />
                                        </div>
                                    )
                                )}
                                
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                                
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <PhotoIcon className="h-5 w-5 mr-2 text-gray-500" />
                                    {photoPreview ? 'Change Photo' : 'Upload New Photo'}
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <div className="p-4 sm:p-6 border-t">
                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditProfileMenu;