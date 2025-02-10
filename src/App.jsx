import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import React, { Suspense } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import ChatList from './pages/ChatList';
import ChatRoom from './components/ChatRoom';
import Register from './pages/Register';
import FindFriends from './pages/FindFriends';
import { SocketProvider } from './contexts/SocketContext';

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
    <Router>
      <AuthProvider>
      <SocketProvider>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Feed />} /> {/* Removed ProtectedRoute */}
            <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
            <Route path="/chat/:id" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
            <Route path="/find-friends" element={<ProtectedRoute><FindFriends /></ProtectedRoute>} />
          </Routes>
          </main>
        </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
     </Suspense>
  );
}

export default App;