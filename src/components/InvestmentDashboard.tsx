import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  Target, 
  TrendingUp, 
  PieChart, 
  BarChart3,
  MapPin,
  Mail,
  Phone,
  Globe,
  FileText,
  Star
} from 'lucide-react';
import { type Fundraiser } from '@/data/mockFundraisers';

interface InvestmentDashboardProps {
  fundraiser: Fundraiser;
}

export const InvestmentDashboard = ({ fundraiser }: InvestmentDashboardProps) => {
  const { toast } = useToast();
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investmentType, setInvestmentType] = useState('');
  const [investmentNote, setInvestmentNote] = useState('');
  const [showInvestDialog, setShowInvestDialog] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const progressPercentage = (fundraiser.raisedAmount / fundraiser.targetAmount) * 100;
  const remainingAmount = fundraiser.targetAmount - fundraiser.raisedAmount;

  const handleInvestment = () => {
    if (!investmentAmount || !investmentType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Investment Submitted!",
      description: `Your ${investmentType} investment of ${formatCurrency(Number(investmentAmount))} has been submitted for review.`,
    });

    setShowInvestDialog(false);
    setInvestmentAmount('');
    setInvestmentType('');
    setInvestmentNote('');
  };

  const mockInvestmentHistory = [
    { date: '2024-01-20', investor: 'Alumni Tech Fund', amount: 50000, type: 'equity' },
    { date: '2024-02-05', investor: 'Green Energy Ventures', amount: 75000, type: 'equity' },
    { date: '2024-02-15', investor: 'Individual Investor', amount: 25000, type: 'loan' },
    { date: '2024-03-01', investor: 'Innovation Grant', amount: 25000, type: 'grant' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-green-500">{fundraiser.status}</Badge>
                <Badge variant="outline">{fundraiser.category}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-4">{fundraiser.title}</h1>
              <p className="text-muted-foreground mb-6">{fundraiser.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{fundraiser.studentEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>Team of {fundraiser.teamSize}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{fundraiser.timeline}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span>{fundraiser.investorsCount} investors</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {fundraiser.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Funding Progress */}
              <div className="bg-background rounded-lg p-6 border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Funding Progress</h3>
                  <span className="text-2xl font-bold text-primary">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                
                <Progress value={progressPercentage} className="mb-4" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Raised</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(fundraiser.raisedAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Target</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(fundraiser.targetAmount)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(remainingAmount)}
                  </p>
                </div>
              </div>

              {/* Investment Button */}
              <Dialog open={showInvestDialog} onOpenChange={setShowInvestDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full h-12 text-lg gap-2">
                    <DollarSign className="w-5 h-5" />
                    Invest in this Startup
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Make an Investment</DialogTitle>
                    <DialogDescription>
                      Invest in {fundraiser.title}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="amount">Investment Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        placeholder="Enter amount"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="type">Investment Type</Label>
                      <Select value={investmentType} onValueChange={setInvestmentType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equity">Equity Investment</SelectItem>
                          <SelectItem value="loan">Loan</SelectItem>
                          <SelectItem value="grant">Grant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="note">Note (Optional)</Label>
                      <Textarea
                        id="note"
                        value={investmentNote}
                        onChange={(e) => setInvestmentNote(e.target.value)}
                        placeholder="Any additional notes or terms..."
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowInvestDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInvestment} className="flex-1">
                      Submit Investment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Business Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Business Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Funding Goal</h3>
                <p className="text-muted-foreground">{fundraiser.fundingGoal}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Business Model</h3>
                <p className="text-muted-foreground">{fundraiser.businessModel}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Market Opportunity</h3>
                <p className="text-muted-foreground">{fundraiser.marketSize}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Competition Analysis</h3>
                <p className="text-muted-foreground">{fundraiser.competition}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Risk Assessment</h3>
                <p className="text-muted-foreground">{fundraiser.riskAssessment}</p>
              </div>
            </CardContent>
          </Card>

          {/* Investment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Investment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInvestmentHistory.map((investment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{investment.investor}</p>
                      <p className="text-sm text-muted-foreground">{investment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(investment.amount)}</p>
                      <Badge variant="outline" className="text-xs">
                        {investment.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Sidebar */}
        <div className="space-y-6">
          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <span className="font-semibold">{Math.round(progressPercentage)}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Investment</span>
                <span className="font-semibold">
                  {formatCurrency(fundraiser.raisedAmount / fundraiser.investorsCount)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Days Active</span>
                <span className="font-semibold">
                  {Math.floor((Date.now() - new Date(fundraiser.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk Level</span>
                <Badge variant="outline">
                  {fundraiser.riskAssessment.includes('High') ? 'High' : 
                   fundraiser.riskAssessment.includes('Medium') ? 'Medium' : 'Low'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Team Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{fundraiser.studentName}</p>
                <p className="text-sm text-muted-foreground">Founder & CEO</p>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Team Size</span>
                <span className="font-semibold">{fundraiser.teamSize} members</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Timeline</span>
                <span className="font-semibold">{fundraiser.timeline}</span>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="w-4 h-4" />
                Pitch Deck.pdf
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="w-4 h-4" />
                Business Plan.pdf
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="w-4 h-4" />
                Financial Projections.xlsx
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};