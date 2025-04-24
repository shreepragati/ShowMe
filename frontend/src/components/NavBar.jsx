import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileIcon from './ProfileIcon';
import NotificationBell from './NotificationBell';
import { MdHome, MdSearch, MdGroup, MdAddBox } from 'react-icons/md';
import { BiLogOut, BiUserPlus } from 'react-icons/bi';

export default function NavBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-cyan-700 via-blue-800 to-indigo-900 shadow-md border-b border-indigo-800/50 px-8 py-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      {/* Logo */}
      <Link to={user ? "/home" : "/"} className="flex items-center space-x-3 text-2xl font-extrabold text-white tracking-tight">
        <div className="w-10 h-10 bg-teal-400 rounded-lg flex items-center justify-center text-white font-mono shadow-md">
          <span>SM</span>
        </div>
        <span className="hidden sm:inline">ShowMe</span>
      </Link>

      {/* Right Navigation */}
      <div className="flex items-center space-x-6 text-white text-xl">
        {user ? (
          <div className="flex items-center space-x-6">
            {/* Navigation Icons */}
            <Link to="/home" className="hover:text-teal-300 transition-colors duration-200" title="Home">
              <MdHome size={24} />
            </Link>
            <Link to="/search" className="hover:text-teal-300 transition-colors duration-200" title="Search">
              <MdSearch size={24} />
            </Link>
            <Link to="/follows" className="hover:text-teal-300 transition-colors duration-200" title="Follows">
              <MdGroup size={24} />
            </Link>
            <Link to="/create" className="hover:text-teal-300 transition-colors duration-200" title="Post">
              <MdAddBox size={24} />
            </Link>

            {/* Notifications & Profile */}
            <NotificationBell className="hover:text-teal-300" />
            <ProfileIcon />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 shadow-md transition duration-200"
            >
              <BiLogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4 text-base">
            <Link to="/login" className="hover:text-teal-300 transition-colors duration-200">
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-md transition duration-200"
            >
              <BiUserPlus size={18} />
              <span>Join Us</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
