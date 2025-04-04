import { useState } from 'react';
import { sendFriendRequest } from '../services/friends';

const baseURL = 'http://127.0.0.1:8000'; // 🔧 Change to env variable for production

const PostCard = ({ post, currentUserId, friends }) => {
  const [requestSent, setRequestSent] = useState(false);

  const isOwnPost = post.user_id === currentUserId;
  const isAlreadyFriend = friends.includes(post.user);

  const handleFollow = async () => {
    try {
      await sendFriendRequest(post.user_id);
      setRequestSent(true);
    } catch (err) {
      console.error('Failed to send friend request:', err);
    }
  };

  return (
    <div className="p-4 mb-4 bg-white shadow rounded">
      <div className="flex items-center justify-between">
        {/* 👤 Profile image + username */}
        <div className="flex items-center space-x-2">
          <img
            src={
              post.profile_pic
                ? `${baseURL}${post.profile_pic}`
                : '/default-avatar.png'
            }
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
          />
          <p className="font-semibold">{post.user}</p>
        </div>

        {/* ✅ Follow button logic */}
        {!isOwnPost && (
          <>
            {!isAlreadyFriend && !requestSent && (
              <button
                onClick={handleFollow}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Follow
              </button>
            )}
            {requestSent && (
              <span className="text-sm text-gray-500">Request Sent</span>
            )}
            {isAlreadyFriend && !requestSent && (
              <span className="text-sm text-green-600">Following</span>
            )}
          </>
        )}
      </div>

      {/* 📝 Caption */}
      {post.text_content && <p className="mt-2">{post.text_content}</p>}

      {/* 🖼️ Post Image */}
      {post.image && (
        <img
          src={`${baseURL}${post.image}`}
          alt="Post"
          className="mt-2 max-h-60 rounded"
        />
      )}

      {/* 🎥 Post Video */}
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
