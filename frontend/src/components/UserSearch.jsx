import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchUsers } from '../services/search';

const baseURL = 'http://127.0.0.1:8000';

const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.trim() === '') {
        setResults([]);
        return;
      }
      try {
        const users = await searchUsers(debouncedQuery);
        setResults(users);
      } catch (err) {
        console.error('Search failed', err);
      }
    };
    fetchResults();
  }, [debouncedQuery]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search users..."
        className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div
        className="w-full space-y-3 max-h-96 overflow-y-auto custom-scrollbar"
        style={{ maxHeight: '400px' }} // Adjust this to the desired height for the scrollable area
      >
        {results.map(user => {
          const profilePic = user.profile_pic
            ? `${user.profile_pic}`
            : `https://ui-avatars.com/api/?name=${user.username}&background=0D8ABC&color=fff&rounded=true&size=128`;

          return (
            <Link
              to={`/profile/${user.username}`}
              key={user.id}
              className="flex items-center gap-4 p-3 border border-gray-700 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">?</span>
                )}
              </div>
              <span className="text-lg font-medium text-white">
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
