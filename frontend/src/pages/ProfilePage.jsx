import { useState, useEffect, useContext } from 'react';
import { fetchProfile, updateProfile } from '../services/profile';
import { getPosts } from '../services/posts';
import { AuthContext } from '../context/AuthContext';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProfile()
      .then(res => {
        setProfile(res.data);
        setFormData(res.data);
      })
      .catch(console.error);

    getPosts()
      .then(res => {
        const userPosts = res.data.filter(post => post.user.id === user.id);
        setMyPosts(userPosts);
      })
      .catch(console.error);
  }, [user.id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }
      const res = await updateProfile(data);
      setProfile(res.data);
      setEditing(false);
      alert('Profile updated!');
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{profile.username}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className="border px-3 py-1 rounded-md text-sm"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button className="text-2xl">⋯</button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex items-center gap-6 mb-6">
        <img
          src={profile.profile_pic}
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover border"
        />
        <div className="flex gap-6">
          <div className="text-center">
            <p className="font-bold">{myPosts.length}</p>
            <p className="text-sm text-gray-500">Posts</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{profile.followers || 0}</p>
            <p className="text-sm text-gray-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{profile.following || 0}</p>
            <p className="text-sm text-gray-500">Following</p>
          </div>
        </div>
      </div>

      {/* Editable Fields */}
      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
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
        <div className="mb-6 text-sm">
          <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>DOB:</strong> {profile.dob}</p>
          <p><strong>Bio:</strong> {profile.bio}</p>
        </div>
      )}

      {/* My Posts Grid */}
      <div className="grid grid-cols-3 gap-2 mt-6">
        {myPosts.map(post => (
          <img
            key={post.id}
            src={post.image}
            alt="Post"
            className="w-full h-28 object-cover rounded"
          />
        ))}
      </div>
    </div>
  );
}
