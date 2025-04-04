import { useEffect, useState, useContext } from 'react';
import { getPosts } from '../services/posts';
import { fetchFriendList } from '../services/friends';
import PostCard from '../components/PostCard';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [friendUsernames, setFriendUsernames] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    getPosts()
      .then(res => setPosts(res.data))
      .catch(err => console.error("Failed to fetch posts", err));

    fetchFriendList()
      .then(res => {
        const friendList = res.data.friends.map(f => f.username);
        setFriendUsernames(friendList);
      })
      .catch(err => console.error("Failed to fetch friend list", err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Feed</h2>
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={user?.id}           // ✅ Pass actual user ID
          friends={friendUsernames}          // ✅ Pass usernames
        />
      ))}
    </div>
  );
}
