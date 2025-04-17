// src/components/UserSearch.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { searchUsers } from '../services/search';

const baseURL = 'http://127.0.0.1:8000'; // ✅ Same base URL as in ProfileIcon

const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (query.trim() === '') return;
    try {
      const users = await searchUsers(query);
      setResults(users);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  return (
    <div className="p-4 flex flex-col items-center">
      {/* Search Input */}
      <div className="flex items-center mb-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search users..."
          className="border p-2 rounded w-64"
        />
        <button
          onClick={handleSearch}
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
        >
          Search
        </button>
      </div>

      {/* Search Results */}
      <div className="w-full max-w-md space-y-3">
        {results.map(user => {
          const profilePic = user.profile_pic
            ? `${baseURL}${user.profile_pic}`
            : null;

          return (
            <Link
              to={`/profile/${user.username}`}
              key={user.id}
              className="flex items-center gap-4 p-3 border rounded-lg shadow-sm hover:bg-gray-50 transition"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-200 flex items-center justify-center text-white text-sm">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500">?</span>
                )}
              </div>
              <span className="text-lg font-medium text-blue-700">
                {user.username}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default UserSearch;
