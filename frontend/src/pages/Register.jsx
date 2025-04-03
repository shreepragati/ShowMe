import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/auth';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', privacy: 'public' });
  const navigate = useNavigate();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await register(formData);
      toast.success("Registered successfully!");
      navigate('/login');
    } catch {
      toast.error("Registration failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="max-w-md w-full bg-white shadow-lg rounded p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="username" placeholder="Username" className="w-full p-2 border rounded" onChange={handleChange} />
          <input name="email" type="email" placeholder="Email" className="w-full p-2 border rounded" onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" className="w-full p-2 border rounded" onChange={handleChange} />
          <select name="privacy" className="w-full p-2 border rounded" onChange={handleChange}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded">Register</button>
        </form>
      </div>
    </div>
  );
}
