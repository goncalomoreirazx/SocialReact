import { conversations } from '../data/mockData'; // Keep mock data for conversations
import ConversationItem from '../components/chat/ConversationItem';
import FriendsList from '../components/chat/FriendsList';

function ChatList() {
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Messages</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations - still using mock data */}
        <div className="md:col-span-2 space-y-2">
          {conversations.map((chat) => (
            <ConversationItem key={chat.id} chat={chat} />
          ))}
        </div>

        {/* Friends List - using real data */}
        <div className="md:col-span-1">
          <FriendsList />  {/* Remove the friends prop since we'll fetch data inside the component */}
        </div>
      </div>
    </div>
  );
}

export default ChatList;