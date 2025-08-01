import { useEffect, useState } from 'react';
import axios from '../axios';
import { Link } from 'react-router-dom';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);

  const [filters, setFilters] = useState({
    title: '',
    categoryId: '',
    authorId: ''
  });

  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    axios.get('http://localhost:5229/api/Post/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Kategori API hatası:', err));
  }, []);

  const handleFilter = () => {
    axios.get('http://localhost:5229/api/Post', {
      params: {
        title: filters.title || undefined,
        categoryId: filters.categoryId || undefined,
        authorId: filters.authorId || undefined,
        sortBy,
        sortOrder
      }
    })
      .then(res => {
        setPosts(res.data);
        const unique = Array.from(
          new Map(
            res.data.filter(p => p.author && p.author.id)
              .map(post => [post.author.id, post.author])
          ).values()
        );
        setAuthors(unique);
      })
      .catch(err => console.error('API isteği hatası:', err));
  };

  useEffect(() => {
    handleFilter();
  }, []);

  const limitWords = (text, wordLimit) => {
    const words = text.split(/\s+/);
    return words.slice(0, wordLimit).join(' ') + (words.length > wordLimit ? '...' : '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-10">
      <div className="max-w-7xl mx-auto pt-6 px-6">

        {/* 🔍 Filtreleme ve 📊 Sıralama */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">

          {/* 🔍 Filtreleme Kutusu */}
          <div className="w-full lg:w-2/3 bg-white border border-blue-200 rounded-xl shadow-sm p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <input
                type="text"
                placeholder="Başlık ara..."
                value={filters.title}
                onChange={e => setFilters({ ...filters, title: e.target.value })}
                className="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm"
              />

              <select
                aria-label="Kategori"
                value={filters.categoryId}
                onChange={e => setFilters({ ...filters, categoryId: e.target.value })}
                className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="">Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <select
                aria-label="Yazar"
                value={filters.authorId}
                onChange={e => setFilters({ ...filters, authorId: e.target.value })}
                className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="">Yazar</option>
                {authors.map(author => (
                  <option key={author.id} value={author.id}>{author.name}</option>
                ))}
              </select>

              <button
                onClick={handleFilter}
                className="bg-sky-800 hover:bg-sky-900 text-white text-sm font-medium px-4 py-2 rounded-md shadow"
              >
                Filtrele
              </button>
            </div>
          </div>

          {/* 📊 Sıralama Kutusu */}
          <div className="w-full lg:w-1/3 bg-white border border-green-200 rounded-xl shadow-sm p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <select
                aria-label="Sıralama kriteri"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-400 flex-1"
              >
                <option value="date">Tarih</option>
                <option value="title">Başlık</option>
              </select>

              <select
                aria-label="Sıralama yönü"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="asc">Artan</option>
                <option value="desc">Azalan</option>
              </select>

              <button
                onClick={handleFilter}
                className="bg-green-800 hover:bg-green-900 text-white text-sm font-medium px-4 py-2 rounded-md shadow"
              >
                Sırala
              </button>
            </div>
          </div>
        </div>

        {/* 📝 Post Listesi */}
        <div className="space-y-6">
{posts.map(post => (
  <article
    key={post.id}
    className="bg-white/90 border border-gray-200 shadow-md shadow-blue-100 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
  >
    <h1 className="text-2xl font-semibold text-center text-gray-900 mb-1">
      <Link to={`/post/${post.id}`} className="hover:text-sky-600 hover:underline">
        {post.title}
      </Link>
    </h1>
    <p className="text-sm text-center text-gray-700 mb-4">
      {new Date(post.createdAt).toLocaleDateString()} — {post.author?.name}
    </p>
    <p className="text-gray-800 leading-relaxed text-justify mb-4">
      {limitWords(post.content, 50)}
    </p>

    {post.tags?.length > 0 && (
      <ul className="flex flex-wrap justify-center gap-2">
        {post.tags.map(tag => (
          <li key={tag.id}>
            <span className="bg-sky-100 text-sky-900 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
              {tag.name}
            </span>
          </li>
        ))}
      </ul>
    )}
  </article>
))}


          {posts.length === 0 && (
            <p className="text-center text-gray-700 text-lg">Yükleniyor veya içerik bulunamadı.</p>
          )}
        </div>
      </div>
    </div>
  );
}
