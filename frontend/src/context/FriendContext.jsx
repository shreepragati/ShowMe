import { createContext, useContext, useState } from 'react';

const FriendContext = createContext();

export const FriendContextProvider = ({ children }) => {
  const [refreshFriends, setRefreshFriends] = useState(0);

  const triggerRefresh = () => {
    setRefreshFriends(prev => prev + 1);
  };

  return (
    <FriendContext.Provider value={{ refreshFriends, triggerRefresh }}>
      {children}
    </FriendContext.Provider>
  );
};

export const useFriendContext = () => useContext(FriendContext);