import React, { useState, useEffect } from 'react';
import { sendFollowRequest, cancelFollowRequest, unfollowUser } from '../services/follows';
import { useFollowContext } from '../context/FollowContext';
import { Link } from 'react-router-dom';

const baseURL = 'http://127.0.0.1:8000';

const PostCard = ({ post, currentUserId }) => {
  const [ownPost, setOwnPost] = useState(false);
  const [buttonState, setButtonState] = useState('Follow'); // 'Follow', 'Pending', 'Following'
  const [loading, setLoading] = useState(false);

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
        if (post.privacy === 'public') {
          setButtonState('Following');
        } else {
          setButtonState('Pending');
        }
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
    <div className="p-4 mb-4 bg-white shadow rounded">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img
            src={post.profile_pic ? `${baseURL}${post.profile_pic}` : '/default-avatar.png'}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
          />
          <Link
            to={`/profile/${typeof post.user === 'object' ? post.user.username : post.user}`}
            className="font-semibold hover:underline"
          >
            {post.user?.username || post.user}
          </Link>
        </div>

        {!ownPost && (
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
            {loading ? 'Loading...' : buttonState}
          </button>
        )}
      </div>

      {post.text_content && <p className="mt-2">{post.text_content}</p>}

      {post.image && (
        <img
          src={`${baseURL}${post.image}`}
          alt="Post"
          className="mt-2 max-h-60 rounded"
        />
      )}

      {post.video && (
        <video
          controls
          src={`${baseURL}${post.video}`}
          className="mt-2 max-h-60 rounded"
        />
      )}
    </div>
  );
};

export default PostCard;
