// src/pages/Home.jsx
import { useEffect, useState, useContext } from 'react';
import { getPosts } from '../services/posts';
import { fetchFollows } from '../services/follows';
import PostCard from '../components/PostCard';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [mutuals, setMutuals] = useState([]);
  const [pendingReceived, setPendingReceived] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    async function loadData() {
      try {
        const [postsRes, followsRes] = await Promise.all([
          getPosts(),
          fetchFollows()
        ]);

        setPosts(postsRes.data);

        const followersList = (followsRes.data?.followers || []).map(f => f.id);
        const followingList = (followsRes.data?.following || []).map(f => f.id);
        const mutualFollows = (followsRes.data?.mutual_follows || []).map(f => f.id);

        const received = (followsRes.data?.requests_received || []).map(r => r.id);
        const sent = (followsRes.data?.requests_sent || []).map(r => r.id);

        setFollowers(followersList);
        setFollowing(followingList);
        setMutuals(mutualFollows);
        setPendingReceived(received);
        setPendingSent(sent);

      } catch (err) {
        console.error("Error loading posts or follow data:", err);
      }
    }

    loadData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Feed</h2>
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={user?.id}
          followers={followers}
          following={following}
          mutuals={mutuals}
          pendingReceived={pendingReceived}
          pendingSent={pendingSent}
        />
      ))}
    </div>
  );
}
