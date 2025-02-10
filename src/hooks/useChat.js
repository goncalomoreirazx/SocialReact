// src/hooks/useChat.js
import { useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

export const useChat = () => {
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (socket && user) {
      // Connect and register user
      socket.emit('user_connected', user.id);

      // Cleanup on unmount
      return () => {
        socket.disconnect();
      };
    }
  }, [socket, user]);

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

      // Wait for confirmation
      const messageHandler = (message) => {
        socket.off('message_sent', messageHandler);
        resolve(message);
      };

      const errorHandler = (error) => {
        socket.off('message_error', errorHandler);
        reject(error);
      };

      socket.on('message_sent', messageHandler);
      socket.on('message_error', errorHandler);
    });
  }, [socket, user]);

  const startTyping = useCallback((receiverId) => {
    if (socket && user) {
      socket.emit('typing_start', {
        senderId: user.id,
        receiverId
      });
    }
  }, [socket, user]);

  const stopTyping = useCallback((receiverId) => {
    if (socket && user) {
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