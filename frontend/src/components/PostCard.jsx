import { useState } from 'react';
import { sendFriendRequest } from '../services/friends';

const PostCard = ({ post, currentUsername, friends }) => {
  const [requestSent, setRequestSent] = useState(false);

  const isOwnPost = post.user === currentUsername;
  const isAlreadyFriend = friends.includes(post.user); 
  
  const handleFollow = async () => {
    try {
      // Call friend request by resolving username to ID — or simulate in frontend
      const res = await sendFriendRequest(post.user); // assuming you make this work
      setRequestSent(true);
    } catch (err) {
      console.error('Failed to send friend request:', err);
      
    }
  };

  return (
    <div className="p-4 mb-4 bg-white shadow rounded">
      <div className="flex items-center justify-between">
        <p className="font-semibold">{post.user}</p>

        {!isOwnPost && !isAlreadyFriend && !requestSent && (
          <button
            onClick={handleFollow}
            className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Follow
          </button>
        )}

        {requestSent && <span className="text-sm text-gray-500">Request Sent</span>}
        {isAlreadyFriend && <span className="text-sm text-green-600">Following</span>}
      </div>
      

      {post.text_content && <p className="mt-2">{post.text_content}</p>}
    </div>
    
    
  );
};

export default PostCard;
