import { Post } from '../Post';

function ProfilePosts({ posts }) {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Posts</h3>
      <div className="space-y-6">
        {posts.map((post) => (
          <Post key={post.id} post={{ ...post, user: 'John Doe' }} />
        ))}
      </div>
    </div>
  );
}

export default ProfilePosts;