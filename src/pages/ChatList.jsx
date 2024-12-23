import { conversations, friends } from '../data/mockData';
import ConversationItem from '../components/chat/ConversationItem';
import FriendsList from '../components/chat/FriendsList';

function ChatList() {
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Messages</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations */}
        <div className="md:col-span-2 space-y-2">
          {conversations.map((chat) => (
            <ConversationItem key={chat.id} chat={chat} />
          ))}
        </div>

        {/* Friends List */}
        <div className="md:col-span-1">
          <FriendsList friends={friends} />
        </div>
      </div>
    </div>
  );
}

export default ChatList;