import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const SubscriptionBar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Only show for students
  if (user?.accountType !== 'student') {
    return null;
  }

  const currentPlan = user.subscription?.plan || 'basic';
  
  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'pro+':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'pro':
        return <Zap className="h-4 w-4 text-blue-500" />;
      default:
        return <Crown className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro+':
        return 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20';
      case 'pro':
        return 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20';
      default:
        return 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 border-gray-500/20';
    }
  };

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  return (
    <Card className={`w-full ${getPlanColor(currentPlan)}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getPlanIcon(currentPlan)}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-text-primary capitalize">
                  {currentPlan === 'pro+' ? 'Pro+ Plan' : currentPlan === 'pro' ? 'Pro Plan' : 'Basic Plan'}
                </h3>
                <Badge 
                  variant={currentPlan === 'basic' ? 'secondary' : 'default'}
                  className={currentPlan === 'basic' ? 'bg-gray-100 text-gray-700' : 'bg-accent text-accent-foreground'}
                >
                  Current
                </Badge>
              </div>
              <p className="text-sm text-text-secondary">
                {currentPlan === 'basic' && 'Upgrade to unlock premium features and more credits'}
                {currentPlan === 'pro' && 'Enjoying Pro benefits? Consider Pro+ for the ultimate experience'}
                {currentPlan === 'pro+' && 'You have access to all premium features!'}
              </p>
            </div>
          </div>
          
          {currentPlan !== 'pro+' && (
            <Button 
              onClick={handleUpgrade}
              className={`
                ${currentPlan === 'basic' 
                  ? 'bg-gradient-to-r from-accent to-purple-500 hover:from-accent/90 hover:to-purple-500/90' 
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-500/90 hover:to-orange-500/90'
                } 
                text-white border-none
              `}
            >
              {currentPlan === 'basic' ? 'Upgrade Now' : 'Upgrade to Pro+'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};