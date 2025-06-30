import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { NotificationsProvider } from './contexts/AuthContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { SocketProvider } from './contexts/SocketContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NotificationsProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </NotificationsProvider>
    </AuthProvider>
  </StrictMode>
);
