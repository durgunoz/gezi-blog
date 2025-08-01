import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from '../axios';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const [userRole, setUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5229/api/Post/${id}`)
      .then(res => setPost(res.data))
      .catch(err => console.error("Detay API hatası:", err));
  }, [id]);

  useEffect(() => {
    axios.get(`http://localhost:5229/api/Comment/by-post/${id}`)
      .then(res => setComments(res.data))
      .catch(err => console.error("Yorumlar alınamadı:", err));
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        setCurrentUserId(userId);
        setUserRole(role);
      } catch (err) {
        console.error("JWT çözümlenemedi:", err);
      }
    }
  }, []);

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("Yorumu silmek için giriş yapmalısınız.");

    try {
      await axios.delete(`http://localhost:5229/api/Comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error("Yorum silinemedi:", err);
      alert("Yorum silinirken bir hata oluştu.");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Yorum yapmak için giriş yapmalısınız.");

    try {
      await axios.post(`http://localhost:5229/api/Comment/${id}`,
        { message: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment("");
      const res = await axios.get(`http://localhost:5229/api/Comment/by-post/${id}`);
      setComments(res.data);
    } catch (err) {
      console.error("Yorum eklenemedi:", err);
      alert("Yorum eklenemedi.");
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Bu yazıyı silmek istediğinize emin misiniz?")) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5229/api/Post/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Yazı silindi.");
      navigate("/");
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Yazı silinemedi.");
    } finally {
      setIsDeleting(false);
    }
  };

  const canDelete = userRole === "Admin" || String(currentUserId) === String(post?.author?.id);

  if (!post) return <p className="text-center mt-10">Yükleniyor...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-4">
        {new Date(post.createdAt).toLocaleDateString()} — {post.author?.name}
      </p>

      {post.imageUrl && (
        <picture>
          <source srcSet={post.imageUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp')} type="image/webp" />
          <img
            src={post.imageUrl}
            alt={post.title}
            width="800"
            height="450"
            loading="lazy"
            decoding="async"
            className="mb-4 w-full max-w-full h-auto rounded"
          />
        </picture>
      )}

      <p className="text-gray-800 leading-relaxed mb-6">{post.content}</p>

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => (
            <span key={tag.id} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              {tag.name}
            </span>
          ))}
        </div>
      )}

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

      {canDelete && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleDeletePost}
            disabled={isDeleting}
            className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isDeleting ? "Siliniyor..." : "🗑 Yazıyı Sil"}
          </button>
          <button
            onClick={() => navigate(`/edit/${id}`)}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors duration-200">
            ✏️ Yazıyı Düzenle
          </button>
        </div>
      )}

      <div className="mt-10 mb-4">
        <h2 className="text-xl font-semibold">Yorumlar</h2>
      </div>

      {comments.length > 0 ? (
        comments.map(comment => {
          const canDeleteComment =
            userRole === "Admin" ||
            String(currentUserId) === String(comment.userId) ||
            String(currentUserId) === String(post?.author?.id);

          return (
            <div key={comment.id} className="border-t py-2 flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold">{comment.name} ({comment.email})</p>
                <p className="text-gray-700">{comment.message}</p>
              </div>
              {canDeleteComment && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-red-500 text-sm hover:underline ml-4"
                >
                  Sil
                </button>
              )}
            </div>
          );
        })
      ) : (
        <p className="text-gray-500">Henüz yorum yapılmamış.</p>
      )}

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
