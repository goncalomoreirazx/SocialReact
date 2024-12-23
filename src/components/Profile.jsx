import { profileData } from '../data/mockData';
import PhotoGrid from './profile/PhotoGrid';
import ProfilePosts from './profile/ProfilePosts';

function Profile() {
  const user = {
    name: 'John Doe',
    username: '@johndoe',
    bio: 'Photography enthusiast | Travel lover | Coffee addict',
    followers: 1234,
    following: 567,
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="avatar">
            <div className="h-32 w-32 avatar-inner"></div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500 mb-4">{user.username}</p>
            <p className="text-gray-700 mb-6 max-w-md">{user.bio}</p>
            
            <div className="flex gap-8 justify-center md:justify-start">
              <div className="text-center">
                <span className="block text-2xl font-bold text-gray-900">{user.followers}</span>
                <span className="text-gray-500">Followers</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-gray-900">{user.following}</span>
                <span className="text-gray-500">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PhotoGrid photos={profileData.photos} />
      <ProfilePosts posts={profileData.posts} />
    </div>
  );
}

export default Profile;