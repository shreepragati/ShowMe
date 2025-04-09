import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginAPI } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const data = await loginAPI(formData);
      login(data);
      toast.success('Login successful!');
      navigate('/home');
    } catch {
      toast.error('Invalid credentials');
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Django Allauth Google login route
    window.location.href = 'http://localhost:8000/auth/google/login/';
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
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            required
          />
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded">
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">or login with</p>
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 bg-white border py-2 px-4 rounded shadow hover:bg-gray-100 w-full"
          >
            <FcGoogle size={20} />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
