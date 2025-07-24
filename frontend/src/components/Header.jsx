import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from 'react';

export default function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // yönlendirme için

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);

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
      console.log("Çıkış butonuna tıklandı"); // ✅ Bu satır gelsin mi?

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
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold transition-transform duration-300 hover:scale-110">
          <Link to="/">GeziBlog</Link>
        </h1>
        <nav className="space-x-8 flex items-center">
          <Link to="/" className="hover:underline">Anasayfa</Link>
          <Link to="/hakkimizda" className="hover:underline">Hakkımızda</Link>

          {user ? (
            <>
              <span className="text-sm font-semibold">Oturum Açıldı - {user.name}</span>

              {(user.role === "Author" || user.role === "Admin") && (
                <Link to="/add-post" className="hover:underline font-semibold">Post Ekle</Link>
              )}

              <button
                onClick={handleLogout}
                className="hover:underline text-red-300 font-semibold ml-4"
              >
                Çıkış Yap
              </button>
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
