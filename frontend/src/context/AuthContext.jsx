import { createContext, useContext, useState } from 'react';

// ✅ Exporting AuthContext so it can be used in places like <PostCard /> or Home.jsx
export const AuthContext = createContext();

// ✅ Hook for convenience
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(localStorage.getItem('access') || null);
  const [refresh, setRefresh] = useState(localStorage.getItem('refresh') || null);

  const login = (data) => {
    setUser(data.user);
    setAccess(data.access);
    setRefresh(data.refresh);
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user)); // 👈 optional: store user info too
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
