import { useState } from 'react';
import { createPost } from '../services/posts';
import toast from 'react-hot-toast';

export default function CreatePost() {
  const [form, setForm] = useState({ post_type: 'text', text_content: '', image: null, video: null });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = e => setForm({ ...form, [e.target.name]: e.target.files[0] });

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => v && formData.append(k, v));
    try {
      await createPost(formData);
      toast.success("Post created!");
      setForm({ post_type: 'text', text_content: '', image: null, video: null });
      e.target.reset();
    } catch {
      toast.error("Failed to create post");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 space-y-4 bg-white rounded shadow mt-6">
      <h2 className="text-xl font-bold">Create a Post</h2>

      <select name="post_type" className="w-full p-2 border rounded" onChange={handleChange}>
        <option value="text">Text</option>
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>

      {/* 👇 Caption always shown */}
      <textarea
        name="text_content"
        className="w-full p-2 border rounded"
        placeholder="Add a caption..."
        onChange={handleChange}
      ></textarea>

      {form.post_type === 'image' && (
        <input type="file" name="image" accept="image/*" onChange={handleFile} />
      )}
      {form.post_type === 'video' && (
        <input type="file" name="video" accept="video/*" onChange={handleFile} />
      )}

      <button className="bg-green-600 text-white py-2 px-4 rounded">Post</button>
    </form>
  );
}
