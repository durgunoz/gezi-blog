import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';        // 🆕 Giriş sayfası
import Register from './pages/Register';  // 🆕 Kayıt sayfası

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hakkimizda" element={<About />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/login" element={<Login />} />         {/* 🆕 Giriş */}
            <Route path="/register" element={<Register />} />      {/* 🆕 Kayıt */}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
