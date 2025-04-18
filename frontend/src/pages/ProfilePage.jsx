import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { fetchProfileWithPosts, updateProfile } from '../services/profile';
import { fetchFollows } from '../services/follows';
import { deletePost } from '../services/posts';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

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
    if (!user || !user.username) return;

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

  const renderUserCard = (user) => (
    <div
      key={user.id}
      className="flex items-center space-x-3 bg-white shadow p-3 rounded mb-2"
    >
      <img
        src={user.profile_pic ? `${baseURL}${user.profile_pic}` : '/default-avatar.png'}
        alt="Profile"
        className="w-10 h-10 rounded-full object-cover"
      />
      <Link
        to={`/profile/${user.username}`} // ✅ fixed here
        className="font-medium text-blue-600 hover:underline"
      >
        {user.username}
      </Link>
    </div>
  );
  

  if (!user || !profile) return <div className="text-center py-10">Loading profile...</div>;

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
            <p className="font-bold">{myPosts.length}</p>
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

        <button
          onClick={() => setEditing(!editing)}
          className="bg-blue-500 text-white px-3 py-1 rounded mt-4"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <input type="file" name="profile_pic" onChange={handleChange} />
          {formData.profile_pic && (
            <img
              src={
                formData.profile_pic instanceof File
                  ? URL.createObjectURL(formData.profile_pic)
                  : `${baseURL}${formData.profile_pic}`
              }
              alt="Preview"
              className="w-24 h-24 rounded-full object-cover border mt-2"
            />
          )}
          {['email', 'first_name', 'last_name', 'dob', 'bio'].map(field => (
            <div key={field}>
              <label className="capitalize">{field.replace('_', ' ')}:</label>
              <input
                type={field === 'dob' ? 'date' : 'text'}
                name={field}
                value={formData[field] || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          ))}
          <select
            name="privacy"
            value={formData.privacy}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Save Changes
          </button>
        </form>
      ) : (
        <div className="mt-6 text-sm space-y-1">
          <p><strong>Name:</strong> {profile.first_name || ''} {profile.last_name || ''}</p>
          <p><strong>Email:</strong> {profile.email || 'Not provided'}</p>
          <p><strong>DOB:</strong> {profile.dob || 'Not provided'}</p>
          <p><strong>Bio:</strong> {profile.bio || 'Not provided'}</p>
          <p><strong>Privacy:</strong> {profile.privacy || 'Not specified'}</p>
        </div>
      )}

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
            <p className="text-gray-500">You're not following anyone.</p>
          ) : (
            followingList.map(renderUserCard)
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8 border-t pt-4">
        {myPosts.map(post => (
          <div key={post.id} className="relative border p-2 rounded shadow">
            <button
              onClick={() =>
                setMenuOpenPostId(menuOpenPostId === post.id ? null : post.id)
              }
              className="absolute top-1 right-1 text-gray-500 hover:text-black"
            >
              &#x22EE;
            </button>
            {menuOpenPostId === post.id && (
              <button
                onClick={() => handleDeletePost(post.id)}
                className="absolute top-6 right-1 bg-gray-600 hover:bg-red-500 text-white px-2 py-1 text-xs rounded shadow"
              >
                Delete
              </button>
            )}
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
