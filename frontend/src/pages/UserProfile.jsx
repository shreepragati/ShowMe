import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { fetchProfileWithPosts } from '../services/profile';
import { fetchUserFollows } from '../services/follows';
import { sendFollowRequest, cancelFollowRequest, unfollowUser } from '../services/follows';
import { AuthContext } from '../context/AuthContext';
import { useFollowContext } from '../context/FollowContext';

const baseURL = 'http://127.0.0.1:8000';

export default function UserProfile() {
  const { username } = useParams();
  const { user } = useContext(AuthContext); // logged-in user
  const { triggerRefresh } = useFollowContext();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'followers', 'following'
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
        });
        setPosts(data.posts || []);
      })
      .catch(console.error);
  }, [username]);

  const fetchFollowLists = async () => {
    try {
      // Fetch followers and following lists for the current user profile
      const res = await fetchUserFollows(username);
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
    if (!user || !followersList) return;

    const isFollowing = followersList.some(u => u.id === user.id);
    // If you don’t yet have follow request status here, default to “Follow”
    setFollowStatus(isFollowing ? 'Following' : 'Follow');
  }, [followersList, user]);


  const handleFollow = async () => {
    if (loading || !username) return;

    setLoading(true);
    try {
      if (followStatus === 'Follow') {
        if (profile.privacy === 'public') {
          await sendFollowRequest(username); // You might want to rename this to `followUser` if you're directly following
          setFollowStatus('Following');
        } else {
          await sendFollowRequest(username);
          setFollowStatus('Requested');
        }
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
    <div key={u.id} className="flex items-center space-x-3 shadow p-3 rounded mb-2 bg-gray-800">
      <img
        src={u.profile_pic ? `${baseURL}${u.profile_pic}` : `https://ui-avatars.com/api/?name=${profile.username}&background=0D8ABC&color=fff&rounded=true&size=128`}
        alt="Profile"
        className="w-10 h-10 rounded-full object-cover"
      />
      <Link to={`/profile/${u.username}`} className="font-medium text-blue-400 hover:underline">
        {u.username}
      </Link>
    </div>
  );

  if (!profile) return <div className="text-center py-10">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex flex-col items-center text-center">
        <img
          src={profile.profile_pic ? `${baseURL}${profile.profile_pic}` : `https://ui-avatars.com/api/?name=${profile.username}&background=0D8ABC&color=fff&rounded=true&size=128`}
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover border mb-2"
        />
        <h2 className="text-2xl font-semibold">{profile.username}</h2>
        <div className="flex gap-8 mt-4">
          {/* Removed individual counts */}
        </div>

        {/* Follow Button */}
        {!isMe && (
          <div className="mt-2">
            {followStatus === 'Following' ? (
              <button
                onClick={handleUnfollow}
                className="bg-gray-700 text-white px-4 py-1 rounded hover:bg-gray-600"
                disabled={loading}
              >
                Following
              </button>
            ) : followStatus === 'Requested' ? (
              <button
                onClick={handleFollow}
                className="bg-yellow-600 text-black px-4 py-1 rounded hover:bg-yellow-500"
                disabled={loading}
              >
                Requested
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-500"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Follow'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tab Buttons */}
      <div className="mt-6 flex rounded-md shadow-sm bg-gray-800">
        <button
          className={`flex-1 py-2 text-sm font-medium text-gray-300 focus:outline-none ${activeTab === 'posts' ? 'bg-blue-500 text-white' : 'hover:bg-gray-700'
            } rounded-l-md`}
          onClick={() => setActiveTab('posts')}
        >
          Posts ({posts.length})
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium text-gray-300 focus:outline-none ${activeTab === 'followers' ? 'bg-blue-500 text-white' : 'hover:bg-gray-700'
            }`}
          onClick={() => {
            setActiveTab('followers');
            fetchFollowLists();
          }}
        >
          Followers ({profile?.followers_count || 0})
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium text-gray-300 focus:outline-none ${activeTab === 'following' ? 'bg-blue-500 text-white' : 'hover:bg-gray-700'
            } rounded-r-md`}
          onClick={() => {
            setActiveTab('following');
            fetchFollowLists();
          }}
        >
          Following ({profile?.following_count || 0})
        </button>
      </div>

      {/* User Details */}
      <div className="mt-6 text-sm space-y-1">
        <p><strong>Name:</strong> {profile?.first_name || ''} {profile?.last_name || ''}</p>
        <p><strong>Email:</strong> {profile?.email || 'Not provided'}</p>
        <p><strong>DOB:</strong> {profile?.dob || 'Not provided'}</p>
        <p><strong>Bio:</strong> {profile?.bio || 'Not provided'}</p>
        <p><strong>Privacy:</strong> {profile?.privacy || 'Not specified'}</p>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {posts.map(post => (
              <div key={post.id} className="relative border p-2 rounded shadow bg-gray-800">
                {post.image ? (
                  <img
                    src={`${baseURL}${post.image}`}
                    alt="Post"
                    className="w-full h-40 object-cover rounded mb-2"
                  />
                ) : post.video ? (
                  <video
                    controls
                    className="w-full h-40 object-cover rounded mb-2"
                  >
                    <source src={`${baseURL}${post.video}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : null}
                <p className="text-sm text-gray-300">{post.text_content}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="mt-4">
            {followersList.length === 0 ? (
              <p className="text-gray-500">No followers yet.</p>
            ) : (
              followersList.map(renderUserCard)
            )}
          </div>
        )}

        {activeTab === 'following' && (
          <div className="mt-4">
            {followingList.length === 0 ? (
              <p className="text-gray-500">Not following anyone.</p>
            ) : (
              followingList.map(renderUserCard)
            )}
          </div>
        )}
      </div>
    </div>
  );
}