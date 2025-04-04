import { useState } from 'react';
import { sendFriendRequest } from '../services/friends';

const PostCard = ({ post, currentUserId, friends }) => {
  const [requestSent, setRequestSent] = useState(false);

  const isOwnPost = post.user_id === currentUserId; // ✅ Accurate comparison
  const isAlreadyFriend = friends.includes(post.user); // friend usernames
  console.log("🔍 post.user_id:", post.user_id, typeof post.user_id);
console.log("👤 currentUserId:", currentUserId, typeof currentUserId);
console.log("✅ isOwnPost:", Number(post.user_id) === Number(currentUserId));

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
        <p className="font-semibold">{post.user}</p>

        {/* ✅ Hide ALL follow-related UI for own posts */}
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

      {post.text_content && <p className="mt-2">{post.text_content}</p>}
    </div>
  );
};

export default PostCard;
