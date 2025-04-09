import { useEffect, useState } from 'react';
import { fetchFriendList, acceptFriendRequest } from '../services/friends';
import toast from 'react-hot-toast';
import { useFriendContext } from '../context/FriendContext';

export default function Friends() {
  const { refreshFriends, triggerRefresh } = useFriendContext();
  const [friends, setFriends] = useState([]);
  const [pendingReceived, setPendingReceived] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFriends = () => {
    setLoading(true);
    fetchFriendList()
      .then(res => {
        setFriends(res?.data?.friends || []);
        setPendingReceived(res?.data?.pending_requests_received || []);
        setPendingSent(res?.data?.pending_requests_sent || []);
      })
      .catch(err => {
        console.error('Failed to fetch friend list', err);
        setError("Could not load friend data.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFriends();
  }, [refreshFriends]);

  const acceptRequest = async id => {
    try {
      await acceptFriendRequest(id);
      toast.success("Friend request accepted!");
      triggerRefresh();
    } catch {
      toast.error("Something went wrong while accepting");
    }
  };

  if (loading) return <p className="p-4">Loading friends...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Your Friends</h2>
      {friends.length === 0 ? (
        <p className="text-gray-600 mb-6">No friends yet.</p>
      ) : (
        <ul className="list-disc pl-6 mb-6 space-y-1">
          {friends.map(f => (
            <li key={f.id} className="text-gray-800">{f.username}</li>
          ))}
        </ul>
      )}

      <h2 className="text-xl font-bold mb-3">Pending Friend Requests</h2>

      {/* Received Requests (with Accept option) */}
      {pendingReceived.length === 0 ? (
        <p className="text-gray-600">No pending requests to accept.</p>
      ) : (
        <ul className="space-y-3 mb-6">
          {pendingReceived.map(req => (
            <li key={req.id} className="flex justify-between items-center bg-white p-3 shadow rounded">
              <span><strong>{req.sender}</strong> sent you a friend request</span>
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

      {/* Sent Requests (informational) */}
      <h2 className="text-xl font-bold mb-3">Requests You've Sent</h2>
      {pendingSent.length === 0 ? (
        <p className="text-gray-600">You haven't sent any requests.</p>
      ) : (
        <ul className="space-y-3">
          {pendingSent.map(req => (
            <li key={req.id} className="flex justify-between items-center bg-gray-50 p-3 shadow-sm rounded text-gray-700">
              <span>Friend request sent to <strong>{req.receiver}</strong></span>
              <span className="text-sm text-gray-400 italic">Pending</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
