import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFollowContext } from '../context/FollowContext';
import { useEffect, useState } from 'react';
import axios from 'axios';

const baseURL = 'http://127.0.0.1:8000';

export default function UserProfile() {
  const { username } = useParams();
  const { user, access } = useAuth();
  const { following, sentRequests, triggerRefresh } = useFollowContext();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followStatus, setFollowStatus] = useState('Follow');
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  useEffect(() => {
    if (!username) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}/profileview/user/${username}/`, {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });

        const profileData = response.data.profile;

        setProfile({
          ...profileData,
          followers_count: response.data.followers_count,
          following_count: response.data.following_count,
          mutual_follow_count: response.data.mutual_follow_count,
        });

        setPosts(Array.isArray(response.data.posts) ? response.data.posts : []);
      } catch (err) {
        console.error('Error fetching profile or posts:', err);
      }
    };

    fetchData();
  }, [username]);

  useEffect(() => {
    if (!profile) return;

    if (following.includes(profile.id)) setFollowStatus('Following');
    else if (sentRequests.includes(profile.id)) setFollowStatus('Requested');
    else setFollowStatus('Follow');
  }, [profile, following, sentRequests]);

  const handleFollow = async () => {
    try {
      if (followStatus === 'Follow') {
        await axios.post(`${baseURL}/follows/request/${profile.id}/`, {}, {
          headers: { Authorization: `Bearer ${access}` }
        });
      } else if (followStatus === 'Requested') {
        await axios.delete(`${baseURL}/follows/cancel/${profile.id}/`, {
          headers: { Authorization: `Bearer ${access}` }
        });
      } else if (followStatus === 'Following') {
        await axios.delete(`${baseURL}/follows/unfollow/${profile.id}/`, {
          headers: { Authorization: `Bearer ${access}` }
        });
      }

      triggerRefresh();
    } catch (err) {
      console.error('Error updating follow status:', err);
    }
  };

  if (!profile) return <div className="text-center py-10">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        <img
          src={profile.profile_pic ? `${baseURL}${profile.profile_pic}` : '/default-avatar.png'}
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover border mb-2"
        />
        <h2 className="text-2xl font-semibold">@{profile.username}</h2>

        <div className="flex gap-8 mt-4">
          <div className="text-center">
            <p className="font-bold">{posts.length}</p>
            <p className="text-sm text-gray-500">Posts</p>
          </div>
          <div className="text-center cursor-pointer" onClick={() => {
            setShowFollowers(true); setShowFollowing(false);
          }}>
            <p className="font-bold">{profile.followers_count || 0}</p>
            <p className="text-sm text-gray-500">Followers</p>
          </div>
          <div className="text-center cursor-pointer" onClick={() => {
            setShowFollowing(true); setShowFollowers(false);
          }}>
            <p className="font-bold">{profile.following_count || 0}</p>
            <p className="text-sm text-gray-500">Following</p>
          </div>
        </div>

        {profile.id !== user?.id && (
          <button
            onClick={handleFollow}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          >
            {followStatus}
          </button>
        )}
      </div>

      {/* Followers / Following (placeholder content) */}
      {showFollowers && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Followers</h3>
          <p>{profile.followers_count} followers (list not implemented)</p>
        </div>
      )}
      {showFollowing && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Following</h3>
          <p>{profile.following_count} following (list not implemented)</p>
        </div>
      )}

      {/* Profile Info */}
      <div className="mt-6 text-sm space-y-1">
        <p><strong>Name:</strong> {profile.first_name || ''} {profile.last_name || ''}</p>
        <p><strong>Email:</strong> {profile.email || 'Not provided'}</p>
        <p><strong>DOB:</strong> {profile.dob || 'Not provided'}</p>
        <p><strong>Bio:</strong> {profile.bio || 'Not provided'}</p>
        <p><strong>Privacy:</strong> {profile.privacy || 'Not specified'}</p>
      </div>

      {/* Posts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8 border-t pt-4">
        {posts.map(post => (
          <div key={post.id} className="border p-2 rounded shadow">
            {post.image && (
              <img
                src={`${baseURL}${post.image}`}
                alt="Post"
                className="w-full h-40 object-cover rounded mb-2"
              />
            )}
            <p className="text-sm">{post.text_content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
