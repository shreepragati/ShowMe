import { useState } from 'react';
import { searchUsers } from '../services/search';

const baseURL = 'http://127.0.0.1:8000';

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

      <div className="mt-4 w-full max-w-md space-y-3">
        {results.map(user => (
          <div
            key={user.id}
            className="flex items-center gap-4 p-2 border rounded shadow-sm"
          >
            <img
              src={user.profile_pic ? `${baseURL}${user.profile_pic}` : '/default-avatar.png'}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover border"
            />
            <span className="text-lg font-medium">{user.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSearch;
