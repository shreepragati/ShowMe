// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(localStorage.getItem('access') || null);
  const [refresh, setRefresh] = useState(localStorage.getItem('refresh') || null);
  const [refreshCounter, setRefreshCounter] = useState(0); // State to trigger refresh

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Failed to parse saved user:", err);
        localStorage.removeItem('user');
      }
    }
    // You might want to re-fetch user data or perform other actions based on refreshCounter
    // For example, if your backend updates user details upon follow/unfollow, you could trigger a fetch here.
    // For this example, we'll just log it.
    if (refreshCounter > 0 && user?.username) {
      console.log('AuthContext: Refresh triggered. You might want to re-fetch user data here.');
      // Example: fetchUserProfile(user.username).then(updatedUser => setUser(updatedUser));
    }
  }, [refreshCounter, user?.username]);

  const login = (data) => {
    setUser(data.user);
    setAccess(data.access);
    setRefresh(data.refresh);

    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
  };

  const logout = () => {
    setUser(null);
    setAccess(null);
    setRefresh(null);
    localStorage.clear();
  };

  const triggerRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <AuthContext.Provider value={{ user, access, refresh, login, logout, triggerRefresh }}>
      {children}
    </AuthContext.Provider>
  );
}