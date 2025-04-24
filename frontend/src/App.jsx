// src/App.js
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider, { useAuth } from './context/AuthContext';
import { FollowContextProvider } from './context/FollowContext';
import { NotificationProvider } from './context/NotificationContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import NavBar from './components/NavBar';
import ProfilePage from './pages/ProfilePage';
import UserProfile from './pages/UserProfile';
import Follows from './pages/Follows';
import ChatPage from './pages/ChatPage';
import SearchPage from './pages/SearchPage';
import NotificationsPage from './pages/NotificationsPage';

function ProtectedRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('access');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Separate wrapper to access `user` inside `NotificationProvider`
function AppRoutesWrapper() {
  const { user } = useAuth();

  return (
    <NotificationProvider userId={user?.id}>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/:username" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/follows" element={<ProtectedRoute><Follows /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/chat/:username" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </NotificationProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FollowContextProvider>
        <AppRoutesWrapper />
      </FollowContextProvider>
    </AuthProvider>
  );
}