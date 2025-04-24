import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginAPI } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { useFollowContext } from '../context/FollowContext';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { FaHeart, FaCommentDots, FaUserFriends, FaPaperPlane, FaSmile } from 'react-icons/fa';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { triggerRefresh } = useFollowContext();

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const data = await loginAPI(formData);
      login(data);
      triggerRefresh();
      toast.success('Login successful!');
      navigate('/home');
    } catch {
      toast.error('Invalid credentials');
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    try {
      const res = await axios.post('http://localhost:8000/api/google-login/', {
        token: credential,
      });
      login(res.data);
      triggerRefresh();
      toast.success('Google login successful!');
      navigate('/home');
    } catch (err) {
      console.error(err);
      toast.error('Google login failed');
    }
  };

  const handleGoogleLoginError = () => {
    toast.error('Google login error');
  };

  const iconVariants = {
    animate: {
      y: [0, -10, 0],
      transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
    },
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-800 to-indigo-700 text-white">
      {/* Left Visual Panel */}
      <div className="w-1/2 relative flex flex-col justify-center items-center overflow-hidden px-6">
        <h1 className="text-4xl font-bold mb-6 z-10 text-center">
          Connect. Share. Engage.
        </h1>
        <p className="text-lg text-white/80 mb-4 z-10 text-center max-w-md">
          Dive into the world of ShowMe – where your stories spark conversations and connections.
        </p>

        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <motion.div className="text-6xl text-white/40 absolute top-10 left-20" variants={iconVariants} animate="animate">
            <FaHeart />
          </motion.div>
          <motion.div className="text-6xl text-white/40 absolute top-28 right-24" variants={iconVariants} animate="animate">
            <FaCommentDots />
          </motion.div>
          <motion.div className="text-6xl text-white/40 absolute bottom-20 left-16" variants={iconVariants} animate="animate">
            <FaPaperPlane />
          </motion.div>
          <motion.div className="text-6xl text-white/40 absolute bottom-10 right-28" variants={iconVariants} animate="animate">
            <FaUserFriends />
          </motion.div>
          <motion.div className="text-6xl text-white/40 absolute top-1/2 right-1/3" variants={iconVariants} animate="animate">
            <FaSmile />
          </motion.div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-1/2 flex justify-center items-center min-h-screen">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl px-8 py-10">
          <h2 className="text-3xl font-extrabold text-center text-indigo-800 mb-6">
            Welcome Back 👋
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              name="username"
              placeholder="Username"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
              onChange={handleChange}
              required
            />
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                onChange={handleChange}
                required
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-indigo-500"
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>
            <button className="w-full bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white py-2.5 rounded-lg font-semibold shadow-md transition">
              Login
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-3">or continue with</p>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
