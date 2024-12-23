import { Post } from './Post';

function Feed() {
  const posts = [
    {
      id: 1,
      user: 'Sarah Wilson',
      content: 'Just finished hiking Mount Rainier! The views were absolutely breathtaking 🏔️',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
      likes: 156,
      comments: 23,
      timestamp: new Date('2024-03-10T16:30:00'),
    },
    {
      id: 2,
      user: 'John Doe',
      content: 'Just had an amazing day at the beach! 🏖️',
      likes: 24,
      comments: 5,
      timestamp: new Date('2024-03-10T15:30:00'),
    },
    {
      id: 3,
      user: 'Jane Smith',
      content: 'Check out my new photography project! 📸',
      likes: 42,
      comments: 8,
      timestamp: new Date('2024-03-10T14:15:00'),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {posts.map(post => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}

export default Feed;