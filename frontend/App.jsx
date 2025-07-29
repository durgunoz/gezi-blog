import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 relative">
        <Header />
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hakkimizda" element={<About />} />
            <Route path="/giris" element={<Login />} />
            <Route path="/kayit" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
