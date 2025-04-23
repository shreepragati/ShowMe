import { useEffect, useState, useContext } from 'react';
import Masonry from 'react-masonry-css';
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
  const [selectedPost, setSelectedPost] = useState(null);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    async function loadData() {
      try {
        const [postsRes, followsRes] = await Promise.all([
          getPosts(),
          fetchFollows()
        ]);

        const shuffled = [...postsRes.data].sort(() => Math.random() - 0.5);
        setPosts(shuffled);

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

  const breakpointColumnsObj = {
    default: 5,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6 text-center">Explore</h2>

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex gap-4"
        columnClassName="bg-clip-padding"
      >
        {posts.map(post => (
          <div key={post.id} className="mb-4 cursor-pointer" onClick={() => setSelectedPost(post)}>
            <PostCard
              post={post}
              currentUserId={user?.id}
              followers={followers}
              following={following}
              mutuals={mutuals}
              pendingReceived={pendingReceived}
              pendingSent={pendingSent}
            />
          </div>
        ))}
      </Masonry>

      {/* Modal for expanded post */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-4"
            onClick={(e) => e.stopPropagation()} // prevent modal close on inner click
          >
            <button
              className="absolute top-2 right-4 text-2xl text-gray-600 hover:text-black"
              onClick={() => setSelectedPost(null)}
            >
              &times;
            </button>
            <PostCard
              post={selectedPost}
              currentUserId={user?.id}
              followers={followers}
              following={following}
              mutuals={mutuals}
              pendingReceived={pendingReceived}
              pendingSent={pendingSent}
              isModal={true} // optional if you want to style PostCard differently
            />
          </div>
        </div>
      )}
    </div>
  );
}
