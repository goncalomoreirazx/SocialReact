import { useCallback, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

export const useChat = () => {
  const socket = useSocket();
  const { user } = useAuth();
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Check if socket is connected when the hook is initialized
  if (socket && socket.connected !== isSocketConnected) {
    setIsSocketConnected(socket.connected);
  }

  const sendMessage = useCallback((receiverId, content, replyToId = null) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        console.error('Socket not available');
        reject(new Error('Socket not connected'));
        return;
      }

      if (!socket.connected) {
        console.error('Socket not connected, attempting to reconnect');
        socket.connect();
        reject(new Error('Socket not connected, please try again'));
        return;
      }

      const messageData = {
        senderId: user.id,
        receiverId,
        content,
        replyToId
      };

      console.log('Sending message via socket:', messageData);
      
      socket.emit('send_message', messageData);

      // Listen for confirmation or error
      const messageHandler = (message) => {
        console.log('Message confirmation received:', message);
        if (message.sender_id === user.id && message.receiver_id === receiverId) {
          socket.off('message_sent', messageHandler);
          socket.off('message_error', errorHandler);
          clearTimeout(timeoutId);
          resolve(message);
        }
      };

      const errorHandler = (error) => {
        console.error('Message error received:', error);
        socket.off('message_sent', messageHandler);
        socket.off('message_error', errorHandler);
        clearTimeout(timeoutId);
        reject(error);
      };

      socket.on('message_sent', messageHandler);
      socket.on('message_error', errorHandler);

      // Set timeout to prevent hanging if no response
      const timeoutId = setTimeout(() => {
        console.warn('Message send timeout');
        socket.off('message_sent', messageHandler);
        socket.off('message_error', errorHandler);
        reject(new Error('Message timeout - no response from server'));
      }, 8000); // Increased timeout for better reliability
    });
  }, [socket, user]);

  const startTyping = useCallback((receiverId) => {
    if (socket) {
      socket.emit('typing_start', {
        senderId: user.id,
        receiverId
      });
    }
  }, [socket, user]);

  const stopTyping = useCallback((receiverId) => {
    if (socket) {
      socket.emit('typing_stop', {
        senderId: user.id,
        receiverId
      });
    }
  }, [socket, user]);

  return {
    sendMessage,
    startTyping,
    stopTyping
  };
};