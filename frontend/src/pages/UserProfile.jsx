import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { fetchProfileWithPosts, updateProfile } from '../services/profile';
import { fetchFollows, sendFollowRequest, unfollowUser } from '../services/follows';
import { deletePost } from '../services/posts';
import { AuthContext } from '../context/AuthContext';
import { useFollowContext } from '../context/FollowContext';

const baseURL = 'http://127.0.0.1:8000';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [menuOpenPostId, setMenuOpenPostId] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!username) return;

    fetchProfileWithPosts(user.username)
      .then(res => {
        const data = res.data;
        const profileData = data.profile;

        setProfile({
          ...profileData,
          followers_count: data.followers_count,
          following_count: data.following_count,
          mutual_follow_count: data.mutual_follow_count,
        });

        setFormData({
          email: profileData.email || '',
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          dob: profileData.dob || '',
          bio: profileData.bio || '',
          privacy: profileData.privacy || 'public',
          profile_pic: profileData.profile_pic || null,
        });

        setMyPosts(data.posts || []);
      })
      .catch(console.error);
  }, [user]);

  const fetchFollowLists = async () => {
    try {
      const res = await fetchFollows();
      setFollowersList(res.data.followers || []);
      setFollowingList(res.data.following || []);
    } catch (err) {
      console.error('Failed to fetch follow lists', err);
    }
  };

  const handleFollowToggle = async (targetUser) => {
    try {
      const isFollowing = targetUser.follow_status === 'following' || targetUser.follow_status === 'mutual';

      if (isFollowing) {
        await unfollowUser(targetUser.username);
        toast.success(`Unfollowed ${targetUser.username}`);
      } else {
        await sendFollowRequest(targetUser.username);
        toast.success(
          targetUser.privacy === 'private'
            ? `Follow request sent to ${targetUser.username}`
            : `Now following ${targetUser.username}`
        );
      }

      fetchFollowLists();
    } catch (err) {
      console.error('Error toggling follow:', err);
      toast.error('Failed to update follow status');
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files && files.length > 0 ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['email', 'first_name', 'last_name', 'dob', 'bio', 'privacy'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill out the ${field.replace('_', ' ')} field.`);
        return;
      }
    }

    try {
      const data = new FormData();
      for (const key in formData) {
        if (key === 'profile_pic' && formData.profile_pic instanceof File) {
          data.append('profile_pic', formData.profile_pic);
        } else {
          data.append(key, formData[key]);
        }
      }

      await updateProfile(data);

      const refreshed = await fetchProfileWithPosts(user.username);
      const newData = refreshed.data;
      const newProfile = newData.profile;

      setProfile({
        ...newProfile,
        followers_count: newData.followers_count,
        following_count: newData.following_count,
        mutual_follow_count: newData.mutual_follow_count,
      });

      setFormData({
        email: newProfile.email || '',
        first_name: newProfile.first_name || '',
        last_name: newProfile.last_name || '',
        dob: newProfile.dob || '',
        bio: newProfile.bio || '',
        privacy: newProfile.privacy || 'public',
        profile_pic: newProfile.profile_pic || null,
      });

      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Update failed', err);
      toast.error('Failed to update profile.');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      toast.success('Post deleted!');
      setMyPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
      toast.error('Failed to delete post');
    }
  };

  const renderUserCard = (userObj) => {
    const { id, username, profile_pic, follow_status, privacy } = userObj;

    let buttonText = 'Follow';
    let disabled = false;

    if (follow_status === 'mutual') {
      buttonText = 'Following';
      disabled = true;
    } else if (follow_status === 'following') {
      buttonText = 'Unfollow';
    } else if (follow_status === 'requested') {
      buttonText = 'Pending';
      disabled = true;
    }

    return (
      <div key={id} className="flex items-center justify-between bg-white shadow p-3 rounded mb-2">
        <div className="flex items-center space-x-3">
          <img
            src={profile_pic ? `${baseURL}${profile_pic}` : '/default-avatar.png'}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <Link to={`/profile/${username}`} className="font-medium text-blue-600 hover:underline">
            {username}
          </Link>
        </div>
        {user.username !== username && (
          <button
            onClick={() => handleFollowToggle(userObj)}
            disabled={disabled}
            className={`text-sm px-2 py-1 rounded ${buttonText === 'Unfollow'
              ? 'bg-red-500 text-white hover:bg-red-600'
              : buttonText === 'Pending'
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
          >
            {buttonText}
          </button>
        )}
      </div>
    );
  };

  if (!user || !profile) return <div className="text-center py-10">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* profile header */}
      {/* same as before... */}
      {/* ... */}

      {showFollowers && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Followers</h3>
          <p>{profile.followers_count} followers (list not implemented)</p>
        </div>
      )}
      {showFollowing && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Following</h3>
          {followingList.length === 0 ? (
            <p className="text-gray-500">You're not following anyone.</p>
          ) : (
            followingList.map(renderUserCard)
          )}
        </div>
      )}

      {/* posts section */}
      {/* same as before... */}
    </div>
  );
}