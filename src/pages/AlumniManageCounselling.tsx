import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MessageCircle, 
  Clock, 
  CalendarIcon, 
  Settings,
  Check,
  X,
  User,
  Calendar as CalendarDays,
  Heart,
  Star
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CounsellingRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  date: string;
  time: string;
  duration: number;
  topic: string;
  category: 'career' | 'academic' | 'personal' | 'mental-health';
  urgency: 'low' | 'medium' | 'high';
  notes?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  requestedAt: string;
}

interface CounsellingSettings {
  isAcceptingCounselling: boolean;
  maxCounsellingPerWeek: number;
  counsellingDuration: number;
  specializations: string[];
  autoAccept: boolean;
  urgencyFilter: 'all' | 'medium-high' | 'high-only';
}

export const AlumniManageCounselling = () => {
  const { user } = useAuth();
  const [counsellingRequests, setCounsellingRequests] = useState<CounsellingRequest[]>([]);
  const [settings, setSettings] = useState<CounsellingSettings>({
    isAcceptingCounselling: true,
    maxCounsellingPerWeek: 3,
    counsellingDuration: 45,
    specializations: [],
    autoAccept: false,
    urgencyFilter: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CounsellingRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  const categories = [
    { value: 'career', label: 'Career Guidance', icon: '💼' },
    { value: 'academic', label: 'Academic Support', icon: '📚' },
    { value: 'personal', label: 'Personal Development', icon: '🌱' },
    { value: 'mental-health', label: 'Mental Health', icon: '🧠' }
  ];

  const specializations = [
    'Career Transitions', 'Resume Building', 'Interview Preparation',
    'Networking', 'Work-Life Balance', 'Leadership Development',
    'Entrepreneurship', 'Technical Skills', 'Soft Skills',
    'Academic Planning', 'Study Strategies', 'Research Guidance'
  ];

  useEffect(() => {
    fetchCounsellingRequests();
    fetchSettings();
  }, []);

  const fetchCounsellingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/alumni/counselling-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCounsellingRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching counselling requests:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/alumni/settings/counselling', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResponse = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/alumni/counselling-requests/${requestId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: responseMessage })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: `Request ${action}ed`,
          description: `Counselling request has been ${action}ed successfully.`
        });
        fetchCounsellingRequests();
        setSelectedRequest(null);
        setResponseMessage('');
      } else {
        toast({
          title: "Error",
          description: data.message || `Failed to ${action} request.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} request.`,
        variant: "destructive"
      });
    }
  };

  const updateSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/alumni/settings/counselling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Settings Updated",
          description: "Your counselling settings have been saved."
        });
        setIsSettingsOpen(false);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    return categories.find(cat => cat.value === category)?.icon || '💬';
  };

  const getRequestsByStatus = (status: string) => {
    return counsellingRequests.filter(req => req.status === status);
  };

  if (loading) {
    return (
      <div className="p-6">
        <Navbar />
        <div className="text-center">Loading counselling management...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Navbar />
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Counselling Sessions</h1>
            <p className="text-muted-foreground">
              Provide guidance and support to students through one-on-one counselling sessions.
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Counselling Settings</DialogTitle>
                  <DialogDescription>
                    Configure your counselling preferences and specializations
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Accept Counselling Requests</label>
                      <p className="text-xs text-muted-foreground">Allow students to book counselling sessions</p>
                    </div>
                    <Switch 
                      checked={settings.isAcceptingCounselling}
                      onCheckedChange={(checked) => setSettings(prev => ({...prev, isAcceptingCounselling: checked}))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Max Sessions per Week</label>
                    <Input
                      type="number"
                      value={settings.maxCounsellingPerWeek}
                      onChange={(e) => setSettings(prev => ({...prev, maxCounsellingPerWeek: parseInt(e.target.value)}))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Default Session Duration</label>
                    <Select 
                      value={settings.counsellingDuration.toString()}
                      onValueChange={(value) => setSettings(prev => ({...prev, counsellingDuration: parseInt(value)}))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Urgency Filter</label>
                    <Select 
                      value={settings.urgencyFilter}
                      onValueChange={(value) => setSettings(prev => ({...prev, urgencyFilter: value as 'all' | 'medium-high' | 'high-only'}))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All requests</SelectItem>
                        <SelectItem value="medium-high">Medium & High only</SelectItem>
                        <SelectItem value="high-only">High urgency only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Specializations</label>
                    <p className="text-xs text-muted-foreground mb-2">Select your areas of expertise</p>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {specializations.map(spec => (
                        <label key={spec} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={settings.specializations.includes(spec)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSettings(prev => ({
                                  ...prev,
                                  specializations: [...prev.specializations, spec]
                                }));
                              } else {
                                setSettings(prev => ({
                                  ...prev,
                                  specializations: prev.specializations.filter(s => s !== spec)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <span>{spec}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <Button onClick={updateSettings} className="w-full">
                  Save Settings
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {getRequestsByStatus('pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending Requests</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {getRequestsByStatus('accepted').length}
              </div>
              <div className="text-sm text-muted-foreground">Upcoming Sessions</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getRequestsByStatus('completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {settings.isAcceptingCounselling ? 'Available' : 'Unavailable'}
              </div>
              <div className="text-sm text-muted-foreground">Current Status</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      {getRequestsByStatus('pending').length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Pending Requests</h2>
          <div className="space-y-4">
            {getRequestsByStatus('pending').map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {request.studentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{request.studentName}</h4>
                          <Badge className={getUrgencyColor(request.urgency)}>
                            {request.urgency} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{request.studentEmail}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <span>{getCategoryIcon(request.category)}</span>
                            <span>{categories.find(cat => cat.value === request.category)?.label}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {request.date} at {request.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {request.duration} minutes
                          </div>
                        </div>
                        <p className="text-sm"><strong>Topic:</strong> {request.topic}</p>
                        {request.notes && (
                          <div className="mt-3 p-3 bg-muted rounded">
                            <p className="text-sm"><strong>Additional Notes:</strong> {request.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Accept Counselling Request</DialogTitle>
                            <DialogDescription>
                              Accepting counselling session with {request.studentName}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-3 bg-muted rounded">
                              <p className="text-sm"><strong>Topic:</strong> {request.topic}</p>
                              <p className="text-sm"><strong>Category:</strong> {categories.find(cat => cat.value === request.category)?.label}</p>
                              <p className="text-sm"><strong>Date:</strong> {request.date} at {request.time}</p>
                            </div>
                            <Textarea
                              placeholder="Welcome message or preparation instructions..."
                              value={responseMessage}
                              onChange={(e) => setResponseMessage(e.target.value)}
                            />
                            <Button 
                              onClick={() => handleRequestResponse(request.id, 'accept')}
                              className="w-full"
                            >
                              Confirm Accept
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Decline Counselling Request</DialogTitle>
                            <DialogDescription>
                              Declining counselling session with {request.studentName}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Reason for declining and alternative suggestions..."
                              value={responseMessage}
                              onChange={(e) => setResponseMessage(e.target.value)}
                            />
                            <Button 
                              onClick={() => handleRequestResponse(request.id, 'decline')}
                              variant="destructive"
                              className="w-full"
                            >
                              Confirm Decline
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      {getRequestsByStatus('accepted').length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Upcoming Sessions</h2>
          <div className="space-y-4">
            {getRequestsByStatus('accepted').map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {request.studentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{request.studentName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {getCategoryIcon(request.category)} {request.topic}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="w-4 h-4" />
                        {request.date} at {request.time}
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {counsellingRequests.length === 0 && (
        <div className="text-center py-8">
          <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No counselling requests yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Students will see your profile when you're accepting counselling sessions.
          </p>
        </div>
      )}
    </div>
  );
};