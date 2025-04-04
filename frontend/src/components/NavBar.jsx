// src/components/NavBar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileIcon from './ProfileIcon'; // ✅

export default function NavBar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('access');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center space-x-2 text-xl font-bold text-gray-800">
        <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-mono">
          B
        </div>
        <span>ShowMe</span>
      </div>

      <div className="flex items-center space-x-4 text-sm font-medium">
        {isLoggedIn ? (
          <>
            <Link to="/home" className="text-gray-700 hover:text-orange-500">Home</Link>
            <Link to="/friends" className="text-gray-700 hover:text-orange-500">Friends</Link>
            <Link to="/create" className="text-gray-700 hover:text-orange-500">Post</Link>
            <ProfileIcon /> {/* ✅ Replaces ProfileMenu */}
            <button
              onClick={logout}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-700 hover:underline">Sign In</Link>
            <Link
              to="/register"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded"
            >
              Create Your Account
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
