import { useState, useEffect } from 'react';
import { sendFriendRequest, unfollowFriend } from '../services/friends';
import { useFriendContext } from '../context/FriendContext';

const baseURL = 'http://127.0.0.1:8000';

const PostCard = ({ post, currentUserId, friends }) => {
  const [ownPost, setOwnPost] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const { triggerRefresh } = useFriendContext();

  useEffect(() => {
    if (currentUserId && post.user_id) {
      setOwnPost(Number(post.user_id) === Number(currentUserId));
    }
  }, [currentUserId, post.user_id]);

  useEffect(() => {
    setIsFollowing(friends.includes(post.user));
  }, [friends, post.user]);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await unfollowFriend(post.user_id);
        setIsFollowing(false);
      } else {
        await sendFriendRequest(post.user_id);
        setIsFollowing(true);
      }
      triggerRefresh(); // 🔄 to refresh friend list in context if needed
    } catch (err) {
      console.error('Failed to toggle follow:', err);
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
          <p className="font-semibold">{post.user}</p>
        </div>

        {!ownPost && (
          <button
            onClick={handleFollowToggle}
            className={`text-sm px-3 py-1 rounded transition ${
              isFollowing
                ? ' text-green-600 hover:bg-green-200'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
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
