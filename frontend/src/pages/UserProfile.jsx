import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPosts } from '../services/posts';
import axios from 'axios';
import { sendFollowRequest, unfollowUser } from '../services/follows';  // Update import name

const baseURL = 'http://127.0.0.1:8000';

export default function UserProfile() {
  const { id } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);  // For follow/unfollow button
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch user profile
    axios.get(`${baseURL}/api/profile/${id}/`)
      .then(res => setUserProfile(res.data))
      .catch(err => {
        console.error("Failed to load user profile", err);
        setError('Failed to load user profile');
      });

    // Fetch user posts
    getPosts()
      .then(res => {
        const filtered = res.data.filter(p => p.user.id.toString() === id);
        setUserPosts(filtered);
      })
      .catch(err => {
        console.error("Failed to load posts", err);
        setError('Failed to load posts');
      })
      .finally(() => setLoadingPosts(false));
  }, [id]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(id);  // Assuming unfollowUser sends a request to unfollow
        setIsFollowing(false);
      } else {
        await sendFollowRequest(id);  // Use sendFollowRequest here
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Error following/unfollowing', err);
      setError('Error following/unfollowing user');
    }
  };

  if (!userProfile) return <div>Loading user profile...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 text-center">
      {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
      <img
        src={userProfile.profile_pic ? `${baseURL}${userProfile.profile_pic}` : '/default-avatar.png'}
        alt="Profile"
        className="w-24 h-24 rounded-full mx-auto object-cover border mb-2"
      />
      <h2 className="text-2xl font-semibold">{userProfile.username}</h2>
      <p className="text-gray-600">{userProfile.bio}</p>
      <div>
        <button
          onClick={handleFollow}
          className={`mt-4 px-4 py-2 rounded ${isFollowing ? 'bg-red-500' : 'bg-green-500'} text-white`}
        >
          {isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-6">
        {loadingPosts ? (
          <div>Loading posts...</div>
        ) : (
          userPosts.map(post => (
            <img
              key={post.id}
              src={post.image}
              alt="User post"
              className="w-full h-36 object-cover rounded"
            />
          ))
        )}
      </div>
    </div>
  );
}
