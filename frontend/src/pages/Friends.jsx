import { useEffect, useState } from 'react';
import { fetchFriendList, acceptFriendRequest } from '../services/friends';
import toast from 'react-hot-toast';

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFriendList()
      .then(res => {
        setFriends(res?.data?.friends || []);
        setPending(res?.data?.pending_requests || []);
      })
      .catch(err => {
        console.error('Failed to fetch friend list', err);
        setError("Could not load friend data.");
      })
      .finally(() => setLoading(false));
  }, []);

  const acceptRequest = async id => {
    try {
      await acceptFriendRequest(id);
      setPending(prev => prev.filter(r => r.id !== id));
      toast.success("Friend request accepted!");
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

      <h2 className="text-xl font-bold mb-3">Pending Requests</h2>
      {pending.length === 0 ? (
        <p className="text-gray-600">No pending requests.</p>
      ) : (
        <ul className="space-y-3">
          {pending.map(req => (
            <li key={req.id} className="flex justify-between items-center bg-white p-3 shadow rounded">
              <span>{req.sender} wants to be your friend</span>
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
    </div>
  );
}
