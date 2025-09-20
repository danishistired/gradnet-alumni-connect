import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, TrendingUp, Users, Target, Calendar, DollarSign } from 'lucide-react';
import { mockFundraisers, mockInvestments, type Fundraiser } from '@/data/mockFundraisers';
import { FundraiserForm } from '@/components/FundraiserForm';
import { InvestmentDashboard } from '@/components/InvestmentDashboard';

export const FundraiserPortal = () => {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedFundraiser, setSelectedFundraiser] = useState<Fundraiser | null>(null);

  const isAlumni = user?.accountType === 'alumni';
  const isStudent = user?.accountType === 'student';

  const activeFundraisers = mockFundraisers.filter(f => f.status === 'active');
  const totalRaised = mockFundraisers.reduce((sum, f) => sum + f.raisedAmount, 0);
  const totalInvestors = mockInvestments.length;

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
      <div className="container mx-auto px-4 py-8">
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
    );
  }

  if (selectedFundraiser && isAlumni) {
    return (
      <div className="container mx-auto px-4 py-8">
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
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
                  <p className="text-2xl font-bold">78%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fundraisers Grid */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Fundraisers</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockFundraisers.map((fundraiser) => (
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
                        {fundraiser.tags.slice(0, 3).map((tag) => (
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
          </TabsContent>
          
          <TabsContent value="active">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeFundraisers.map((fundraiser) => (
                <Card key={fundraiser.id} className="hover:shadow-lg transition-shadow">
                  {/* Same card content as above */}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge className="bg-green-500">Active</Badge>
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
                      {isAlumni && (
                        <Button 
                          className="w-full mt-4" 
                          onClick={() => setSelectedFundraiser(fundraiser)}
                        >
                          View Details & Invest
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="text-center py-8 text-muted-foreground">
              <p>Completed fundraisers will appear here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="trending">
            <div className="text-center py-8 text-muted-foreground">
              <p>Trending fundraisers based on recent activity</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};