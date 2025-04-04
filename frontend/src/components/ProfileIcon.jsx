// src/components/ProfileIcon.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfile } from '../services/profile';

export default function ProfileIcon() {
  const [pic, setPic] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile()
      .then(res => setPic(res.data.profile_pic))
      .catch(console.error);
  }, []);

  return (
    <div
      className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-gray-300"
      onClick={() => navigate('/profile')}
      title="Profile"
    >
      {pic ? (
        <img src={pic} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white">
          ?
        </div>
      )}
    </div>
  );
}
