import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);

  const [filters, setFilters] = useState({
    title: '',
    categoryId: '',
    tagId: '',
    authorId: ''
  });

  useEffect(() => {
    axios.get('http://localhost:5229/api/Post')
      .then(res => setPosts(res.data))
      .catch(err => console.error('API error:', err));

    axios.get('http://localhost:5229/api/Post/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Kategori API hatası:', err));
  }, []);

  const uniqueAuthors = Array.from(
    new Map(
      posts.filter(p => p.author && p.author.id)
        .map(post => [post.author.id, post.author])
    ).values()
  );

  const limitWords = (text, wordLimit) => {
    const words = text.split(/\s+/);
    return words.slice(0, wordLimit).join(' ') + (words.length > wordLimit ? '...' : '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-10">
      <div className="max-w-7xl mx-auto pt-6 px-6">
        {/* 🔍 Filtre Alanı */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg shadow-blue-100 mb-10 border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Başlık veya içerik ara..."
              value={filters.title}
              onChange={e => setFilters({ ...filters, title: e.target.value })}
              className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-800 placeholder-gray-600"
            />

            <select
              value={filters.categoryId}
              onChange={e => setFilters({ ...filters, categoryId: e.target.value })}
              className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-800"
            >
              <option value="">Kategori seç</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={filters.authorId}
              onChange={e => setFilters({ ...filters, authorId: e.target.value })}
              className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-800"
            >
              <option value="">Yazar seç</option>
              {uniqueAuthors.map(author => (
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
              className="bg-sky-700 hover:bg-sky-800 text-white font-semibold px-4 py-2 rounded-lg shadow-lg drop-shadow-md transition"
            >
              Filtrele
            </button>
          </div>
        </div>

        {/* 📝 Post Listesi */}
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white/90 border border-gray-200 shadow-md shadow-blue-100 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
              <h2 className="text-2xl font-semibold text-center text-gray-900 mb-1">
                <Link to={`/post/${post.id}`} className="hover:text-sky-600 hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="text-sm text-center text-gray-700 mb-4">
                {new Date(post.createdAt).toLocaleDateString()} — {post.author?.name}
              </p>
              <p className="text-gray-800 leading-relaxed text-justify mb-4">
                {limitWords(post.content, 50)}
              </p>

              {post.tags?.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {post.tags.map(tag => (
                    <span key={tag.id} className="bg-sky-100 text-sky-900 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {posts.length === 0 && (
            <p className="text-center text-gray-700 text-lg">Yükleniyor veya içerik bulunamadı.</p>
          )}
        </div>
      </div>
    </div>
  );
}
