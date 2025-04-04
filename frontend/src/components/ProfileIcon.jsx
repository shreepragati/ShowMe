// src/components/ProfileIcon.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfile } from '../services/profile';

const baseURL = 'http://127.0.0.1:8000'; // ✅ Adjust if using .env for production

export default function ProfileIcon() {
  const [pic, setPic] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile()
      .then(res => {
        const path = res.data.profile_pic;
        if (path) {
          setPic(`${baseURL}${path}`);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div
      onClick={() => navigate('/profile')}
      title="Go to Profile"
      className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-gray-300 hover:ring-2 hover:ring-orange-400 transition"
    >
      {pic ? (
        <img
          src={pic}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white text-sm">
          ?
        </div>
      )}
    </div>
  );
}
