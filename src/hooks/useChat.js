import { useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

export const useChat = () => {
  const socket = useSocket();
  const { user } = useAuth();

  const sendMessage = useCallback((receiverId, content, replyToId = null) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      console.log('Sending message via useChat hook:', {
        senderId: user.id,
        receiverId,
        content,
        replyToId
      });

      socket.emit('send_message', {
        senderId: user.id,
        receiverId,
        content,
        replyToId
      });

      // Listen for a response with this specific message
      const messageHandler = (message) => {
        console.log('Received message confirmation:', message);
        if (message.sender_id === user.id && 
            message.receiver_id === receiverId && 
            message.content === content) {
          // This is our message
          socket.off('receive_message', messageHandler);
          socket.off('message_error', errorHandler);
          resolve(message);
        }
      };

      const errorHandler = (error) => {
        console.error('Message error received:', error);
        socket.off('receive_message', messageHandler);
        socket.off('message_error', errorHandler);
        reject(error);
      };

      // Listen for the receive_message event instead of message_sent
      socket.on('receive_message', messageHandler);
      socket.on('message_error', errorHandler);

      // Set a timeout to prevent hanging if no response
      setTimeout(() => {
        socket.off('receive_message', messageHandler);
        socket.off('message_error', errorHandler);
        console.warn('Message sending timed out after 5 seconds');
        // Not rejecting since the message might have been sent successfully
        // Just resolving with null to allow the UI to continue
        resolve(null);
      }, 5000);
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