import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileIcon from './ProfileIcon';

// ✅ Google Material Icons
import { MdHome, MdSearch, MdGroup, MdAddBox } from 'react-icons/md';

export default function NavBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center space-x-2 text-xl font-bold text-gray-800">
        <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-mono">
          B
        </div>
        <span>ShowMe</span>
      </div>

      {/* Right Navigation */}
      <div className="flex items-center space-x-6 text-xl text-gray-700">
        {user ? (
          <>
            <Link to="/home" className="hover:text-orange-500" title="Home">
              <MdHome />
            </Link>
            <Link to="/search" className="hover:text-orange-500" title="Search">
              <MdSearch />
            </Link>
            <Link to="/follows" className="hover:text-orange-500" title="Follows">
              <MdGroup />
            </Link>
            <Link to="/create" className="hover:text-orange-500" title="Post">
              <MdAddBox />
            </Link>
            <ProfileIcon />
            <button
              onClick={handleLogout}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded text-sm"
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
