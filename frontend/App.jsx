import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';

// ✨ Sayfaları lazy yükle
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 relative">
        <Header />
        <main className="p-4">
          <Suspense fallback={<div className="text-center py-10">Yükleniyor...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/hakkimizda" element={<About />} />
              <Route path="/giris" element={<Login />} />
              <Route path="/kayit" element={<Register />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
