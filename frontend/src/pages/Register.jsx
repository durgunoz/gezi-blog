import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5229/api/Author/register", form);
      localStorage.setItem("token", res.data.token);
      navigate("/"); // başarılıysa anasayfaya yönlendir
    } catch (err) {
      setError("Kayıt başarısız. E-posta kullanılıyor olabilir.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Kayıt Ol</h2>
        <input
          type="text"
          placeholder="Adınız"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full border px-4 py-2 rounded"
          required
        />
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
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Kayıt Ol
        </button>
      </form>
    </div>
  );
}
