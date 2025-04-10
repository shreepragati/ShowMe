import { useState, useEffect } from 'react';
import { sendFriendRequest, unfollowFriend, cancelFriendRequest } from '../services/friends';
import { useFriendContext } from '../context/FriendContext';

const baseURL = 'http://127.0.0.1:8000';

const PostCard = ({ post, currentUserId, friends, pendingRequests, sentRequests }) => {
  const [ownPost, setOwnPost] = useState(false);
  const [buttonState, setButtonState] = useState('Follow'); // 'Follow', 'Requested', 'Following'
  const { triggerRefresh } = useFriendContext();

  const postUserId = post.user_id || post.user?.id;

  useEffect(() => {
    if (currentUserId && postUserId) {
      setOwnPost(Number(postUserId) === Number(currentUserId));
    }
  }, [currentUserId, postUserId]);

  useEffect(() => {
    if (friends.includes(postUserId)) {
      setButtonState('Following');
    } else if (sentRequests.includes(postUserId)) {
      setButtonState('Requested');
    } else {
      setButtonState('Follow');
    }
  }, [friends, sentRequests, postUserId]);

  const handleButtonClick = async () => {
    try {
      if (buttonState === 'Follow') {
        await sendFriendRequest(postUserId);
        setButtonState('Requested');
      } else if (buttonState === 'Requested') {
        await cancelFriendRequest(postUserId);
        setButtonState('Follow');
      } else if (buttonState === 'Following') {
        await unfollowFriend(postUserId);
        setButtonState('Follow');
      }

      triggerRefresh();
    } catch (err) {
      console.error('Action failed:', err);
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
          <p className="font-semibold">{post.user?.username || post.user}</p>
        </div>

        {!ownPost && (
          <button
            onClick={handleButtonClick}
            className={`text-sm px-3 py-1 rounded transition ${
              buttonState === 'Follow'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : buttonState === 'Requested'
                ? 'text-yellow-400 hover:bg-yellow-500'
                : 'text-green-600 hover:bg-green-200'
            }`}
          >
            {buttonState}
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
