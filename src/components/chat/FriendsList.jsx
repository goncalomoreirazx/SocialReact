import { formatDistanceToNow } from 'date-fns';

function FriendsList({ friends }) {
  const onlineFriends = friends.filter(friend => friend.status === 'online');
  const offlineFriends = friends.filter(friend => friend.status === 'offline');

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">Friends</h3>
      
      {/* Online Friends */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-500 mb-3">Online - {onlineFriends.length}</h4>
        <div className="space-y-3">
          {onlineFriends.map(friend => (
            <div key={friend.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="avatar">
                    <div className="w-10 h-10 avatar-inner"></div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="font-medium text-gray-900">{friend.name}</span>
              </div>
              <span className="text-sm text-green-500">Active now</span>
            </div>
          ))}
        </div>
      </div>

      {/* Offline Friends */}
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-3">Offline - {offlineFriends.length}</h4>
        <div className="space-y-3">
          {offlineFriends.map(friend => (
            <div key={friend.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="avatar opacity-75">
                    <div className="w-10 h-10 avatar-inner"></div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
                </div>
                <span className="font-medium text-gray-600">{friend.name}</span>
              </div>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(friend.lastSeen, { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FriendsList;