import { useEffect, useState } from 'react';
import { fetchFollows, acceptFollowRequest, sendFollowRequest } from '../services/follows';
import toast from 'react-hot-toast';
import { useFollowContext } from '../context/FollowContext';

const baseURL = 'http://127.0.0.1:8000';

export default function Follows() {
  const { refreshFriends, triggerRefresh } = useFollowContext();
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [mutuals, setMutuals] = useState([]);
  const [requestsReceived, setRequestsReceived] = useState([]);
  const [requestsSent, setRequestsSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const followingIds = following.map(user => user.id);
  const sentRequestIds = requestsSent.map(user => user.id);

  const loadFollows = () => {
    setLoading(true);
    fetchFollows()
      .then(res => {
        setFollowers(res?.data?.followers || []);
        setFollowing(res?.data?.following || []);
        setMutuals(res?.data?.mutual_follows || []);
        setRequestsReceived(res?.data?.requests_received || []);
        setRequestsSent(res?.data?.requests_sent || []);
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

  const renderUserCard = (user, showFollowBack = false) => {
    const alreadyFollowing = followingIds.includes(user.id);
    const alreadySent = sentRequestIds.includes(user.id);

    return (
      <div key={user.id} className="flex items-center justify-between bg-white p-3 shadow rounded mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={user.profile_pic ? `${baseURL}${user.profile_pic}` : '/default-avatar.png'}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="font-semibold">{user.username}</span>
        </div>

        {showFollowBack && !alreadyFollowing && (
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
      <div className="mb-6">
        <h2 className="text-xl font-bold">Your Stats</h2>
        <p className="text-gray-600">Followers: {followers.length}</p>
        <p className="text-gray-600">Following: {following.length}</p>
        <p className="text-gray-600">Mutual Follows: {mutuals.length}</p>
      </div>

      <h2 className="text-xl font-bold mb-3">Mutual Follows</h2>
      {mutuals.length === 0 ? <p className="text-gray-600 mb-6">No mutuals yet.</p> :
        mutuals.map(user => renderUserCard(user))}

      <h2 className="text-xl font-bold mb-3 mt-6">You Follow</h2>
      {following.length === 0 ? <p className="text-gray-600 mb-6">You're not following anyone.</p> :
        following.map(user => renderUserCard(user))}

      <h2 className="text-xl font-bold mb-3 mt-6">Followers</h2>
      {followers.length === 0 ? <p className="text-gray-600 mb-6">No one is following you yet.</p> :
        followers.map(user => renderUserCard(user, true))}

      <h2 className="text-xl font-bold mb-3 mt-6">Follow Requests Received</h2>
      {requestsReceived.length === 0 ? (
        <p className="text-gray-600">No pending requests to accept.</p>
      ) : (
        <ul className="space-y-3 mb-6">
          {requestsReceived.map(req => (
            <li key={req.id} className="flex justify-between items-center bg-white p-3 shadow rounded">
              <span><strong>{req.from_user.username}</strong> wants to follow you</span>
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
              <span>Follow request sent to <strong>{req.to_user.username}</strong></span>
              <span className="text-sm text-gray-400 italic">Pending</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
