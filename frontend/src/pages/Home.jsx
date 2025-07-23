import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);

  const [filters, setFilters] = useState({
    title: "",
    categoryId: "",
    tagId: "",
    authorId: ""
  });

  // ✅ API çağrıları (Postlar + Kategoriler + Yazarlar)
  useEffect(() => {
    axios.get('http://localhost:5229/api/Post')
      .then(res => setPosts(res.data))
      .catch(err => console.error('API error:', err));

    axios.get('http://localhost:5229/api/Post/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Kategori API hatası:', err));

    axios.get('http://localhost:5229/api/Post/authors')
      .then(res => setAuthors(res.data))
      .catch(err => console.error('Yazar API hatası:', err));
  }, []);

  const limitWords = (text, wordLimit) => {
    const words = text.split(/\s+/);
    return words.slice(0, wordLimit).join(' ') + (words.length > wordLimit ? '...' : '');
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-8">
      {/* 🔍 Filtre Alanı */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <input
          type="text"
          placeholder="Başlığa göre ara"
          value={filters.title}
          onChange={e => setFilters({ ...filters, title: e.target.value })}
          className="border px-4 py-2 rounded w-full"
        />

        <select
          value={filters.categoryId}
          onChange={e => setFilters({ ...filters, categoryId: e.target.value })}
          className="border px-4 py-2 rounded w-full"
        >
          <option value="">Kategori seç</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          value={filters.authorId}
          onChange={e => setFilters({ ...filters, authorId: e.target.value })}
          className="border px-4 py-2 rounded w-full"
        >
          <option value="">Yazar seç</option>
          {authors.map(author => (
            <option key={author.id} value={author.id}>{author.name}</option>
          ))}
        </select>

        <button
          onClick={() => {
            axios.get('http://localhost:5229/api/Post', {
              params: {
                title: filters.title,
                categoryId: filters.categoryId || undefined,
                authorId: filters.authorId || undefined
              }
            })
              .then(res => setPosts(res.data))
              .catch(err => console.error('Filtreleme hatası:', err));
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Filtrele
        </button>
      </div>

      {/* 📝 Post Listesi */}
        {posts.map(post => (
          <div key={post.id} className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold text-center mb-2">
              <Link to={`/post/${post.id}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>
            <p className="text-center text-gray-500 text-sm mb-4">
              {new Date(post.createdAt).toLocaleDateString()} — {post.author?.name}
            </p>
            <p className="text-gray-700 mb-4">{limitWords(post.content, 50)}</p>

            {post.tags?.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {post.tags.map(tag => (
                  <span key={tag.id} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}


      {posts.length === 0 && (
        <p className="text-center text-gray-500">Yükleniyor veya veri bulunamadı.</p>
      )}
    </div>
  );
}
