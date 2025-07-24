import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // ✅ Post detayını çek
  useEffect(() => {
    axios.get(`http://localhost:5229/api/Post/${id}`)
      .then(res => setPost(res.data))
      .catch(err => console.error("Detay API hatası:", err));
  }, [id]);

  // ✅ Yorumları çek
  useEffect(() => {
    axios.get(`http://localhost:5229/api/Comment/by-post/${id}`)
      .then(res => setComments(res.data))
      .catch(err => console.error("Yorumlar alınamadı:", err));
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Yorum yapmak için giriş yapmalısınız.");
      return;
    }

    try {
      await axios.post(`http://localhost:5229/api/Comment/${id}`,
        { message: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewComment(""); // input temizle
      // tekrar yükle
      const res = await axios.get(`http://localhost:5229/api/Comment/by-post/${id}`);
      setComments(res.data);
    } catch (err) {
      console.error("Yorum eklenemedi:", err);
      alert("Yorum eklenemedi.");
    }
  };

  if (!post) return <p className="text-center mt-10">Yükleniyor...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-4">
        {new Date(post.createdAt).toLocaleDateString()} — {post.author?.name}
      </p>
      {post.imageUrl && (
        <img src={post.imageUrl} alt={post.title} className="mb-4 w-full rounded" />
      )}
      <p className="text-gray-800 leading-relaxed mb-6">{post.content}</p>

      {/* Etiketler */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => (
            <span key={tag.id} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Kategoriler */}
      {post.categories?.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold">Kategoriler:</h3>
          <ul className="list-disc list-inside">
            {post.categories.map(cat => (
              <li key={cat.id}>{cat.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Yorumlar */}
      <div className="mt-8">
        <h3 className="font-semibold mb-2">Yorumlar:</h3>
        {comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} className="border-t py-2">
              <p className="text-sm font-semibold">{comment.name} ({comment.email})</p>
              <p className="text-gray-700">{comment.message}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Henüz yorum yapılmamış.</p>
        )}
      </div>

      {/* Yorum Ekleme Alanı */}
      <form onSubmit={handleCommentSubmit} className="mt-6">
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Yorumunuzu yazın..."
          className="w-full border p-3 rounded resize-none"
          rows={4}
          required
        />
        <button
          type="submit"
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Yorum Gönder
        </button>
      </form>
    </div>
  );
}
