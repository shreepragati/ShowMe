import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/auth';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // 👈 Eye icons

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', privacy: 'public' });
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [showPassword, setShowPassword] = useState(false); // 👈 Show/hide password toggle
  const navigate = useNavigate();

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

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="max-w-md w-full bg-white shadow-lg rounded p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessages.length > 0 && (
            <div className="bg-red-100 text-red-700 p-2 rounded">
              <ul>
                {errorMessages.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <input
            name="username"
            placeholder="Username"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            value={formData.username}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            value={formData.email}
          />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password should be at least 6 characters and digits"
              className="w-full p-2 pr-10 border rounded"
              onChange={handleChange}
              value={formData.password}
            />
            <span
              className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
          <select
            name="privacy"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            value={formData.privacy}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
