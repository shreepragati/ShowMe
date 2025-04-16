import { useEffect, useState } from 'react';
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
      triggerRefresh();
    } catch {
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
      <div key={user.id} className="flex items-center justify-between bg-white p-3 shadow rounded mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={user.profile_pic ? `${baseURL}${user.profile_pic}` : '/default-avatar.png'}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <Link to={`/profile/${user.username}`} className="font-semibold hover:underline">
            {user.username}
          </Link>
        </div>

        {!alreadyFollowing && (
          <button
            onClick={() => followBack(user)}
            disabled={alreadySent}
            className={`text-sm px-3 py-1 rounded ${alreadySent ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            {alreadySent ? 'Pending' : 'Follow Back'}
          </button>
        )}
      </div>
    );
  };

  if (loading) return <p className="p-4">Loading follow data...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-3">Mutual Follows</h2>
      {mutuals.length === 0 ? (
        <p className="text-gray-600 mb-6">No mutual friends yet.</p>
      ) : (
        mutuals.map(user => renderUserCard(user))
      )}

      <h2 className="text-xl font-bold mb-3 mt-6">Follow Requests Received</h2>
      {requestsReceived.length === 0 ? (
        <p className="text-gray-600">No pending requests to accept.</p>
      ) : (
        <ul className="space-y-3 mb-6">
          {requestsReceived.map(req => (
            <li key={req.id} className="flex justify-between items-center bg-white p-3 shadow rounded">
              <Link to={`/profile/${req.from_user.username}`} className="font-semibold hover:underline">
                {req.from_user.username}
              </Link>
              <button
                onClick={() => acceptRequest(req.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              >
                Accept
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-xl font-bold mb-3 mt-6">Follow Requests Sent</h2>
      {requestsSent.length === 0 ? (
        <p className="text-gray-600">You haven't sent any follow requests.</p>
      ) : (
        <ul className="space-y-3">
          {requestsSent.map(req => (
            <li key={req.id} className="flex justify-between items-center bg-gray-50 p-3 shadow-sm rounded text-gray-700">
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
    </div>
  );
}
