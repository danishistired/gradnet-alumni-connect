import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CreditsData {
  creditPoints: number;
  freeInterviews: number;
}

export const useCredits = () => {
  const [credits, setCredits] = useState<CreditsData>({ creditPoints: 0, freeInterviews: 0 });
  const [loading, setLoading] = useState(true);
  const { user, token, updateUserCredits } = useAuth();

  // Initialize credits from user object if available
  useEffect(() => {
    if (user && user.creditPoints !== undefined) {
      setCredits({
        creditPoints: user.creditPoints || 0,
        freeInterviews: user.freeInterviews || 0,
      });
    }
  }, [user]);

  const fetchCredits = useCallback(async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/credits', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const creditsData = {
          creditPoints: data.creditPoints || 0,
          freeInterviews: data.freeInterviews || 0,
        };
        setCredits(creditsData);
        // Sync with AuthContext
        updateUserCredits(creditsData.creditPoints, creditsData.freeInterviews);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  }, [user, token, updateUserCredits]);

  const deductCredits = async (amount: number, type: 'interview' | 'general' = 'general') => {
    if (!token) return false;

    try {
      const response = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, type }),
      });

      if (response.ok) {
        const data = await response.json();
        const creditsData = {
          creditPoints: data.creditPoints,
          freeInterviews: data.freeInterviews,
        };
        setCredits(creditsData);
        // Sync with AuthContext
        updateUserCredits(creditsData.creditPoints, creditsData.freeInterviews);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deducting credits:', error);
      return false;
    }
  };

  const addCredits = async (amount: number, freeInterviews: number = 0) => {
    if (!token) return false;

    try {
      const response = await fetch('/api/credits/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, freeInterviews }),
      });

      if (response.ok) {
        const data = await response.json();
        const creditsData = {
          creditPoints: data.creditPoints,
          freeInterviews: data.freeInterviews,
        };
        setCredits(creditsData);
        // Sync with AuthContext
        updateUserCredits(creditsData.creditPoints, creditsData.freeInterviews);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding credits:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    loading,
    fetchCredits,
    deductCredits,
    addCredits,
  };
};