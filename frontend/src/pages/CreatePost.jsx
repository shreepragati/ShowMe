import React, { useState, useEffect } from 'react';
import { createPost } from '../services/posts';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import { FaImage, FaVideo } from 'react-icons/fa';

export default function CreatePost() {
  const [form, setForm] = useState({ post_type: 'image', text_content: '', image: null, video: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear file and preview when switching post type
    if (e.target.name === 'post_type') {
      setForm(prevForm => ({
        ...prevForm,
        image: null,
        video: null,
      }));
      setFilePreview(null);
    }
  };

  const handleFile = e => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, [e.target.name]: file });
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  };

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();

    formData.append('post_type', form.post_type);
    formData.append('text_content', form.text_content);

    if (form.post_type === 'image' && form.image) {
      formData.append('image', form.image);
    }
    if (form.post_type === 'video' && form.video) {
      formData.append('video', form.video);
    }

    try {
      await createPost(formData);
      toast.success("Post created!");
      setForm({ post_type: 'image', text_content: '', image: null, video: null });
      setFilePreview(null);
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
        className="max-w-3xl w-full mx-auto p-8 space-y-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-white tracking-wide mb-6">Create a Post</h2>

        <div className="flex flex-col lg:flex-row gap-8 mt-4 border border-gray-700 rounded-xl overflow-hidden">
          <div className="w-full lg:w-1/2 bg-gray-700 p-4 flex items-center justify-center">
            {filePreview ? (
              form.post_type === 'image' ? (
                <img src={filePreview} alt="Post Preview" className="w-full object-contain max-h-[500px]" />
              ) : (
                <video src={filePreview} controls className="w-full max-h-[500px]" />
              )
            ) : (
              <div className="text-gray-400 flex flex-col items-center justify-center">
                <FaImage className="h-16 w-16 mb-4" />
                <p className="text-lg">Image/Video Preview</p>
              </div>
            )}
          </div>
          <div className="w-full lg:w-1/2 p-6 space-y-6">
            <div className="relative">
              <select
                name="post_type"
                className="w-full p-4 border border-gray-700 rounded-xl bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10 text-lg"
                onChange={handleChange}
                value={form.post_type}
              >
                <option value="image" className="bg-gray-700 text-white text-lg">Image</option>
                <option value="video" className="bg-gray-700 text-white text-lg">Video</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                <FiChevronDown className="h-6 w-6" />
              </div>
            </div>

            <textarea
              name="text_content"
              className="w-full p-4 border border-gray-700 rounded-xl bg-gray-700 text-white placeholder:text-gray-400 resize-y min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              placeholder="Add a caption..."
              onChange={handleChange}
            />

            <div className="relative">
              <label
                htmlFor="file-upload"
                className="inline-flex items-center justify-center py-4 px-16 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer transition-colors duration-300 w-full text-lg"
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
          </div>
        </div>

        {form.image && form.post_type === 'image' && filePreview && (
          <p className="text-sm text-gray-400">Selected image: {form.image.name}</p>
        )}

        {form.video && form.post_type === 'video' && filePreview && (
          <p className="text-sm text-gray-400">Selected video: {form.video.name}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || (!form.image && form.post_type === 'image') || (!form.video && form.post_type === 'video')}
          className="bg-green-600 hover:bg-green-700 text-white py-4 px-8 rounded-xl transition-colors duration-300 font-semibold w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </motion.form>
    </div>
  );
}