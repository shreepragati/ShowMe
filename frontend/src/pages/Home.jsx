import { useEffect, useState } from 'react';
import { getPosts } from '../services/posts';

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getPosts().then(res => setPosts(res.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Feed</h2>
      {posts.map(post => (
        <div key={post.id} className="p-4 mb-4 bg-white shadow rounded">
          <p><strong>{post.user}</strong>:</p>
          {post.text_content && <p>{post.text_content}</p>}
          {post.image && <img src={post.image} alt="Post" className="mt-2 max-h-60 rounded" />}
          {post.video && <video controls src={post.video} className="mt-2 max-h-60 rounded" />}
        </div>
      ))}
    </div>
  );
}
