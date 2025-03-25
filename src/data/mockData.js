export const mockMessages = {
  1: [
    { id: 1, sender: 'Sarah Wilson', content: 'Hey! How was your weekend?', timestamp: new Date('2024-03-10T16:20:00') },
    { id: 2, sender: 'You', content: 'It was great! I went hiking at Mount Rainier', timestamp: new Date('2024-03-10T16:25:00') },
    { id: 3, sender: 'Sarah Wilson', content: 'That sounds amazing! Would love to see some photos', timestamp: new Date('2024-03-10T16:28:00') },
    { id: 4, sender: 'You', content: "Sure! I'll share them with you", timestamp: new Date('2024-03-10T16:30:00') },
  ]
};

export const conversations = [
  {
    id: 1,
    user: "Sarah Wilson",
    lastMessage: "The hiking trip was amazing!",
    timestamp: new Date('2024-03-10T16:30:00'),
    unread: 2,
  },
  {
    id: 2,
    user: "John Doe",
    lastMessage: "See you tomorrow at the cafe",
    timestamp: new Date('2024-03-10T14:20:00'),
    unread: 0,
  },
  {
    id: 3,
    user: "Emma Thompson",
    lastMessage: "Thanks for the photography tips!",
    timestamp: new Date('2024-03-09T22:15:00'),
    unread: 0,
  }
];

export const friends = [
  {
    id: 1,
    name: "Sarah Wilson",
    status: "online",
    lastSeen: new Date()
  },
  {
    id: 2,
    name: "Emma Thompson",
    status: "online",
    lastSeen: new Date()
  },
  {
    id: 3,
    name: "John Doe",
    status: "offline",
    lastSeen: new Date('2024-03-10T15:45:00')
  },
  {
    id: 4,
    name: "Michael Brown",
    status: "offline",
    lastSeen: new Date('2024-03-10T14:30:00')
  },
  {
    id: 5,
    name: "Lisa Anderson",
    status: "online",
    lastSeen: new Date()
  }
];

export const profileData = {
  photos: [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=500&auto=format',
      caption: 'Sunset at the beach'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1682687221038-404670f05144?w=500&auto=format',
      caption: 'Mountain hiking'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=500&auto=format',
      caption: 'City lights'
    }
  ],
  posts: [
    {
      id: 1,
      content: "Just finished reading an amazing book on photography techniques! Can't wait to try out some new skills this weekend. 📚",
      likes: 45,
      comments: 12,
      timestamp: new Date('2024-03-10T14:30:00')
    },
    {
      id: 2,
      content: "Coffee and coding - perfect Sunday morning! ☕️💻",
      likes: 32,
      comments: 8,
      timestamp: new Date('2024-03-09T09:15:00')
    },
    {
      id: 3,
      content: "Excited to announce I'll be hosting a photography workshop next month! Stay tuned for details! 📸",
      likes: 89,
      comments: 24,
      timestamp: new Date('2024-03-08T18:45:00')
    }
  ]
};