import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from 'react';

export default function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          name: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
          role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
        });
      } catch (err) {
        console.error("Token geçersiz:", err);
        setUser(null);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5229/api/author/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Çıkış yapılamadı:", err);
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-md sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-700 hover:scale-105 transition-transform drop-shadow-sm">
        <Link to="/">GeziBlog</Link>
      </h1>

      <nav className="flex items-center gap-6 text-gray-800 font-medium drop-shadow">
        <Link to="/" className="hover:text-blue-700 transition">Anasayfa</Link>
        <Link to="/hakkimizda" className="hover:text-blue-700 transition">Hakkımızda</Link>

        {user ? (
          <>
            <span className="text-sm text-gray-800 font-semibold drop-shadow-sm">
              Merhaba, <span className="text-blue-800">{user.name}</span>
            </span>

            {(user.role === "Author" || user.role === "Admin") && (
              <Link
                to="/add-post"
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 transition text-sm drop-shadow-sm"
              >
                ➕ Post Ekle
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="text-red-700 hover:text-red-800 transition text-sm font-medium drop-shadow-sm"
            >
              Çıkış Yap
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-700 transition drop-shadow-sm">Giriş Yap</Link>
            <Link to="/register" className="hover:text-blue-700 transition drop-shadow-sm">Kayıt Ol</Link>
          </>
        )}
      </nav>
    </div>
  </header>

  );
}
