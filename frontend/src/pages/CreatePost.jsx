import { useState, useContext } from 'react';
import { createPost } from '../services/posts';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CreatePost() {
  const { access } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    post_type: 'text',
    text_content: '',
    image: null,
    video: null,
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = e => {
    const { name, files } = e.target;
    setForm(prev => ({ ...prev, [name]: files[0] }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v) formData.append(k, v);
    });

    try {
      await createPost(formData, access);
      toast.success("Post created!");
      navigate('/home');
    } catch (err) {
      toast.error("Failed to create post");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-4 space-y-4 bg-white rounded shadow mt-6"
    >
      <h2 className="text-xl font-bold">Create a Post</h2>

      {/* Type selector */}
      <select
        name="post_type"
        className="w-full p-2 border rounded"
        value={form.post_type}
        onChange={handleChange}
      >
        <option value="text">Text</option>
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>

      {/* ✅ Caption input always shown */}
      <textarea
        name="text_content"
        className="w-full p-2 border rounded"
        placeholder="Write a caption..."
        value={form.text_content}
        onChange={handleChange}
      />

      {/* Media upload */}
      {form.post_type === 'image' && (
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleFile}
        />
      )}
      {form.post_type === 'video' && (
        <input
          type="file"
          name="video"
          accept="video/*"
          onChange={handleFile}
        />
      )}

      <button
        type="submit"
        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
      >
        Post
      </button>
    </form>
  );
}
