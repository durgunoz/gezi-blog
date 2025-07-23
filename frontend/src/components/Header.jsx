// components/Header.jsx
import { Link } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; // ✅ Doğru
import { useState, useEffect } from 'react';

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          name: decoded.name,
          role: decoded.role
        });
      } catch (err) {
        console.error("Token geçersiz:", err);
        setUser(null);
      }
    }
  }, []);

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link to="/">GeziBlog</Link>
        </h1>
        <nav className="space-x-8 flex items-center">
          <Link to="/" className="hover:underline">Anasayfa</Link>
          <Link to="/hakkimizda" className="hover:underline">Hakkımızda</Link>

          {user ? (
            <>
              <span className="text-sm font-semibold">Oturum Açıldı - {user.name}</span>
              {user.role === "Author" && (
                <Link to="/post-ekle" className="hover:underline font-semibold">Post Ekle</Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Giriş Yap</Link>
              <Link to="/register" className="hover:underline">Kayıt Ol</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
