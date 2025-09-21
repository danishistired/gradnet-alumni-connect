import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, CreditCard, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  // Get plan details from navigation state
  const selectedPlan = location.state?.plan || 'pro';
  const selectedPrice = location.state?.price || '$9.99';
  
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    zipCode: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setPaymentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update subscription via API
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      if (response.ok) {
        setPaymentComplete(true);
        toast({
          title: "Payment Successful!",
          description: `You've successfully upgraded to the ${selectedPlan.toUpperCase()} plan.`,
          duration: 5000,
        });
        
        // Redirect to profile after 3 seconds
        setTimeout(() => {
          navigate('/profile', { replace: true });
        }, 3000);
      } else {
        throw new Error('Failed to upgrade subscription');
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setProcessing(false);
    }
  };

  const isFormValid = () => {
    return paymentForm.cardNumber.length >= 19 && // 16 digits + 3 spaces
           paymentForm.expiryDate.length === 5 &&
           paymentForm.cvv.length >= 3 &&
           paymentForm.cardholderName.trim() !== '';
  };

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">Payment Successful!</h2>
            <p className="text-text-secondary mb-4">
              Your subscription has been upgraded successfully.
            </p>
            <Badge className="bg-green-100 text-green-800">
              {selectedPlan.toUpperCase()} Plan Active
            </Badge>
            <p className="text-sm text-text-secondary mt-4">
              Redirecting to your profile...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/subscription')}
              className="mb-4 text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
            
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Complete Your Purchase
            </h1>
            <p className="text-text-secondary">
              Secure payment powered by industry-standard encryption
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Card Number */}
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentForm.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Expiry Date */}
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={paymentForm.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                      maxLength={5}
                    />
                  </div>

                  {/* CVV */}
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={paymentForm.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                      maxLength={4}
                    />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    value={paymentForm.cardholderName}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  />
                </div>

                {/* Billing Address */}
                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Billing Address</Label>
                  <Input
                    id="billingAddress"
                    placeholder="123 Main Street"
                    value={paymentForm.billingAddress}
                    onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={paymentForm.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>

                  {/* ZIP Code */}
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="10001"
                      value={paymentForm.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    />
                  </div>
                </div>

                {/* Security Note */}
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    Your payment information is secure and encrypted
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Plan Details */}
                <div className="flex justify-between items-center p-4 bg-accent/10 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-text-primary capitalize">
                      {selectedPlan === 'pro+' ? 'Pro+ Plan' : 'Pro Plan'}
                    </h3>
                    <p className="text-sm text-text-secondary">Monthly subscription</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-text-primary">{selectedPrice}</p>
                    <p className="text-sm text-text-secondary">per month</p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-2">
                  <h4 className="font-medium text-text-primary">What you get:</h4>
                  <ul className="text-sm text-text-secondary space-y-1">
                    <li>• {selectedPlan === 'pro+' ? '100' : '50'} monthly credits</li>
                    <li>• {selectedPlan === 'pro+' ? 'Unlimited' : '5'} interview sessions</li>
                    <li>• Premium community access</li>
                    <li>• Priority support</li>
                    {selectedPlan === 'pro+' && <li>• One-on-one mentorship</li>}
                  </ul>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total (Monthly)</span>
                    <span className="text-accent">{selectedPrice}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    You can cancel anytime. No long-term commitments.
                  </p>
                </div>

                {/* Payment Button */}
                <Button
                  onClick={handlePayment}
                  disabled={!isFormValid() || processing}
                  className="w-full bg-gradient-to-r from-accent to-purple-500 hover:from-accent/90 hover:to-purple-500/90 text-white border-none"
                  size="lg"
                >
                  {processing ? 'Processing...' : `Pay ${selectedPrice}`}
                </Button>

                <p className="text-xs text-text-secondary text-center">
                  By completing this purchase you agree to our Terms of Service and Privacy Policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;