import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5229/api/Author/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/"); // anasayfaya yönlendir
    } catch (err) {
      setError("Giriş başarısız. E-posta veya şifre hatalı.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Giriş Yap</h2>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Şifre"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          className="w-full border px-4 py-2 rounded"
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Giriş Yap
        </button>
        <p className="text-center text-sm text-gray-600">
  Hesabınız yok mu?{" "}
  <a href="/register" className="text-blue-600 hover:underline">Kayıt Ol</a>
</p>
      </form>
    </div>
  );
}
