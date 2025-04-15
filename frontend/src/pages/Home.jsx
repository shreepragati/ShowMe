// src/pages/Home.jsx
import { useEffect, useState, useContext } from 'react';
import { getPosts } from '../services/posts';
import { fetchFollows } from '../services/follows';  // Updated to use fetchFollows
import PostCard from '../components/PostCard';
import { AuthContext } from '../context/AuthContext';
import UserSearch from '../components/UserSearch';

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
          fetchFollows()  // This should work now with fetchFollows
        ]);

        setPosts(postsRes.data);

        const followersList = (followsRes.data?.followers || []).map(f => f.id);
        const followingList = (followsRes.data?.following || []).map(f => f.id);
        const mutualFollows = (followsRes.data?.mutual_follows || []).map(f => f.id);

        const received = (followsRes.data?.requests_received || []).map(r => r.id); // Received requests
        const sent = (followsRes.data?.requests_sent || []).map(r => r.id); // Sent requests

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
      <div className="flex justify-center mb-6">
      <UserSearch />
    n </div>
      <h2 className="text-xl font-bold mb-4">Feed</h2>
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={user?.id}
          followers={followers}      // ✅ Followers list
          following={following}      // ✅ Following list
          mutuals={mutuals}          // ✅ Mutual follows
          pendingReceived={pendingReceived}  // ✅ Pending follow requests received
          pendingSent={pendingSent}         // ✅ Pending follow requests sent
        />
      ))}
    </div>
  );
}
