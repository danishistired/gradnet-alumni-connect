import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Link, Users, Gift } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ReferralStats {
  referralCode: string;
  referralCount: number;
  referralLink: string;
}

export const ReferralBar = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferralStats = async () => {
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
          setStats({
            referralCode: data.referralCode,
            referralCount: data.referralCount,
            referralLink: data.referralLink,
          });
        }
      } catch (error) {
        console.error('Error fetching referral stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralStats();
  }, [user, token]);

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `Referral ${type} copied to clipboard`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  if (loading || !stats) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded h-4 bg-gray-200 flex-1"></div>
            <div className="rounded h-4 bg-gray-200 w-20"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rewardText = user?.accountType === 'alumni' 
    ? "Earn 50 credits for each alumni referral"
    : "Earn 10 credits + 1 free interview for first 3 referrals, then 5 credits per referral";

  const nextRewardText = user?.accountType === 'student' && stats.referralCount < 3
    ? `${3 - stats.referralCount} more referrals for bonus rewards`
    : null;

  return (
    <Card className="w-full border-accent/20 bg-gradient-to-r from-accent/5 to-purple-500/5">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-text-primary">Referral Program</h3>
              <Badge variant="secondary" className="bg-accent/10 text-accent">
                <Users className="h-3 w-3 mr-1" />
                {stats.referralCount} referred
              </Badge>
            </div>
            <div className="text-sm text-text-secondary">
              {rewardText}
            </div>
          </div>

          {/* Progress indicator for students */}
          {user?.accountType === 'student' && nextRewardText && (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-accent to-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${(stats.referralCount / 3) * 100}%` }}
                />
              </div>
              <span className="text-xs text-text-secondary">{nextRewardText}</span>
            </div>
          )}

          {/* Referral Code and Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Referral Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Referral Code</label>
              <div className="flex gap-2">
                <Input
                  value={stats.referralCode}
                  readOnly
                  className="font-mono bg-surface-muted"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(stats.referralCode, 'code')}
                  className="px-3"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Referral Link */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Invitation Link</label>
              <div className="flex gap-2">
                <Input
                  value={stats.referralLink}
                  readOnly
                  className="font-mono bg-surface-muted"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(stats.referralLink, 'link')}
                  className="px-3"
                >
                  <Link className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center p-3 bg-accent/5 rounded-lg border border-accent/10">
            <p className="text-sm text-text-secondary">
              Share your referral code or link with friends to earn rewards when they join GradNet!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};