import { useState } from "react";

export default function PreferenceModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    age: "",
    gender: "NotSpecified",
    nationality: "",
    occupation: "",
    city: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
const handleSubmit = async () => {
  const token = localStorage.getItem("token");

  try {
    // Önce kullanıcı profili var mı diye kontrol et
    const check = await fetch("http://localhost:5229/api/userprofiles/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const method = check.ok ? "PUT" : "POST"; // Varsa güncelle, yoksa oluştur

    const res = await fetch("http://localhost:5229/api/userprofiles", {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      onSave?.();
      onClose();
    } else {
      const data = await res.json();
      alert(data.message || "Hata oluştu.");
    }
  } catch (err) {
    console.error(err);
    alert("Sunucu hatası");
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-bold text-indigo-700 mb-4">🧭 Seyahat Bilgilerin</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block font-medium mb-1">Yaş</label>
            <input
              name="age"
              type="number"
              value={form.age}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Cinsiyet</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            >
              <option value="NotSpecified">Belirtmek istemiyorum</option>
              <option value="Male">Erkek</option>
              <option value="Female">Kadın</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Uyruk</label>
            <input
              name="nationality"
              value={form.nationality}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Meslek</label>
            <input
              name="occupation"
              value={form.occupation}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium mb-1">Şehir</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            className="text-sm bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
