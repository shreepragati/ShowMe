import { useState, useEffect, useContext } from 'react';
import { fetchProfileWithPosts, updateProfile } from '../services/profile';
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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
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
        data.append(key, formData[key]);
      }

      await updateProfile(data);

      const refreshed = await fetchProfileWithPosts(user.username);
      const refreshedData = refreshed.data;

      setProfile({
        ...refreshedData.profile,
        followers_count: refreshedData.followers_count,
        following_count: refreshedData.following_count,
        mutual_follow_count: refreshedData.mutual_follow_count,
      });

      setFormData({
        email: refreshedData.profile.email || '',
        first_name: refreshedData.profile.first_name || '',
        last_name: refreshedData.profile.last_name || '',
        dob: refreshedData.profile.dob || '',
        bio: refreshedData.profile.bio || '',
        privacy: refreshedData.profile.privacy || 'public',
        profile_pic: refreshedData.profile.profile_pic || null,
      });

      setMyPosts(refreshedData.posts || []);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Update failed', err);
      toast.error('Failed to update profile.');
    }
  };

  if (!user || !profile) return <div className="text-center py-10">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Profile Header */}
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

        <button
          onClick={() => setEditing(!editing)}
          className="bg-blue-500 text-white px-3 py-1 rounded mt-4"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {/* Editable Fields */}
      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <input type="file" name="profile_pic" onChange={handleChange} />
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

      {/* Followers / Following */}
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

      {/* Posts Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8 border-t pt-4">
        {myPosts.map(post => (
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
