import React, { useState, useEffect } from 'react';
import { sendFollowRequest, cancelFollowRequest, unfollowUser } from '../services/follows';
import { useFollowContext } from '../context/FollowContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const baseURL = 'http://127.0.0.1:8000';

const PostCard = ({ post, currentUserId }) => {
  const [ownPost, setOwnPost] = useState(false);
  const [buttonState, setButtonState] = useState('Follow');
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const { following, sentRequests, triggerRefresh } = useFollowContext();
  const postUserId = post.user_id || post.user?.id;

  useEffect(() => {
    if (!postUserId || !currentUserId) return;

    if (Number(postUserId) === Number(currentUserId)) {
      setOwnPost(true);
      return;
    }

    if (following.includes(postUserId)) {
      setButtonState('Following');
    } else if (sentRequests.includes(postUserId)) {
      setButtonState('Pending');
    } else {
      setButtonState('Follow');
    }
  }, [following, sentRequests, postUserId, currentUserId]);

  const handleButtonClick = async () => {
    if (loading || ownPost) return;
    setLoading(true);

    try {
      if (buttonState === 'Follow') {
        await sendFollowRequest(postUserId);
        setButtonState(post.privacy === 'public' ? 'Following' : 'Pending');
      } else if (buttonState === 'Pending') {
        await cancelFollowRequest(postUserId);
        setButtonState('Follow');
      } else if (buttonState === 'Following') {
        await unfollowUser(postUserId);
        setButtonState('Follow');
      }

      triggerRefresh();
    } catch (err) {
      console.error('Follow action failed:', err.message || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative mb-4 rounded-xl overflow-hidden shadow hover:shadow-lg transition-all bg-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar and Username */}
      <motion.div
        className="absolute top-2 left-2 z-10 flex items-center gap-2 px-2 py-1 rounded-full bg-black/50 backdrop-blur-md"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to={`/profile/${typeof post.user === 'object' ? post.user.username : post.user}`}
          className="flex items-center gap-2"
        >
          <img
            src={post.profile_pic ? `${post.profile_pic}` : `https://ui-avatars.com/api/?name=${post.user?.username || post.user}&background=0D8ABC&color=fff&rounded=true&size=128`}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-white"
          />
          <span className="font-semibold text-sm text-white">
            {post.user?.username || post.user}
          </span>
        </Link>
      </motion.div>

      {/* Follow button - top right on hover */}
      {!ownPost && hovered && (
        <motion.button
          onClick={handleButtonClick}
          disabled={loading}
          title={
            buttonState === 'Pending'
              ? 'Click to cancel follow request'
              : buttonState === 'Following'
                ? 'Click to unfollow'
                : 'Send follow request'
          }
          className={`absolute top-2 right-2 z-10 text-sm px-3 py-1 rounded transition
            ${buttonState === 'Follow'
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : buttonState === 'Pending'
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'}
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {loading ? '...' : buttonState}
        </motion.button>
      )}

      {/* Post Content */}
      {(post.image || post.video) && (
        <div className="w-full">
          {post.image && (
            <img
              src={`${post.image}`}
              alt="Post"
              className="w-full object-cover"
            />
          )}
          {post.video && (
            <video
              controls
              src={`${post.video}`}
              className="w-full object-cover"
            />
          )}
        </div>
      )}

      {post.text_content && (
        <div className="p-3 text-sm text-gray-800 bg-teal-700/70 rounded-b-xl"> {/* Ensure text is readable */}
          {post.text_content}
        </div>
      )}
    </div>
  );
};

export default PostCard;