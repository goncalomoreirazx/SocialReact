import { useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

export const useChat = () => {
  const socket = useSocket();
  const { user } = useAuth();

  const sendMessage = useCallback((receiverId, content) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('send_message', {
        senderId: user.id,
        receiverId,
        content
      });

      const messageHandler = (message) => {
        socket.off('message_sent', messageHandler);
        socket.off('message_error', errorHandler);
        resolve(message);
      };

      const errorHandler = (error) => {
        socket.off('message_sent', messageHandler);
        socket.off('message_error', errorHandler);
        reject(error);
      };

      socket.on('message_sent', messageHandler);
      socket.on('message_error', errorHandler);

      setTimeout(() => {
        socket.off('message_sent', messageHandler);
        socket.off('message_error', errorHandler);
        reject(new Error('Message timeout'));
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