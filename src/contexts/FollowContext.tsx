import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface FollowCounts {
  followersCount: number;
  followingCount: number;
}

export interface FollowUser {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  accountType: 'student' | 'alumni';
  university: string;
}

interface FollowContextType {
  // Follow actions
  followUser: (userId: string) => Promise<boolean>;
  unfollowUser: (userId: string) => Promise<boolean>;
  checkFollowStatus: (userId: string) => Promise<boolean>;
  
  // Get follow data
  getFollowers: (userId: string) => Promise<FollowUser[]>;
  getFollowing: (userId: string) => Promise<FollowUser[]>;
  getFollowCounts: (userId: string) => Promise<FollowCounts>;
  
  // State
  loading: boolean;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

interface FollowProviderProps {
  children: ReactNode;
}

export const FollowProvider = ({ children }: FollowProviderProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const followUser = useCallback(async (userId: string): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/follow/${userId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (data.success) {
        return true;
      } else {
        console.error('Follow failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Follow error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const unfollowUser = useCallback(async (userId: string): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/follow/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (data.success) {
        return true;
      } else {
        console.error('Unfollow failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Unfollow error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const checkFollowStatus = useCallback(async (userId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`${API_BASE_URL}/follow/status/${userId}`, {
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (data.success) {
        return data.isFollowing;
      } else {
        console.error('Check follow status failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Check follow status error:', error);
      return false;
    }
  }, [user]);

  const getFollowers = useCallback(async (userId: string): Promise<FollowUser[]> => {
    if (!user) return [];
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}/followers`, {
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (data.success) {
        return data.followers;
      } else {
        console.error('Get followers failed:', data.message);
        return [];
      }
    } catch (error) {
      console.error('Get followers error:', error);
      return [];
    }
  }, [user]);

  const getFollowing = useCallback(async (userId: string): Promise<FollowUser[]> => {
    if (!user) return [];
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}/following`, {
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (data.success) {
        return data.following;
      } else {
        console.error('Get following failed:', data.message);
        return [];
      }
    } catch (error) {
      console.error('Get following error:', error);
      return [];
    }
  }, [user]);

  const getFollowCounts = useCallback(async (userId: string): Promise<FollowCounts> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}/follow-counts`);
      const data = await response.json();
      
      if (data.success) {
        return {
          followersCount: data.followersCount,
          followingCount: data.followingCount
        };
      } else {
        console.error('Get follow counts failed:', data.message);
        return { followersCount: 0, followingCount: 0 };
      }
    } catch (error) {
      console.error('Get follow counts error:', error);
      return { followersCount: 0, followingCount: 0 };
    }
  }, []);

  const value: FollowContextType = {
    followUser,
    unfollowUser,
    checkFollowStatus,
    getFollowers,
    getFollowing,
    getFollowCounts,
    loading
  };

  return (
    <FollowContext.Provider value={value}>
      {children}
    </FollowContext.Provider>
  );
};

export const useFollow = () => {
  const context = useContext(FollowContext);
  if (context === undefined) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
};
