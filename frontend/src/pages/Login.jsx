import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginAPI } from '../services/auth'; // alias to avoid name conflict
import { useAuth } from '../context/AuthContext';     // ✅ use context
import toast from 'react-hot-toast';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ login function from context

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const data = await loginAPI(formData); // call backend API
      login(data); // ✅ store user, access, refresh in context & localStorage
      toast.success('Login successful!');
      navigate('/home');
    } catch {
      toast.error('Invalid credentials');
    }
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
      </div>
    </div>
  );
}
