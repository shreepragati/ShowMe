import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(localStorage.getItem('access') || null);
  const [refresh, setRefresh] = useState(localStorage.getItem('refresh') || null);

  // ✅ Safely restore user on page refresh
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
        // optional: clear corrupted localStorage
        localStorage.removeItem("user");
      }
    }
  }, []);

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

  return (
    <AuthContext.Provider value={{ user, access, refresh, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
