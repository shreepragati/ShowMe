import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPosts } from '../services/posts';
import axios from 'axios';

const baseURL = 'http://127.0.0.1:8000';

export default function UserProfile() {
  const { id } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    axios.get(`${baseURL}/api/profile/${id}/`)
      .then(res => setUserProfile(res.data))
      .catch(err => console.error("Failed to load user", err));

    getPosts()
      .then(res => {
        const filtered = res.data.filter(p => p.user.id.toString() === id);
        setUserPosts(filtered);
      })
      .catch(err => console.error("Failed to load posts", err));
  }, [id]);

  if (!userProfile) return <div>Loading user profile...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 text-center">
      <img
        src={userProfile.profile_pic ? `${baseURL}${userProfile.profile_pic}` : '/default-avatar.png'}
        alt="Profile"
        className="w-24 h-24 rounded-full mx-auto object-cover border mb-2"
      />
      <h2 className="text-2xl font-semibold">{userProfile.username}</h2>
      <p className="text-gray-600">{userProfile.bio}</p>

      <div className="grid grid-cols-3 gap-2 mt-6">
        {userPosts.map(post => (
          <img
            key={post.id}
            src={post.image}
            alt="User post"
            className="w-full h-36 object-cover rounded"
          />
        ))}
      </div>
    </div>
  );
}
