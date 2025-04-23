import React, { useState, useEffect } from 'react';
import { sendFollowRequest, cancelFollowRequest, unfollowUser } from '../services/follows';
import { useFollowContext } from '../context/FollowContext';
import { Link } from 'react-router-dom';

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
      {/* Avatar and Username - No background */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2 px-2 py-1 rounded-full">
        <Link
          to={`/profile/${typeof post.user === 'object' ? post.user.username : post.user}`}
          className="flex items-center gap-2"
        >
          <img
            src={post.profile_pic ? `${baseURL}${post.profile_pic}` : '/default-avatar.png'}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-white"
          />
          <span className="font-semibold text-sm text-gray-900">
            {post.user?.username || post.user}
          </span>
        </Link>

        {/* Follow button - on hover only */}
        {!ownPost && hovered && (
          <button
            onClick={handleButtonClick}
            disabled={loading}
            title={
              buttonState === 'Pending'
                ? 'Click to cancel follow request'
                : buttonState === 'Following'
                  ? 'Click to unfollow'
                  : 'Send follow request'
            }
            className={`text-sm px-3 py-1 rounded transition
              ${buttonState === 'Follow'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : buttonState === 'Pending'
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'}
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {loading ? '...' : buttonState}
          </button>
        )}
      </div>

      {/* Post Content */}
      {(post.image || post.video) && (
        <div className="w-full">
          {post.image && (
            <img
              src={`${baseURL}${post.image}`}
              alt="Post"
              className="w-full object-cover"
            />
          )}
          {post.video && (
            <video
              controls
              src={`${baseURL}${post.video}`}
              className="w-full object-cover"
            />
          )}
        </div>
      )}

      {post.text_content && (
        <div className="p-3 text-sm">
          {post.text_content}
        </div>
      )}
    </div>
  );
};

export default PostCard;
