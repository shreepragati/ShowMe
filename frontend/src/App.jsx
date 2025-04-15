import { Routes, Route, Navigate } from 'react-router-dom';
import { FollowContextProvider } from './context/FollowContext'; // Import the FollowContextProvider
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import NavBar from './components/NavBar';
import ProfilePage from './pages/ProfilePage';
import UserProfile from './pages/UserProfile';
import Follows from './pages/Follows';

const isAuthenticated = () => !!localStorage.getItem('access');

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <FollowContextProvider> {/* Wrap your app with the FollowContextProvider */}
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/follows" element={<ProtectedRoute><Follows /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </FollowContextProvider>
  );
}
