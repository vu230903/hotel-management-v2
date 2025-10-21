import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Load user from localStorage on init
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Kiểm tra user đã đăng nhập chưa
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          const response = await authAPI.getMe();
          console.log('Auth check response:', response);
          const userData = response.data.data.user;
          setUser(userData);
          // Sync to localStorage
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user: userData, token: newToken } = response.data.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      
      return { success: true, data: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Đăng nhập thất bại' 
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('🔐 AuthContext: Attempting register with:', userData);
      const response = await authAPI.register(userData);
      console.log('🔐 AuthContext: Register response:', response);
      
      if (response.data && response.data.success) {
      const { user: newUser, token: newToken } = response.data.data;
      
        console.log('✅ AuthContext: Register successful, user:', newUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      
      return { success: true, data: newUser };
      } else {
        console.error('❌ AuthContext: Register failed - invalid response format');
        return { 
          success: false, 
          message: 'Invalid response format' 
        };
      }
    } catch (error) {
      console.error('❌ AuthContext: Register error:', error);
      console.error('❌ AuthContext: Error response:', error.response?.data);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Đăng ký thất bại' 
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      return { success: true, message: 'Đổi mật khẩu thành công' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Đổi mật khẩu thất bại' 
      };
    }
  };

  const isAdmin = () => user?.role === 'admin';
  const isReception = () => user?.role === 'reception';
  const isCustomer = () => user?.role === 'customer';
  const isCleaning = () => user?.role === 'cleaning';
  const isStaff = () => isAdmin() || isReception() || isCleaning();

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    changePassword,
    isAdmin,
    isReception,
    isCustomer,
    isCleaning,
    isStaff,
    setUser,
    setToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
