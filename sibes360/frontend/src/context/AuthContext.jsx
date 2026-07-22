import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Intercept responses to unwrap paginated results from the backend automatically
axios.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'results' in response.data && 'count' in response.data) {
      response.data = response.data.results;
    }
    return response;
  },
  (error) => Promise.reject(error)
);

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInstitucion, setSelectedInstState] = useState(() => {
    return localStorage.getItem('sibes360_selected_institucion') || '';
  });

  const setSelectedInstitucion = (id) => {
    setSelectedInstState(id);
    if (id) {
      localStorage.setItem('sibes360_selected_institucion', id);
    } else {
      localStorage.removeItem('sibes360_selected_institucion');
    }
  };

  // Initialize Auth headers from localStorage on boot
  useEffect(() => {
    const storedUser = localStorage.getItem('sibes360_user');
    const storedToken = localStorage.getItem('sibes360_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);


  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        username,
        password
      });

      const { access, refresh, user: userData } = response.data;

      // Save credentials
      localStorage.setItem('sibes360_user', JSON.stringify(userData));
      localStorage.setItem('sibes360_token', access);
      localStorage.setItem('sibes360_refresh_token', refresh);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error("Login failed:", error);
      const message = error.response?.data?.detail || "Usuario o contraseña incorrectos";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('sibes360_user');
    localStorage.removeItem('sibes360_token');
    localStorage.removeItem('sibes360_refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, selectedInstitucion, setSelectedInstitucion }}>
      {children}
    </AuthContext.Provider>
  );

};
