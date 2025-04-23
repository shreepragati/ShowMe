import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginAPI } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { useFollowContext } from '../context/FollowContext'; // Import FollowContext
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // 👈 For eye toggle

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const { login } = useAuth();
  const { triggerRefresh } = useFollowContext(); // Access triggerRefresh

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const data = await loginAPI(formData);
      login(data);
      triggerRefresh(); // Immediately trigger refresh after login
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

      login(res.data); // your JWT login context
      triggerRefresh(); // Immediately trigger refresh after Google login
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

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="max-w-md w-full bg-white shadow-lg rounded p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            placeholder="Username"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            required
          />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="w-full p-2 pr-10 border rounded"
              onChange={handleChange}
              required
            />
            <span
              className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded">
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">or login with</p>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
