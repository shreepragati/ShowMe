import { useEffect, useState } from 'react';
import { fetchFriendList, acceptFriendRequest } from '../services/friends';
import toast from 'react-hot-toast';

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);

  useEffect(() => {
    fetchFriendList().then(res => {
      setFriends(res.data.friends);
      setPending(res.data.pending_requests);
    });
  }, []);

  const acceptRequest = async id => {
    try {
      await acceptFriendRequest(id);
      const updated = pending.filter(r => r.id !== id);
      setPending(updated);
      toast.success("Friend request accepted!");
    } catch {
      toast.error("Something went wrong while accepting");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Your Friends</h2>
      {friends.length === 0 ? <p>No friends yet.</p> : (
        <ul className="list-disc pl-6 mb-6">{friends.map(f => <li key={f.id}>{f.username}</li>)}</ul>
      )}
      <h2 className="text-xl font-bold">Pending Requests</h2>
      {pending.length === 0 ? <p>No pending requests.</p> : (
        <ul className="space-y-2">
          {pending.map(req => (
            <li key={req.id} className="flex justify-between items-center">
              {req.sender} wants to be your friend
              <button onClick={() => acceptRequest(req.id)} className="bg-blue-600 text-white px-3 py-1 rounded">Accept</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
