import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfile } from '../services/profile';

const baseURL = 'http://127.0.0.1:8000';

export default function ProfileIcon() {
  const [pic, setPic] = useState(null);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile()
      .then(res => {
        const path = res.data.profile_pic;
        setUsername(res.data.username || 'User');
        if (path) {
          setPic(`${baseURL}${path}`);
        }
      })
      .catch(console.error);
  }, []);

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${username}&background=0D8ABC&color=fff&rounded=true&size=128`;

  return (
    <div
      onClick={() => navigate('/profile')}
      title="Go to Profile"
      className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-gray-300 hover:ring-2 hover:ring-teal-400 transition"
    >
      <img
        src={pic || fallbackAvatar}
        alt="Profile"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
