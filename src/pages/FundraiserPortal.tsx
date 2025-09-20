import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, TrendingUp, Users, Target, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { type Fundraiser } from '@/data/mockFundraisers';
import { FundraiserForm } from '@/components/FundraiserForm';
import { InvestmentDashboard } from '@/components/InvestmentDashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const FundraiserPortal = () => {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedFundraiser, setSelectedFundraiser] = useState<Fundraiser | null>(null);
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const isAlumni = user?.accountType === 'alumni';
  const isStudent = user?.accountType === 'student';

  // Fetch fundraisers from API
  const fetchFundraisers = async (status?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      let url = 'http://localhost:5000/api/fundraisers';
      if (status && status !== 'all') {
        url += `?status=${status}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fundraisers');
      }

      const data = await response.json();
      if (data.success) {
        setFundraisers(data.fundraisers);
      } else {
        throw new Error(data.message || 'Failed to fetch fundraisers');
      }
    } catch (err) {
      console.error('Error fetching fundraisers:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setFundraisers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFundraisers();
  }, []);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'trending') {
      // For trending, we'll just show all for now
      fetchFundraisers();
    } else {
      fetchFundraisers(value);
    }
  };

  const activeFundraisers = fundraisers.filter(f => f.status === 'active');
  const totalRaised = fundraisers.reduce((sum, f) => sum + f.raisedAmount, 0);
  const totalInvestors = fundraisers.reduce((sum, f) => sum + f.investorsCount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (showCreateForm && isStudent) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                ← Back to Portal
              </Button>
              <h1 className="text-3xl font-bold">Create New Fundraiser</h1>
            </div>
            <FundraiserForm onClose={() => setShowCreateForm(false)} />
          </div>
        </div>
      </div>
    );
  }

  if (selectedFundraiser && isAlumni) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="pt-20 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="outline" 
                onClick={() => setSelectedFundraiser(null)}
              >
                ← Back to Portal
              </Button>
              <h1 className="text-3xl font-bold">Investment Dashboard</h1>
            </div>
            <InvestmentDashboard fundraiser={selectedFundraiser} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Fundraiser Portal
              </h1>
              <p className="text-muted-foreground mt-2">
                {isAlumni ? 'Discover and invest in promising startups from students' : 'Pitch your startup idea and raise funds from alumni'}
              </p>
            </div>
            {isStudent && (
              <Button onClick={() => setShowCreateForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Fundraiser
            </Button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Fundraisers</p>
                  <p className="text-2xl font-bold">{activeFundraisers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Raised</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalRaised)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Investors</p>
                  <p className="text-2xl font-bold">{totalInvestors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {fundraisers.length > 0 
                      ? Math.round((fundraisers.filter(f => f.status === 'completed').length / fundraisers.length) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fundraisers Grid */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Fundraisers</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">Loading fundraisers...</p>
              </div>
            ) : fundraisers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No fundraisers found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fundraisers.map((fundraiser) => (
                  <Card key={fundraiser.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge className={getStatusColor(fundraiser.status)}>
                          {fundraiser.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {fundraiser.category}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{fundraiser.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {fundraiser.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{Math.round((fundraiser.raisedAmount / fundraiser.targetAmount) * 100)}%</span>
                          </div>
                          <Progress value={(fundraiser.raisedAmount / fundraiser.targetAmount) * 100} />
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Raised</span>
                          <span className="font-semibold">{formatCurrency(fundraiser.raisedAmount)}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Target</span>
                          <span className="font-semibold">{formatCurrency(fundraiser.targetAmount)}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {fundraiser.investorsCount} investors
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {fundraiser.timeline}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {fundraiser.tags?.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        {isAlumni && (
                          <Button 
                            className="w-full mt-4" 
                            onClick={() => setSelectedFundraiser(fundraiser)}
                          >
                            View Details & Invest
                          </Button>
                        )}
                        
                        {isStudent && (
                          <div className="text-sm text-muted-foreground">
                            By {fundraiser.studentName}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
};