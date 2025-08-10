import React, { createContext, useContext, useState, useEffect } from 'react';

interface Community {
  id: string;
  name: string;
  displayName: string;
  description: string;
  memberCount: number;
  postCount: number;
  icon: string;
  createdAt: string;
}

interface CommunityContextType {
  communities: Community[];
  joinedCommunities: string[];
  loading: boolean;
  joinCommunity: (communityId: string) => Promise<boolean>;
  leaveCommunity: (communityId: string) => Promise<boolean>;
  createCommunity: (data: Partial<Community>) => Promise<boolean>;
  fetchCommunities: () => Promise<void>;
  refreshCommunities: () => void;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/communities');
      const data = await response.json();
      
      if (data.success) {
        setCommunities(data.communities);
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinedCommunities = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/communities/joined', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setJoinedCommunities(data.communities);
      }
    } catch (error) {
      console.error('Failed to fetch joined communities:', error);
    }
  };

  const joinCommunity = async (communityId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setJoinedCommunities(prev => [...prev, communityId]);
        // Update member count
        setCommunities(prev => prev.map(c => 
          c.id === communityId ? { ...c, memberCount: c.memberCount + 1 } : c
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to join community:', error);
      return false;
    }
  };

  const leaveCommunity = async (communityId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/communities/${communityId}/leave`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setJoinedCommunities(prev => prev.filter(id => id !== communityId));
        // Update member count
        setCommunities(prev => prev.map(c => 
          c.id === communityId ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to leave community:', error);
      return false;
    }
  };

  const createCommunity = async (data: Partial<Community>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      if (result.success) {
        await fetchCommunities();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to create community:', error);
      return false;
    }
  };

  const refreshCommunities = () => {
    fetchCommunities();
    fetchJoinedCommunities();
  };

  useEffect(() => {
    fetchCommunities();
    fetchJoinedCommunities();
  }, []);

  return (
    <CommunityContext.Provider value={{
      communities,
      joinedCommunities,
      loading,
      joinCommunity,
      leaveCommunity,
      createCommunity,
      fetchCommunities,
      refreshCommunities
    }}>
      {children}
    </CommunityContext.Provider>
  );
};
