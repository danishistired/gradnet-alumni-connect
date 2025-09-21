import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Check, Crown, Zap, Star, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  title: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  buttonText: string;
  popular?: boolean;
  icon: React.ReactNode;
  gradient: string;
  credits: number;
}

const Subscription = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      name: 'basic',
      title: 'Basic Plan',
      price: 'Free',
      period: 'forever',
      description: 'Perfect for getting started with GradNet',
      credits: 10,
      icon: <Crown className="h-6 w-6" />,
      gradient: 'from-gray-500 to-slate-600',
      buttonText: 'Current Plan',
      features: [
        { text: '10 monthly credits', included: true },
        { text: '1 free interview session', included: true },
        { text: 'Basic community access', included: true },
        { text: 'Standard support', included: true },
        { text: 'Profile creation', included: true },
        { text: 'Advanced analytics', included: false },
        { text: 'Priority support', included: false },
        { text: 'Unlimited interviews', included: false },
      ],
    },
    {
      name: 'pro',
      title: 'Pro Plan',
      price: '$9.99',
      period: 'per month',
      description: 'For serious students ready to accelerate their career',
      credits: 50,
      icon: <Zap className="h-6 w-6" />,
      gradient: 'from-blue-500 to-purple-600',
      buttonText: 'Upgrade to Pro',
      popular: true,
      features: [
        { text: '50 monthly credits', included: true },
        { text: '5 free interview sessions', included: true },
        { text: 'Premium community access', included: true },
        { text: 'Priority support', included: true },
        { text: 'Advanced profile features', included: true },
        { text: 'Basic analytics', included: true },
        { text: 'Resume review service', included: true },
        { text: 'Unlimited interviews', included: false },
      ],
    },
    {
      name: 'pro+',
      title: 'Pro+ Plan',
      price: '$19.99',
      period: 'per month',
      description: 'Ultimate package for ambitious professionals',
      credits: 100,
      icon: <Star className="h-6 w-6" />,
      gradient: 'from-yellow-500 to-orange-500',
      buttonText: 'Upgrade to Pro+',
      features: [
        { text: '100 monthly credits', included: true },
        { text: 'Unlimited interview sessions', included: true },
        { text: 'Exclusive community access', included: true },
        { text: 'VIP support', included: true },
        { text: 'Premium profile features', included: true },
        { text: 'Advanced analytics & insights', included: true },
        { text: 'Priority resume review', included: true },
        { text: 'One-on-one mentorship', included: true },
      ],
    },
  ];

  const handleSelectPlan = (plan: Plan) => {
    if (plan.name === 'basic') return;
    
    setSelectedPlan(plan.name);
    // Navigate to payment page with selected plan
    navigate('/payment', { state: { plan: plan.name, price: plan.price } });
  };

  const currentPlan = user?.subscription?.plan || 'basic';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/profile')}
              className="mb-6 text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Unlock your potential with our flexible subscription plans. 
              Get more credits, exclusive features, and priority support.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.name}
                className={`
                  relative overflow-hidden transition-all duration-300 hover:shadow-lg
                  ${plan.popular ? 'ring-2 ring-accent shadow-lg scale-105' : ''}
                  ${currentPlan === plan.name ? 'ring-2 ring-green-500' : ''}
                `}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Badge className="bg-accent text-accent-foreground px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {currentPlan === plan.name && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Badge className="bg-green-500 text-white px-3 py-1">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center text-white`}>
                    {plan.icon}
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-text-primary">
                    {plan.title}
                  </CardTitle>
                  
                  <div className="text-3xl font-bold text-text-primary">
                    {plan.price}
                    <span className="text-sm font-normal text-text-secondary">
                      /{plan.period}
                    </span>
                  </div>
                  
                  <p className="text-text-secondary">{plan.description}</p>
                  
                  <div className="flex justify-center items-center gap-2 mt-2">
                    <Badge variant="outline" className="bg-accent/10 text-accent">
                      {plan.credits} Credits/month
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features List */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className={`
                          w-5 h-5 rounded-full flex items-center justify-center
                          ${feature.included 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-400'
                          }
                        `}>
                          <Check className="h-3 w-3" />
                        </div>
                        <span className={`
                          text-sm 
                          ${feature.included 
                            ? 'text-text-primary' 
                            : 'text-text-secondary'
                          }
                        `}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={currentPlan === plan.name || selectedPlan === plan.name}
                    className={`
                      w-full mt-6
                      ${plan.name === 'basic' 
                        ? 'bg-gray-500 hover:bg-gray-600' 
                        : `bg-gradient-to-r ${plan.gradient} hover:opacity-90`
                      }
                      ${currentPlan === plan.name ? 'bg-green-500 hover:bg-green-600' : ''}
                      text-white border-none
                    `}
                  >
                    {currentPlan === plan.name ? 'Current Plan' : plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-text-secondary mb-4">
              All plans include access to our community, basic features, and standard support.
            </p>
            <p className="text-sm text-text-secondary">
              You can upgrade, downgrade, or cancel your subscription at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;