import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('medistock_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('medistock_token'));
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        const userData = data.data;
        setUser(userData);
        localStorage.setItem('medistock_user', JSON.stringify(userData));

        // Connect socket and join rooms
        const socket = connectSocket();
        socket.emit('join:role', userData.role);
        socket.emit('join:user', userData._id);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { user: userData, token: newToken } = data.data;

    setUser(userData);
    setToken(newToken);
    localStorage.setItem('medistock_token', newToken);
    localStorage.setItem('medistock_user', JSON.stringify(userData));

    // Connect socket
    const socket = connectSocket();
    socket.emit('join:role', userData.role);
    socket.emit('join:user', userData._id);

    return userData;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    const { user: userData, token: newToken } = data.data;

    setUser(userData);
    setToken(newToken);
    localStorage.setItem('medistock_token', newToken);
    localStorage.setItem('medistock_user', JSON.stringify(userData));

    const socket = connectSocket();
    socket.emit('join:role', userData.role);
    socket.emit('join:user', userData._id);

    return userData;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('medistock_token');
    localStorage.removeItem('medistock_user');
    disconnectSocket();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
