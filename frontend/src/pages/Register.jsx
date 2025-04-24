import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/auth';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { FaUserPlus, FaEnvelope, FaLock, FaShieldAlt, FaHeart, FaCommentDots, FaUserFriends, FaPaperPlane, FaSmile } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useFollowContext } from '../context/FollowContext';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', privacy: 'public' });
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { triggerRefresh } = useFollowContext();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    const errors = [];
    if (!formData.username) errors.push('Username is required');
    if (!formData.email) errors.push('Email is required');
    if (!formData.password) errors.push('Password is required');
    if (formData.password && formData.password.length < 6) errors.push('Password must be at least 6 characters');
    return errors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMessages([]);
    const errors = validateForm();
    if (errors.length > 0) {
      setErrorMessages(errors);
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      toast.success('Registered successfully!');
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error('Registration failed');
      setErrorMessages([err?.response?.data?.detail || 'Registration failed']);
    } finally {
      setLoading(false);
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
      toast.success('Google registration successful!');
      navigate('/home'); // Or wherever you want to redirect after Google registration
    } catch (err) {
      console.error(err);
      toast.error('Google registration failed');
    }
  };

  const handleGoogleLoginError = () => {
    toast.error('Google registration error');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        delay: 0.1,
        damping: 20,
        stiffness: 100,
      },
    },
  };

  const inputVariants = {
    focus: {
      scale: 1.02,
      boxShadow: '0px 0px 8px rgba(109, 40, 217, 0.3)',
      transition: { duration: 0.2 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: '0px 0px 10px rgba(109, 40, 217, 0.4)',
      transition: { duration: 0.2 },
    },
    disabled: {
      backgroundColor: '#a78bfa',
      cursor: 'not-allowed',
    },
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
          Join the Community!
        </h1>
        <p className="text-lg text-white/80 mb-4 z-10 text-center max-w-md">
          Create your account and start connecting with friends and sharing your moments.
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
        <motion.div
          className="max-w-md w-full bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl px-8 py-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl font-extrabold text-center text-indigo-800 mb-6">
            Sign Up for ShowMe ✨
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessages.length > 0 && (
              <motion.div
                className="bg-red-100 text-red-700 p-3 rounded-lg shadow-sm"
                layout
              >
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {errorMessages.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </motion.div>
            )}
            <div className="relative">
              <FaUserPlus className="absolute left-3 top-3 text-gray-500" />
              <motion.input
                name="username"
                placeholder="Username"
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                onChange={handleChange}
                value={formData.username}
                variants={inputVariants}
                whileFocus="focus"
                required
              />
            </div>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-500" />
              <motion.input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                onChange={handleChange}
                value={formData.email}
                variants={inputVariants}
                whileFocus="focus"
                required
              />
            </div>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-500" />
              <motion.input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min 6 characters)"
                className="w-full pl-10 pr-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                onChange={handleChange}
                value={formData.password}
                variants={inputVariants}
                whileFocus="focus"
                required
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-indigo-500"
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>
            <div className="relative">
              <FaShieldAlt className="absolute left-3 top-3 text-gray-500" />
              <motion.select
                name="privacy"
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                onChange={handleChange}
                value={formData.privacy}
                variants={inputVariants}
                whileFocus="focus"
              >
                <option value="public">Public Account</option>
                <option value="private">Private Account</option>
              </motion.select>
            </div>
            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white py-2.5 rounded-lg font-semibold shadow-md transition"
              disabled={loading}
              variants={buttonVariants}
              whileHover="hover"
              style={loading ? buttonVariants.disabled : {}}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-3">or sign up with</p>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
              />
            </div>
          </div>
          <p className="mt-4 text-center text-gray-600 text-sm">
            Already have an account? <a href="/login" className="text-indigo-500 hover:underline">Log In</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}