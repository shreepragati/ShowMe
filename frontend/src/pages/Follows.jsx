import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFollows, acceptFollowRequest, sendFollowRequest } from '../services/follows';
import toast from 'react-hot-toast';
import { useFollowContext } from '../context/FollowContext';

const baseURL = 'http://127.0.0.1:8000';

export default function Follows() {
  const { refreshFriends, triggerRefresh } = useFollowContext();
  const [mutuals, setMutuals] = useState([]);
  const [requestsReceived, setRequestsReceived] = useState([]);
  const [requestsSent, setRequestsSent] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('mutuals');

  const sentRequestIds = requestsSent.map(user => user.id);

  const loadFollows = () => {
    setLoading(true);
    fetchFollows()
      .then(res => {
        setMutuals(res?.data?.mutual_follows || []);
        setRequestsReceived(res?.data?.requests_received || []);
        setRequestsSent(res?.data?.requests_sent || []);
        setFollowing(res?.data?.following || []);
      })
      .catch(err => {
        console.error('Failed to fetch follow data', err);
        setError("Could not load follow data.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFollows();
  }, [refreshFriends]);

  const acceptRequest = async id => {
    try {
      await acceptFollowRequest(id);
      toast.success("Follow request accepted!");
      loadFollows();
      triggerRefresh();
    } catch (err) {
      console.error("Accept request error:", err);
      toast.error("Something went wrong while accepting");
    }
  };

  const followBack = async user => {
    try {
      await sendFollowRequest(user.id);
      toast.success(user.privacy === 'public' ? 'Followed!' : 'Follow request sent');
      triggerRefresh();
    } catch {
      toast.error("Failed to follow back");
    }
  };

  const renderUserCard = (user) => {
    const alreadySent = sentRequestIds.includes(user.id);
    const alreadyFollowing = following.map(f => f.id).includes(user.id);

    return (
      <div
        key={user.id}
        className="flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-lg hover:scale-[1.01] transition-transform duration-300"
      >
        <div className="flex items-center space-x-4">
          <img
            src={user.profile_pic ? `${user.profile_pic}` : `https://ui-avatars.com/api/?name=${user.username}&background=0D8ABC&color=fff&rounded=true&size=128`}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
          />
          <Link to={`/profile/${user.username}`} className="text-lg font-semibold hover:underline">
            {user.username}
          </Link>
        </div>

        <div className="flex gap-2">
          {!alreadyFollowing && (
            <button
              onClick={() => followBack(user)}
              disabled={alreadySent}
              className={`text-sm px-4 py-2 rounded-xl font-medium transition duration-300 ${alreadySent
                ? 'bg-yellow-300/20 text-yellow-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {alreadySent ? 'Pending' : 'Follow Back'}
            </button>
          )}

          {mutuals.find(m => m.id === user.id) && (
            <Link
              to={`/chat/${user.username}`}
              className="text-sm px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition duration-300"
            >
              Chat
            </Link>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <p className="p-6 text-white text-center">Loading follow data...</p>;
  if (error) return <p className="p-6 text-red-500 text-center">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0f2027] to-[#203a43] text-white p-6">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="p-6 max-w-4xl mx-auto bg-gray-900 min-h-screen text-white rounded-xl shadow-xl">
          <div className="flex justify-around mb-8">
            <button
              onClick={() => setActiveTab('mutuals')}
              className={`px-6 py-2 rounded-xl font-semibold transition-colors duration-300 ${activeTab === 'mutuals'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
            >
              Mutual Follows
            </button>
            <button
              onClick={() => setActiveTab('requestsReceived')}
              className={`px-6 py-2 rounded-xl font-semibold transition-colors duration-300 ${activeTab === 'requestsReceived'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
            >
              Requests Received
            </button>
            <button
              onClick={() => setActiveTab('requestsSent')}
              className={`px-6 py-2 rounded-xl font-semibold transition-colors duration-300 ${activeTab === 'requestsSent'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
            >
              Requests Sent
            </button>
          </div>

          {activeTab === 'mutuals' && (
            <>
              <h2 className="text-2xl font-bold border-b border-white/20 pb-2 mb-4 tracking-wide">Mutual Follows</h2>
              {mutuals.length === 0 ? (
                <p className="text-gray-400 italic">No mutual friends yet.</p>
              ) : (
                mutuals.map(user => renderUserCard(user))
              )}
            </>
          )}

          {activeTab === 'requestsReceived' && (
            <>
              <h2 className="text-3xl font-bold mb-4 border-b border-gray-700 pb-2">Follow Requests Received</h2>
              {requestsReceived.length === 0 ? (
                <p className="text-gray-400">No pending requests to accept.</p>
              ) : (
                <ul className="space-y-4">
                  {requestsReceived.map(req => (
                    <li key={req.id} className="flex justify-between items-center bg-gray-800 p-4 rounded-xl shadow">
                      <Link to={`/profile/${req.from_user.username}`} className="text-white font-semibold hover:underline">
                        {req.from_user.username}
                      </Link>
                      <button
                        onClick={() => acceptRequest(req.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors duration-300"
                      >
                        Accept
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {activeTab === 'requestsSent' && (
            <>
              <h2 className="text-3xl font-bold mb-4 border-b border-gray-700 pb-2">Follow Requests Sent</h2>
              {requestsSent.length === 0 ? (
                <p className="text-gray-400">You haven't sent any follow requests.</p>
              ) : (
                <ul className="space-y-4">
                  {requestsSent.map(req => (
                    <li key={req.id} className="flex justify-between items-center bg-gray-800 p-4 rounded-xl text-white shadow">
                      <span>
                        Follow request sent to{' '}
                        <Link to={`/profile/${req.to_user.username}`} className="font-semibold hover:underline">
                          {req.to_user.username}
                        </Link>
                      </span>
                      <span className="text-sm text-gray-400 italic">Pending</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

