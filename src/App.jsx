import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import ChatList from './pages/ChatList';
import ChatRoom from './components/ChatRoom';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Feed />} /> {/* Removed ProtectedRoute */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
            <Route path="/chat/:id" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
          </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;