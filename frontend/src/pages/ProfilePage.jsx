import { useState, useEffect } from 'react';
import { fetchProfile, updateProfile } from '../services/profile';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile()
      .then(res => {
        setProfile(res.data);
        setFormData(res.data);
      })
      .catch(console.error);
  }, []);

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
      alert('Profile updated!');
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">My Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Profile Picture:</label><br />
          {profile.profile_pic && (
            <img
              src={profile.profile_pic}
              alt="Profile"
              className="w-24 h-24 rounded-full mb-2"
            />
          )}
          <input type="file" name="profile_pic" onChange={handleChange} />
        </div>

        {['username', 'email', 'first_name', 'last_name', 'dob', 'bio'].map(field => (
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

        <div>
          <label>Privacy:</label>
          <select
            name="privacy"
            value={formData.privacy}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
}
