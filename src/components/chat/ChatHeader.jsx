// ChatHeader.jsx
function ChatHeader({ user, isTyping }) {
  return (
    <div className="flex items-center p-4 border-b">
      <div className="relative">
        {user.profile_picture ? (
          <img 
            src={`http://localhost:5000/uploads/${user.profile_picture}`}
            alt={user.username}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-lg text-gray-500">
              {user.username[0].toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="ml-3">
        <h2 className="font-semibold text-gray-900">{user.username}</h2>
        <p className="text-sm text-gray-500">
          {isTyping ? 'Typing...' : 'Online'}
        </p>
      </div>
    </div>
  );
}

export default ChatHeader;