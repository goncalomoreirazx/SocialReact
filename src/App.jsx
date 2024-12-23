import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import Profile from './components/Profile';
import CreatePost from './components/CreatePost';
import ChatList from './components/ChatList';
import ChatRoom from './components/ChatRoom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/messages" element={<ChatList />} />
            <Route path="/chat/:id" element={<ChatRoom />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;