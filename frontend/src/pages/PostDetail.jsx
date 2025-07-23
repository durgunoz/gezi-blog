import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5229/api/Post/${id}`)
      .then(res => setPost(res.data))
      .catch(err => console.error("Detay API hatası:", err));
  }, [id]);

  if (!post) return <p className="text-center mt-10">Yükleniyor...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-4">
        {new Date(post.createdAt).toLocaleDateString()} — {post.author?.name}
      </p>
      <img src={post.imageUrl} alt={post.title} className="mb-4 w-full rounded" />
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
      {post.comments?.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-2">Yorumlar:</h3>
          {post.comments.map(comment => (
            <div key={comment.id} className="border-t py-2">
              <p className="text-sm font-semibold">{comment.name} ({comment.email})</p>
              <p className="text-gray-700">{comment.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
