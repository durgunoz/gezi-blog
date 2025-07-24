import { useState, useEffect } from "react";
import axios from "axios";

export default function AddPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  useEffect(() => {
    // Kategorileri çek
    axios.get("http://localhost:5229/api/Post/categories")
      .then(res => setCategories(res.data))
      .catch(err => console.error("Kategori alınamadı:", err));

    // Etiketleri çek
    axios.get("http://localhost:5229/api/Post/tags")
      .then(res => setTags(res.data))
      .catch(err => console.error("Etiket alınamadı:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      await axios.post("http://localhost:5229/api/Post", {
        title,
        content,
        imageUrl,
        isPublished,
        categoryIds: selectedCategoryIds,
        tagIds: selectedTagIds
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert("Post başarıyla eklendi!");
      setTitle("");
      setContent("");
      setImageUrl("");
      setIsPublished(false);
      setSelectedCategoryIds([]);
      setSelectedTagIds([]);
    } catch (err) {
      console.error("Post gönderilemedi:", err);
      alert("Bir hata oluştu.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Yeni Post Ekle</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Başlık"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="İçerik"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Resim URL'si"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full p-2 border rounded"
        />

        {/* Kategori seçimi */}
        <div>
          <label className="block font-medium">Kategoriler:</label>
          <select
            multiple
            value={selectedCategoryIds}
            onChange={(e) =>
              setSelectedCategoryIds(Array.from(e.target.selectedOptions, o => parseInt(o.value)))
            }
            className="w-full p-2 border rounded"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Etiket seçimi */}
        <div>
          <label className="block font-medium">Etiketler:</label>
          <select
            multiple
            value={selectedTagIds}
            onChange={(e) =>
              setSelectedTagIds(Array.from(e.target.selectedOptions, o => parseInt(o.value)))
            }
            className="w-full p-2 border rounded"
          >
            {tags.map(tag => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <label>Yayınla</label>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Gönder
        </button>
      </form>
    </div>
  );
}
