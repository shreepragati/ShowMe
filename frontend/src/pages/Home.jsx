import { useEffect, useState, useContext } from 'react';
import { getPosts } from '../services/posts';
import { fetchFriendList } from '../services/friends';
import PostCard from '../components/PostCard';
import { AuthContext } from '../context/AuthContext';
import UserSearch from '../components/UserSearch';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [friendIds, setFriendIds] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    async function loadData() {
      try {
        const [postsRes, friendsRes] = await Promise.all([
          getPosts(),
          fetchFriendList()
        ]);

        setPosts(postsRes.data);

        const friends = (friendsRes.data?.friends || []).map(f => f.id);
        const pending = (friendsRes.data?.pending_requests || []).map(r => r.sender_id); // received
        const sent = (friendsRes.data?.sent_requests || []).map(r => r.receiver_id);     // sent

        setFriendIds(friends);
        setPendingRequests(pending);
        setSentRequests(sent);

      } catch (err) {
        console.error("Error loading posts or friends:", err);
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
          friends={friendIds}               // ✅ ID-based friends
          pendingRequests={pendingRequests} // ✅ pending requests (received)
          sentRequests={sentRequests}       // ✅ sent requests
        />
      ))}
    </div>
  );
}
