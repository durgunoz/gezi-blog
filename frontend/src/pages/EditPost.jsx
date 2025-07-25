import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [categoryIds, setCategoryIds] = useState([]);
  const [tagIds, setTagIds] = useState([]);

  const [allCategories, setAllCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`http://localhost:5229/api/Post/${id}`);
      const data = res.data;

      setPost(data);
      setTitle(data.title);
      setContent(data.content);
      setImageUrl(data.imageUrl);
      setIsPublished(data.isPublished);
      setCategoryIds(data.categories.map(c => c.id));
      setTagIds(data.tags.map(t => t.id));
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    axios.get("http://localhost:5229/api/Post/categories")
      .then(res => setAllCategories(res.data));

    axios.get("http://localhost:5229/api/Post/tags")
      .then(res => setAllTags(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.put(`http://localhost:5229/api/Post/${id}`, {
        title,
        content,
        imageUrl,
        isPublished,
        categoryIds,
        tagIds
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert("Yazı başarıyla güncellendi.");
      navigate(`/post/${id}`);
    } catch (err) {
      console.error("Güncelleme hatası:", err);
      alert("Yazı güncellenemedi.");
    }
  };

  if (!post) return <p className="text-center mt-10">Yükleniyor...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Yazıyı Düzenle</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Başlık"
          className="w-full border p-2 rounded"
          required
        />

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="İçerik"
          className="w-full border p-2 rounded resize-none"
          rows={6}
          required
        />

        <input
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          placeholder="Görsel URL"
          className="w-full border p-2 rounded"
        />

        <div>
          <label className="mr-2 font-medium">Yayınlansın mı?</label>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={e => setIsPublished(e.target.checked)}
          />
        </div>

        <div>
          <h3 className="font-semibold">Kategoriler:</h3>
          <div className="flex flex-wrap gap-2">
            {allCategories.map(cat => (
              <label key={cat.id} className="text-sm">
                <input
                  type="checkbox"
                  checked={categoryIds.includes(cat.id)}
                  onChange={() => {
                    setCategoryIds(prev =>
                      prev.includes(cat.id)
                        ? prev.filter(id => id !== cat.id)
                        : [...prev, cat.id]
                    );
                  }}
                />
                <span className="ml-1">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold">Etiketler:</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <label key={tag.id} className="text-sm">
                <input
                  type="checkbox"
                  checked={tagIds.includes(tag.id)}
                  onChange={() => {
                    setTagIds(prev =>
                      prev.includes(tag.id)
                        ? prev.filter(id => id !== tag.id)
                        : [...prev, tag.id]
                    );
                  }}
                />
                <span className="ml-1">{tag.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Kaydet
        </button>
      </form>
    </div>
  );
}
