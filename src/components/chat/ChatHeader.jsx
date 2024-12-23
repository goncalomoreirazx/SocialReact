function ChatHeader({ user }) {
  return (
    <div className="flex items-center p-4 border-b">
      <div className="avatar">
        <div className="h-10 w-10 avatar-inner"></div>
      </div>
      <div className="ml-3">
        <h2 className="font-semibold text-gray-900">{user}</h2>
        <p className="text-sm text-gray-500">Online</p>
      </div>
    </div>
  );
}

export default ChatHeader;