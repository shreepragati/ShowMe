import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import AuthProvider from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Import your NotificationProvider
import { NotificationProvider } from './context/NotificationContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="524371104998-ep4u64k0hh08niem4ed0sgldq5e88g4b.apps.googleusercontent.com">
      <BrowserRouter>
        <Toaster position="top-right" />
        <AuthProvider>
          {/* Wrap your App with NotificationProvider */}
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
