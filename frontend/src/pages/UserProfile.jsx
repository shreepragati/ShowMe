import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { fetchProfileWithPosts } from '../services/profile';
import { fetchFollows } from '../services/follows';
import { sendFollowRequest, cancelFollowRequest, unfollowUser } from '../services/follows';
import { AuthContext } from '../context/AuthContext';
import { useFollowContext } from '../context/FollowContext';

const baseURL = 'http://127.0.0.1:8000';

export default function UserProfile() {
  const { username } = useParams();
  const { user } = useContext(AuthContext); // logged-in user
  const { triggerRefresh } = useFollowContext();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followStatus, setFollowStatus] = useState(''); // Track the follow button state
  const [loading, setLoading] = useState(false);

  const isMe = user?.username === username;
  const isFollowing = user && followingList.some(u => u.username === username);
  const hasRequested = user && followingList.some(u => u.username === username && u.followStatus === 'Requested');

  useEffect(() => {
    if (!username) return;

    // Fetch profile with posts
    fetchProfileWithPosts(username)
      .then(res => {
        const data = res.data;
        setProfile({
          ...data.profile,
          followers_count: data.followers_count,
          following_count: data.following_count,
          mutual_follow_count: data.mutual_follow_count,
        });
        setPosts(data.posts || []);
      })
      .catch(console.error);
  }, [username]);

  const fetchFollowLists = async () => {
    try {
      // Fetch followers and following lists for the current user profile
      const res = await fetchFollows(username);
      setFollowersList(res.data.followers || []);
      setFollowingList(res.data.following || []);
    } catch (err) {
      console.error('Failed to fetch user follow lists', err);
    }
  };

  useEffect(() => {
    if (isMe) return; // Skip for logged-in user's profile
    fetchFollowLists();
  }, [username, isMe]);

  useEffect(() => {
    if (isFollowing) {
      setFollowStatus('Following');
    } else if (hasRequested) {
      setFollowStatus('Requested');
    } else {
      setFollowStatus('Follow');
    }
  }, [isFollowing, hasRequested]);

  const handleFollow = async () => {
    if (loading || !username) return;

    setLoading(true);
    try {
      if (followStatus === 'Follow') {
        await sendFollowRequest(username);
        setFollowStatus('Requested');
      } else if (followStatus === 'Requested') {
        await cancelFollowRequest(username);
        setFollowStatus('Follow');
      }
      triggerRefresh();
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (loading || !username) return;

    setLoading(true);
    try {
      await unfollowUser(username);
      setFollowStatus('Follow');
      triggerRefresh();
    } catch (err) {
      console.error('Unfollow error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderUserCard = (u) => (
    <div key={u.id} className="flex items-center space-x-3 bg-white shadow p-3 rounded mb-2">
      <img
        src={u.profile_pic ? `${baseURL}${u.profile_pic}` : '/default-avatar.png'}
        alt="Profile"
        className="w-10 h-10 rounded-full object-cover"
      />
      <Link to={`/profile/${u.username}`} className="font-medium text-blue-600 hover:underline">
        {u.username}
      </Link>
    </div>
  );

  if (!profile) return <div className="text-center py-10">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex flex-col items-center text-center">
        <img
          src={profile.profile_pic ? `${baseURL}${profile.profile_pic}` : '/default-avatar.png'}
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover border mb-2"
        />
        <h2 className="text-2xl font-semibold">{profile.username}</h2>
        <div className="flex gap-8 mt-4">
          <div className="text-center">
            <p className="font-bold">{posts.length}</p>
            <p className="text-sm text-gray-500">Posts</p>
          </div>
          <div
            className="text-center cursor-pointer"
            onClick={() => {
              setShowFollowers(!showFollowers);
              setShowFollowing(false);
              fetchFollowLists();
            }}
          >
            <p className="font-bold">{profile.followers_count || 0}</p>
            <p className="text-sm text-gray-500">Followers</p>
          </div>
          <div
            className="text-center cursor-pointer"
            onClick={() => {
              setShowFollowing(!showFollowing);
              setShowFollowers(false);
              fetchFollowLists();
            }}
          >
            <p className="font-bold">{profile.following_count || 0}</p>
            <p className="text-sm text-gray-500">Following</p>
          </div>
        </div>

        {/* Follow Button */}
        {!isMe && (
          <div className="mt-2">
            {followStatus === 'Following' ? (
              <button
                onClick={handleUnfollow}
                className="bg-gray-200 text-black px-4 py-1 rounded hover:bg-gray-300"
                disabled={loading}
              >
                Following
              </button>
            ) : followStatus === 'Requested' ? (
              <button
                onClick={handleCancelRequest}
                className="bg-yellow-300 text-black px-4 py-1 rounded hover:bg-yellow-400"
                disabled={loading}
              >
                Requested
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Follow'}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 text-sm space-y-1">
        <p><strong>Name:</strong> {profile.first_name || ''} {profile.last_name || ''}</p>
        <p><strong>Email:</strong> {profile.email || 'Not provided'}</p>
        <p><strong>DOB:</strong> {profile.dob || 'Not provided'}</p>
        <p><strong>Bio:</strong> {profile.bio || 'Not provided'}</p>
        <p><strong>Privacy:</strong> {profile.privacy || 'Not specified'}</p>
      </div>

      {showFollowers && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Followers</h3>
          {followersList.length === 0 ? (
            <p className="text-gray-500">No followers yet.</p>
          ) : (
            followersList.map(renderUserCard)
          )}
        </div>
      )}

      {showFollowing && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Following</h3>
          {followingList.length === 0 ? (
            <p className="text-gray-500">Not following anyone.</p>
          ) : (
            followingList.map(renderUserCard)
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8 border-t pt-4">
        {posts.map(post => (
          <div key={post.id} className="relative border p-2 rounded shadow">
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
