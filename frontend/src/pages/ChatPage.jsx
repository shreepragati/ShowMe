import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchDetailedFollows } from '../services/follows';
import Chat from '../components/Chat';
import '../App.css'; // Corrected import statement

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
    <div className="flex w-full h-screen bg-gray-900 text-gray-300">

      {/* Left Sidebar */}
      <div className="w-[25%] bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Sticky Sidebar Header */}
        <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center px-4 shadow-md sticky top-0 z-10" style={{ position: 'sticky', top: '4rem' }}>
          <h2 className="text-lg font-bold text-gray-100">Chats</h2>
        </div>

        {/* Scrollable User List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-gray-500">Loading chats...</p>
          ) : (
            <ul>
              {mutuals.map(user => (
                <li
                  key={user.id}
                  className={`flex items-center p-3 hover:bg-gray-700 cursor-pointer ${user.username === username ? 'bg-gray-700' : ''}`}
                  onClick={() => handleUserClick(user.username)}
                >
                  <img
                    src={user.profile_pic ? `${baseURL}${user.profile_pic}` : `https://ui-avatars.com/api/?name=${user.username}&background=0D8ABC&color=fff&rounded=true&size=40`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <span className="font-medium text-gray-100">{user.username}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right Chat Section */}
      <div className="flex-1 flex flex-col h-screen bg-gray-900">
        {/* Sticky Chat Header */}
        <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center px-4 shadow-md sticky top-0 z-20" style={{ position: 'sticky', top: '4rem' }}>
          {mutuals.map(user => user.username === username && (
            <div key={user.id} className="flex items-center space-x-3">
              <img
                src={user.profile_pic ? `${baseURL}${user.profile_pic}` : `https://ui-avatars.com/api/?name=${user.username}&background=0D8ABC&color=fff&rounded=true&size=40`}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-100">{user.username}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable Chat Content with Top Padding */}
        <div className="flex-1 overflow-y-auto pt-16"> {/* Added pt-16 (padding-top) */}
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