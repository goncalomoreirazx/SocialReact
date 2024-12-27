import React, { useState } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/outline';

const EditProfileMenu = ({ isOpen, onClose, userData, onUpdate }) => {
    const [bio, setBio] = useState(userData?.bio || '');
    const [newProfilePhoto, setNewProfilePhoto] = useState(null);
   
    const handleSubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('bio', bio);
      if (newProfilePhoto) {
        formData.append('profilePicture', newProfilePhoto);
      }
   
      try {
        const response = await axios.put(
          `http://localhost:5000/api/users/${userData.id}/update`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        );
        onUpdate(response.data);
        onClose();
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    };

    return (
        <div className={`fixed inset-y-0 right-0 w-80 mt-16 bg-white shadow-xl transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button onClick={onClose}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
     
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full border rounded p-2"
                  rows="4"
                />
              </div>
     
              <div>
                <label className="block text-sm font-medium mb-2">Change Profile Picture</label>
                <input
                  type="file"
                  onChange={(e) => setNewProfilePhoto(e.target.files[0])}
                  className="w-full"
                  accept="image/*"
                />
              </div>
     
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      );
     };

export default EditProfileMenu;