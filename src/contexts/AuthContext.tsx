import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: 'student' | 'alumni' | 'prospective';
  university?: string;
  graduationYear?: string;
  currentSchool?: string;
  interestedProgram?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, accountType: 'student' | 'alumni' | 'prospective') => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
  setAuthState: (user: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  accountType: 'student' | 'alumni';
  university: string;
  graduationYear: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a default state instead of throwing error during initial render
    return {
      user: null,
      token: null,
      login: async () => ({ success: false, message: 'Auth not available' }),
      register: async () => ({ success: false, message: 'Auth not available' }),
      setAuthState: () => {},
      logout: () => {},
      isLoading: true
    };
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:5000/api';

  // Verify token on app load
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setUser(data.user);
            } else {
              // Invalid token
              localStorage.removeItem('token');
              setToken(null);
            }
          } else {
            // Invalid token or server error
            console.log('Token verification failed:', response.status);
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.log('Backend not available, continuing without auth');
          // Don't remove token if it's just a network error - backend might be down
          // localStorage.removeItem('token');
          // setToken(null);
        }
      }
      setIsLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (email: string, password: string, accountType: 'student' | 'alumni' | 'prospective') => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, accountType }),
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.log('Login error - backend may not be running:', error);
      return { success: false, message: 'Cannot connect to server. Please make sure the backend is running on port 5000.' };
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.log('Registration error - backend may not be running:', error);
      return { success: false, message: 'Cannot connect to server. Please make sure the backend is running on port 5000.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const setAuthState = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    setAuthState,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};