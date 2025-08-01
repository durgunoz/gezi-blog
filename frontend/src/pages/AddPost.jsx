import { useState, useEffect } from "react";
import axios from '../axios';

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
      <h1 className="text-xl font-bold mb-4">Yeni Post Ekle</h1>
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
    <label htmlFor="category-select" className="block font-medium">Kategoriler:</label>
    <select
      id="category-select"
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
          <label className="block font-medium mb-1">Etiketler:</label>

          {/* Select alanı yukarı */}
      <select
        id="tag-select"
        value=""
        onChange={(e) => {
          const selected = parseInt(e.target.value);
          if (!selectedTagIds.includes(selected)) {
            setSelectedTagIds([...selectedTagIds, selected]);
          }
        }}
        className="w-full p-2 border rounded mb-2"
      >
        <option value="">Etiket ekle</option>
        {tags
          .filter(tag => !selectedTagIds.includes(tag.id))
          .map(tag => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
      </select>

          {/* Seçilen etiketler aşağıya alındı */}
          <div className="flex flex-wrap gap-2">
            {selectedTagIds.map(tagId => {
              const tag = tags.find(t => t.id === tagId);
              if (!tag) return null;

              return (
                <span key={tag.id} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => setSelectedTagIds(prev => prev.filter(id => id !== tag.id))}
                    className="ml-2 text-blue-800 hover:text-red-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
        
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Gönder
        </button>
      </form>
    </div>
  );
}
