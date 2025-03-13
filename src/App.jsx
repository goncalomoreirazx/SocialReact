import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { MessageNotificationProvider } from './contexts/MessageNotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import React, { Suspense } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import ChatList from './pages/ChatList';
import ChatRoom from './components/ChatRoom';
import Register from './pages/Register';
import FriendsPage from './pages/FindFriends';

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <MessageNotificationProvider>
              <NotificationProvider>
                <SocketProvider>
                  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
                    <Navbar />
                    <main className="container mx-auto px-4 py-8">
                      <Routes>
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<Feed />} />
                        <Route 
                          path="/profile/:userId" 
                          element={
                            <ProtectedRoute>
                              <Profile />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/create" 
                          element={
                            <ProtectedRoute>
                              <CreatePost />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/messages" 
                          element={
                            <ProtectedRoute>
                              <ChatList />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/chat/:id" 
                          element={
                            <ProtectedRoute>
                              <ChatRoom />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/friends" 
                          element={
                            <ProtectedRoute>
                              <FriendsPage />
                            </ProtectedRoute>
                          } 
                        />
                      </Routes>
                    </main>
                  </div>
                </SocketProvider>
              </NotificationProvider>
            </MessageNotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </Suspense>
  );
}

export default App;