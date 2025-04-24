import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { sendFollowRequest } from '../services/follows';
import { fetchProfileWithPosts, updateProfile } from '../services/profile';
import { fetchFollows } from '../services/follows';
import { deletePost } from '../services/posts';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Import the cross icon

const baseURL = 'http://127.0.0.1:8000';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [menuOpenPostId, setMenuOpenPostId] = useState(null);
  const { user, triggerRefresh } = useContext(AuthContext);
  const [sentRequestIds, setSentRequestIds] = useState([]);

  useEffect(() => {
    if (!user || !user.username) return;

    fetchProfileWithPosts(user.username)
      .then(res => {
        const data = res.data;
        const profileData = data.profile;

        setProfile({
          ...profileData,
          followers_count: data.followers_count,
          following_count: data.following_count,
          mutual_follow_count: data.mutual_follow_count,
        });

        setFormData({
          email: profileData.email || '',
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          dob: profileData.dob || '',
          bio: profileData.bio || '',
          privacy: profileData.privacy || 'public',
          profile_pic: profileData.profile_pic || null,
        });

        setMyPosts(data.posts || []);
      })
      .catch(console.error);
  }, [user]);

  const fetchFollowLists = async () => {
    try {
      const res = await fetchFollows();
      setFollowersList(res.data.followers || []);
      setFollowingList(res.data.following || []);
      setSentRequestIds(res.data.requests_sent.map(r => r.to_user.id));
    } catch (err) {
      console.error('Failed to fetch follow lists', err);
    }
  };

  const handleFollowBack = async (userToFollow) => {
    try {
      await sendFollowRequest(userToFollow.id);
      toast.success(userToFollow.privacy === 'public' ? 'Followed!' : 'Follow request sent');
      triggerRefresh();
      fetchFollowLists();
      setProfile(prev => ({
        ...prev,
        followers_count: prev.followers_count - 1,
        following_count: prev.following_count + 1,
      }));
    } catch (err) {
      console.error('Failed to follow back', err);
      toast.error('Failed to follow back');
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files && files.length > 0 ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['email', 'first_name', 'last_name', 'dob', 'bio', 'privacy'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill out the ${field.replace('_', ' ')} field.`);
        return;
      }
    }

    try {
      const data = new FormData();
      for (const key in formData) {
        if (key === 'profile_pic' && formData.profile_pic instanceof File) {
          data.append('profile_pic', formData.profile_pic);
        } else if (key !== 'profile_pic') { // Only append other fields
          data.append(key, formData[key]);
        }
        // If formData.profile_pic is a string (existing URL), we don't append it.
        // The server should handle this case.
      }

      await updateProfile(data);

      const refreshed = await fetchProfileWithPosts(user.username);
      const newData = refreshed.data;
      const newProfile = newData.profile;

      setProfile({
        ...newProfile,
        followers_count: newData.followers_count,
        following_count: newData.following_count,
        mutual_follow_count: newData.mutual_follow_count,
      });

      setFormData({
        email: newProfile.email || '',
        first_name: newProfile.first_name || '',
        last_name: newProfile.last_name || '',
        dob: newProfile.dob || '',
        bio: newProfile.bio || '',
        privacy: newProfile.privacy || 'public',
        profile_pic: newProfile.profile_pic || null,
      });

      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Update failed', err);
      toast.error('Failed to update profile.');
    }
  };


  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      toast.success('Post deleted!');
      setMyPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
      toast.error('Failed to delete post');
    }
  };

  const renderUserCard = (follower) => {
    const isFollowing = followingList.some(f => f.id === follower.id);
    const canFollowBack = !isFollowing && follower.id !== user.id;
    const alreadySentRequest = sentRequestIds.includes(follower.id);

    return (
      <div
        key={follower.id}
        className="flex items-center justify-between space-x-3 bg-gray-800 text-white p-3 rounded mb-2"
      >
        <div className="flex items-center space-x-3">
          <img
            src={follower.profile_pic ? `${baseURL}${follower.profile_pic}` : `https://ui-avatars.com/api/?name=${follower.username}&background=0D8ABC&color=fff&rounded=true&size=128`}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <Link
            to={`/profile/${follower.username}`}
            className="font-medium text-blue-400 hover:underline"
          >
            {follower.username}
          </Link>
        </div>
        {canFollowBack && (
          <button
            onClick={() => handleFollowBack(follower)}
            disabled={alreadySentRequest}
            className={`text-sm px-3 py-1 rounded ${alreadySentRequest
              ? 'bg-yellow-500 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {alreadySentRequest ? 'Pending' : 'Follow Back'}
          </button>
        )}
      </div>
    );
  };

  if (!user || !profile) return <div className="text-center py-10 text-white">Loading profile...</div>;

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen relative">
      <div className="flex flex-col items-center text-center pb-8 border-b border-gray-800">
        <img
          src={profile.profile_pic ? `${baseURL}${profile.profile_pic}` : `https://ui-avatars.com/api/?name=${user.username}&background=0D8ABC&color=fff&rounded=true&size=128`}
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover border-2 border-blue-500 mb-3"
        />
        <h2 className="text-2xl font-semibold">{profile.username}</h2>

        <div className="flex gap-4 mt-3 rounded-md bg-gray-800 p-2">
          <button
            className={`px-4 py-2 rounded-md text-lg ${activeTab === 'posts' ? 'bg-blue-500 text-white font-semibold' : 'text-gray-300 hover:text-white'}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts <span className="font-semibold text-sm">({myPosts.length})</span>
          </button>
          <button
            className={`px-4 py-2 rounded-md text-lg ${activeTab === 'followers' ? 'bg-blue-500 text-white font-semibold' : 'text-gray-300 hover:text-white'}`}
            onClick={() => {
              setActiveTab('followers');
              fetchFollowLists();
            }}
          >
            Followers <span className="font-semibold text-sm">({profile.followers_count || 0})</span>
          </button>
          <button
            className={`px-4 py-2 rounded-md text-lg ${activeTab === 'following' ? 'bg-blue-500 text-white font-semibold' : 'text-gray-300 hover:text-white'}`}
            onClick={() => {
              setActiveTab('following');
              fetchFollowLists();
            }}
          >
            Following <span className="font-semibold text-sm">({profile.following_count || 0})</span>
          </button>
        </div>
        <button
          onClick={() => setEditing(true)} // Changed to true to open the modal
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-4"
        >
          Edit Profile
        </button>
      </div>

      <div className="mt-6 text-sm space-y-1 max-w-lg mx-auto">
        <h3 className="font-semibold mb-3 text-lg border-b border-gray-800 pb-2">User Details</h3>
        <p><strong>Name:</strong> {profile.first_name || ''} {profile.last_name || ''}</p>
        <p><strong>Email:</strong> {profile.email || 'Not provided'}</p>
        <p><strong>DOB:</strong> {profile.dob || 'Not provided'}</p>
        <p><strong>Bio:</strong> {profile.bio || 'Not provided'}</p>
        <p><strong>Privacy:</strong> {profile.privacy || 'Not specified'}</p>
      </div>

      {editing && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-md shadow-lg w-full max-w-md relative">
            <div className="absolute top-2 right-2">
              <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="profile_pic" className="block text-gray-300 text-sm font-bold mb-2">
                  Profile Picture:
                </label>
                <input type="file" id="profile_pic" name="profile_pic" onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 text-white" />
                {formData.profile_pic && (
                  <img
                    src={formData.profile_pic instanceof File ? URL.createObjectURL(formData.profile_pic) : `${baseURL}${formData.profile_pic}`}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-700 mt-2"
                  />
                )}
              </div>
              {['email', 'first_name', 'last_name', 'dob', 'bio'].map(field => (
                <div key={field}>
                  <label htmlFor={field} className="block text-gray-300 text-sm font-bold mb-2 capitalize">
                    {field.replace('_', ' ')}:
                  </label>
                  <input
                    type={field === 'dob' ? 'date' : 'text'}
                    id={field}
                    name={field}
                    value={formData[field] || ''}
                    onChange={handleChange}
                    className="custom-date-icon shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 text-white"
                    placeholder={field.replace('_', ' ')} // Added placeholder
                  />
                </div>
              ))}
              <div>
                <label htmlFor="privacy" className="block text-gray-300 text-sm font-bold mb-2">
                  Privacy:
                </label>
                <select
                  id="privacy"
                  name="privacy"
                  value={formData.privacy}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 text-white"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setEditing(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'followers' && (
        <div className="mt-6 max-w-lg mx-auto">
          <h3 className="font-semibold mb-3 text-lg border-b border-gray-800 pb-2">Followers</h3>
          {followersList.length === 0 ? (
            <p className="text-gray-400">No followers yet.</p>
          ) : (
            followersList.map(renderUserCard)
          )}
        </div>
      )}

      {activeTab === 'following' && (
        <div className="mt-6 max-w-lg mx-auto">
          <h3 className="font-semibold mb-3 text-lg border-b border-gray-800 pb-2">Following</h3>
          {followingList.length === 0 ? (
            <p className="text-gray-400">You're not following anyone.</p>
          ) : (
            followingList.map(renderUserCard)
          )}
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {myPosts.map(post => (
            <div key={post.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <p className="font-semibold text-lg">{post.caption || 'No caption'}</p>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded focus:outline-none focus:shadow-outline"
                  >
                    Delete
                  </button>
                </div>
                {post.image && (
                  <img src={`${baseURL}${post.image}`} alt="Post" className="mt-2 rounded-md w-full object-cover" style={{ maxHeight: 'none' }} />
                )}
                {post.video && (
                  <video controls className="mt-2 rounded-md w-full" style={{ maxHeight: 'none' }}>
                    <source src={`${baseURL}${post.video}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
          ))}
          {myPosts.length === 0 && <p className="text-gray-400 mt-4 text-center col-span-full">No posts yet.</p>}
        </div>
      )}
    </div>
  );
}