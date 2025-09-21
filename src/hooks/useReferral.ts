import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ReferralData {
  referralCode: string;
  referralCount: number;
  referralLink: string;
}

export const useReferral = () => {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!user || !token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/referrals/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setReferralData({
            referralCode: data.referralCode,
            referralCount: data.referralCount,
            referralLink: data.referralLink,
          });
        }
      } catch (error) {
        console.error('Error fetching referral data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [user, token]);

  return { referralData, loading };
};