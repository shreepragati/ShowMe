import React, { useEffect, useState, useContext, useRef } from 'react';
import Masonry from 'react-masonry-css';
import { motion, AnimatePresence } from 'framer-motion';
import { getPosts } from '../services/posts';
import { fetchFollows } from '../services/follows';
import PostCard from '../components/PostCard';
import { AuthContext } from '../context/AuthContext';
import { XCircle, Clock } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [mutuals, setMutuals] = useState([]);
  const [pendingReceived, setPendingReceived] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [masonryKey, setMasonryKey] = useState(0);
  const masonryRef = useRef(null);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [postsRes, followsRes] = await Promise.all([
          getPosts(),
          fetchFollows()
        ]);

        const sortedPosts = postsRes.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setPosts(sortedPosts);

        const followersList = (followsRes.data?.followers || []).map((f) => f.id);
        const followingList = (followsRes.data?.following || []).map((f) => f.id);
        const mutualFollows = (followsRes.data?.mutual_follows || []).map((f) => f.id);
        const received = (followsRes.data?.requests_received || []).map((r) => r.id);
        const sent = (followsRes.data?.requests_sent || []).map((r) => r.id);

        setFollowers(followersList);
        setFollowing(followingList);
        setMutuals(mutualFollows);
        setPendingReceived(received);
        setPendingSent(sent);
      } catch (err) {
        console.error('Error loading posts or follow data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const breakpointColumnsObj = {
    default: 5,
    1200: 4,
    992: 3,
    768: 2,
    576: 1,
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  // Function to force Masonry to re-render
  const forceMasonryRender = () => {
    setMasonryKey(prevKey => prevKey + 1);
  };

  useEffect(() => {
    if (!loading && posts.length > 0) {
      forceMasonryRender();
    }
  }, [loading, posts]);

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-950 min-h-screen">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center text-white tracking-tight">
        Explore
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Clock className="animate-spin text-4xl text-gray-400" />
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          <Masonry
            key={masonryKey}
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
            ref={masonryRef}
            style={{ display: 'flex' }}
          >
            {posts.map((post) => (
              <div  // Changed from motion.div to a simple div
                key={post.id}
                className="mb-4"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
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
        </div>
      )}

      <AnimatePresence>
        {selectedPost && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
            onClick={() => setSelectedPost(null)}
          >
            <div
              className="relative bg-gray-900 border border-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 md:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-white transition-colors"
                onClick={() => setSelectedPost(null)}
              >
                <XCircle size={30} />
              </button>
              <PostCard
                post={selectedPost}
                currentUserId={user?.id}
                followers={followers}
                following={following}
                mutuals={mutuals}
                pendingReceived={pendingReceived}
                pendingSent={pendingSent}
                isModal={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
