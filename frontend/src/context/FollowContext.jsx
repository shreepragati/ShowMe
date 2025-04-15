import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const FollowContext = createContext();

const token = localStorage.getItem('access');



export const FollowContextProvider = ({ children }) => {
  const [refreshFollows, setRefreshFollows] = useState(0);
  const [following, setFollowing] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const triggerRefresh = () => {
    setRefreshFollows(prev => prev + 1);
  };

  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/follows/my-follows/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const followingIds = res.data.following.map(user => user.id);
        const sentRequestIds = res.data.requests_sent.map(user => user.id);

        setFollowing(followingIds);
        setSentRequests(sentRequestIds);
      } catch (err) {
        console.error('Error fetching follow data:', err.message || err);
        setFollowing([]);
        setSentRequests([]);
      }
    };

    fetchFollowData();
  }, [refreshFollows]);

  return (
    <FollowContext.Provider value={{ following, sentRequests, refreshFollows, triggerRefresh }}>
      {children}
    </FollowContext.Provider>
  );
};

export const useFollowContext = () => useContext(FollowContext);
