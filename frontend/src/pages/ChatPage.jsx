import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchDetailedFollows } from '../services/follows';
import Chat from '../components/Chat';

const baseURL = 'http://127.0.0.1:8000';

export default function ChatPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [mutuals, setMutuals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetailedFollows()
      .then(res => {
        setMutuals(res?.data?.mutual_follows || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUserClick = (username) => {
    navigate(`/chat/${username}`);
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-[25%] bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">Chats</h2>
        </div>
        {loading ? (
          <p className="p-4 text-gray-500">Loading chats...</p>
        ) : (
          <ul>
            {mutuals.map(user => (
              <li
                key={user.id}
                className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer ${
                  user.username === username ? 'bg-gray-100' : ''
                }`}
                onClick={() => handleUserClick(user.username)}
              >
                <img
                  src={user.profile_pic ? `${baseURL}${user.profile_pic}` : '/default-avatar.png'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <span className="font-medium">{user.username}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right Chat Section */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat Header */}
        <div className="h-16 bg-white border-b flex items-center px-4 shadow-sm">
          {mutuals.map(user => user.username === username && (
            <div key={user.id} className="flex items-center space-x-3">
              <img
                src={user.profile_pic ? `${baseURL}${user.profile_pic}` : '/default-avatar.png'}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{user.username}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Box */}
        <div className="flex-1 h-0">
          {username ? (
            <Chat otherUsername={username} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a chat to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
