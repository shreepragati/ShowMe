import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  sendFollowRequest,
  cancelFollowRequest,
  unfollowUser
} from '../services/follows';

const baseURL = 'http://127.0.0.1:8000';

export default function UserProfile() {
  const { username: viewedUsername } = useParams();
  const { user, access } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localFollowStatus, setLocalFollowStatus] = useState('');
  const [loggedInFollowingUsernames, setLoggedInFollowingUsernames] = useState([]);

  const fetchProfileData = useCallback(async () => {
    if (!viewedUsername) return;
    try {
      const response = await axios.get(`${baseURL}/profileview/user/${viewedUsername}/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      const profileData = response.data.profile;
      setProfile(profileData);
      setPosts(Array.isArray(response.data.posts) ? response.data.posts : []);
    } catch (err) {
      console.error('Error fetching profile or posts:', err);
      setProfile(null);
      setPosts([]);
    }
  }, [viewedUsername, access]);

  const fetchLoggedInFollowing = useCallback(async () => {
    if (!access) return;
    try {
      const response = await axios.get(`${baseURL}/follows/my-follows/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      const followingUsernames = response.data.following.map(user => user.username);
      setLoggedInFollowingUsernames(followingUsernames);
    } catch (error) {
      console.error('Error fetching logged-in user\'s following:', error);
      setLoggedInFollowingUsernames([]);
    }
  }, [access]);

  useEffect(() => {
    fetchProfileData();
    fetchLoggedInFollowing();
  }, [fetchProfileData, fetchLoggedInFollowing]);

  useEffect(() => {
    if (profile && user && profile.username !== user.username) {
      if (loggedInFollowingUsernames.includes(profile.username)) {
        setLocalFollowStatus('Following');
      } else {
        setLocalFollowStatus('Follow');
      }
    } else {
      setLocalFollowStatus('');
    }
  }, [profile, loggedInFollowingUsernames, user, viewedUsername]);

  const handleFollow = async () => {
    if (!profile || loading || !user) return;
    setLoading(true);
    const viewedUserProfileUsername = profile.username; // Using username here
    const currentFollowStatus = localFollowStatus;
    let newFollowStatus = '';

    try {
      if (currentFollowStatus === 'Following') {
        await unfollowUser(viewedUserProfileUsername); // Using username here
        newFollowStatus = 'Follow';
      } else if (currentFollowStatus === 'Follow') {
        await sendFollowRequest(viewedUserProfileUsername); // Using username here
        newFollowStatus = profile.privacy === 'public' ? 'Following' : 'Pending';
      }

      setLocalFollowStatus(newFollowStatus);
      fetchLoggedInFollowing();
    } catch (err) {
      console.error('Follow action failed:', err);
      setLocalFollowStatus(currentFollowStatus);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="text-center py-10">Loading profile...</div>;

  const isOwnProfile = user && profile.id === user.id;
  const showFollowButton = !isOwnProfile;
  const buttonText = localFollowStatus;
  const buttonTitle = localFollowStatus === 'Pending' ? 'Click to cancel follow request' : localFollowStatus === 'Following' ? 'Click to unfollow' : 'Send follow request';

  return (
    <div className="max-w-3xl mx-auto p-4">
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
          <div className="text-center">
            <p className="font-bold">{profile.followers_count || 0}</p>
            <p className="text-sm text-gray-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{profile.following_count || 0}</p>
            <p className="text-sm text-gray-500">Following</p>
          </div>
        </div>

        {showFollowButton && (
          <button
            onClick={handleFollow}
            title={buttonTitle}
            className={`px-4 py-1 mt-4 rounded text-sm transition
              ${buttonText === 'Follow'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : buttonText === 'Pending'
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : buttonText === 'Following'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : ''
              }
              ${loading || !profile?.id ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {loading ? 'Loading...' : buttonText}
          </button>
        )}
      </div>

      {/* Profile details */}
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