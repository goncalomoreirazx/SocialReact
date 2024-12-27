import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import PhotoGrid from '../components/profile/PhotoGrid';
import ProfilePosts from '../components/profile/ProfilePosts';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import EditProfileMenu from '../components/profile/EditProfileMenu';


const Profile = () => {
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);
 const { userId } = useParams();
 const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

 useEffect(() => {
   const fetchProfile = async () => {
     try {
       const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
       setUser(response.data);
     } catch (error) {
       console.error('Error fetching profile:', error);
     } finally {
       setLoading(false);
     }
   };

   fetchProfile();
 }, [userId]);

 if (loading) {
   return (
     <div className="flex justify-center items-center min-h-screen">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
     </div>
   );
 }

 if (!user) {
   return <div className="text-center py-8">User not found</div>;
 }

 return (
   <div className="max-w-2xl mx-auto p-4">
     <div className="bg-white rounded-lg shadow-md p-6 mb-8">
     <div className="relative"> {/* Add this wrapper */}
        <button
          onClick={() => setIsSideMenuOpen(true)}
          className="absolute top-0 right-0 text-gray-600 hover:text-gray-900 p-2"
        >
          <Cog6ToothIcon className="h-6 w-6" />
        </button>
        <EditProfileMenu 
              isOpen={isSideMenuOpen}
              onClose={() => setIsSideMenuOpen(false)}
              userData={user}
              onUpdate={(updatedData) => setUser(updatedData)}
            />
       <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
         <div className="relative h-32 w-32 rounded-full overflow-hidden">
           <img
             src={user.profile_picture ? `http://localhost:5000/uploads/${user.profile_picture}` : '/default-avatar.png'}
             alt={user.username}
             className="h-full w-full object-cover"
           />
         </div>
         
         <div className="text-center md:text-left flex-1">
           <h2 className="text-3xl font-bold text-gray-900">@{user.username}</h2>
           <p className="text-gray-500 mb-2">{user.email}</p>
           <p className="text-gray-700 mb-4">{user.bio}</p>
           
           <div className="flex gap-8 justify-center md:justify-start">
             <div className="text-center">
               <span className="block text-2xl font-bold text-gray-900">
                 {user.followers}
               </span>
               <span className="text-gray-500">Followers</span>
             </div>
             <div className="text-center">
               <span className="block text-2xl font-bold text-gray-900">
                 {user.following}
               </span>
               <span className="text-gray-500">Following</span>
             </div>
           </div>
         </div>
       </div>
     </div>
     </div>

     <PhotoGrid userId={userId} />
     <ProfilePosts userId={userId} />

     
   </div>
 );
};

export default Profile;