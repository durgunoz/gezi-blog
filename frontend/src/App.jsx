import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AddPost from './pages/AddPost';
import Footer from './components/Footer';
import EditPost from './pages/EditPost';
import TravelChatbot from './components/TravelChatbot'; // 👈 Chatbot eklendi

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-100 relative">
        <Header />
        <main className="flex-grow p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hakkimizda" element={<About />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/add-post" element={<AddPost />} />
            <Route path="/edit/:id" element={<EditPost />} />
          </Routes>
        </main>
        <Footer />
        <TravelChatbot />
      </div>
    </Router>
  );
};

export default App;
