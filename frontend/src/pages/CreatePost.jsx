import React, { useState } from 'react';
import { createPost } from '../services/posts';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi'; // Import the down arrow icon

export default function CreatePost() {
  const [form, setForm] = useState({ post_type: 'image', text_content: '', image: null, video: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = e => setForm({ ...form, [e.target.name]: e.target.files[0] });

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => v && formData.append(k, v));
    try {
      await createPost(formData);
      toast.success("Post created!");
      setForm({ post_type: 'image', text_content: '', image: null, video: null });
      e.target.reset();
    } catch {
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
      <motion.form
        onSubmit={handleSubmit}
        className="max-w-xl w-full mx-auto p-6 space-y-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white tracking-wide mb-4">Create a Post</h2>

        <div className="relative">
          <select
            name="post_type"
            className="w-full p-3 border border-gray-700 rounded-xl bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8" // Added appearance-none and pr-8
            onChange={handleChange}
            value={form.post_type}
          >
            <option value="image" className="bg-gray-700 text-white">Image</option>
            <option value="video" className="bg-gray-700 text-white">Video</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
            <FiChevronDown /> {/* Dropdown icon */}
          </div>
        </div>

        {/* Caption always shown */}
        <textarea
          name="text_content"
          className="w-full p-3 border border-gray-700 rounded-xl bg-gray-700 text-white placeholder:text-gray-400 resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add a caption..."
          onChange={handleChange}
        />

        <div className="relative">
          <label
            htmlFor="file-upload"
            className="inline-flex items-center justify-center py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer transition-colors duration-300 w-full"
          >
            Choose File
          </label>
          <input
            id="file-upload"
            type="file"
            name={form.post_type === 'image' ? 'image' : 'video'}
            accept={form.post_type === 'image' ? 'image/*' : 'video/*'}
            onChange={handleFile}
            className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || (form.post_type === 'image' && !form.image) || (form.post_type === 'video' && !form.video)}
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl transition-colors duration-300 font-semibold w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </motion.form>
    </div>
  );
}