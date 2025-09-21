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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  Video, 
  Clock, 
  CalendarIcon, 
  Settings,
  Check,
  X,
  User,
  Calendar as CalendarDays,
  Plus,
  Edit
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InterviewRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  date: string;
  time: string;
  duration: number;
  topic: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  requestedAt: string;
}

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface AlumniSettings {
  isAcceptingInterviews: boolean;
  maxInterviewsPerWeek: number;
  interviewDuration: number;
  autoAccept: boolean;
  requireApproval: boolean;
}

export const AlumniManageInterviews = () => {
  const { user } = useAuth();
  const [interviewRequests, setInterviewRequests] = useState<InterviewRequest[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [settings, setSettings] = useState<AlumniSettings>({
    isAcceptingInterviews: true,
    maxInterviewsPerWeek: 5,
    interviewDuration: 60,
    autoAccept: false,
    requireApproval: true
  });
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InterviewRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  useEffect(() => {
    fetchInterviewRequests();
    fetchAvailability();
    fetchSettings();
  }, []);

  const fetchInterviewRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/alumni/interview-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setInterviewRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching interview requests:', error);
    }
  };

  const fetchAvailability = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/alumni/availability/interviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAvailability(data.availability);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/alumni/settings/interviews', {
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
      const response = await fetch(`/api/alumni/interview-requests/${requestId}/${action}`, {
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
          description: `Interview request has been ${action}ed successfully.`
        });
        fetchInterviewRequests();
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
      const response = await fetch('/api/alumni/settings/interviews', {
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
          description: "Your interview settings have been saved."
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

  const updateAvailability = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/alumni/availability/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ availability })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Availability Updated",
          description: "Your availability has been saved."
        });
        setIsAvailabilityOpen(false);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability.",
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

  const getRequestsByStatus = (status: string) => {
    return interviewRequests.filter(req => req.status === status);
  };

  if (loading) {
    return (
      <div className="p-6">
        <Navbar />
        <div className="text-center">Loading interview management...</div>
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
            <h1 className="text-3xl font-bold mb-2">Manage Interview Sessions</h1>
            <p className="text-muted-foreground">
              Manage your interview availability, view requests, and schedule sessions with students.
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAvailabilityOpen} onOpenChange={setIsAvailabilityOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Set Availability
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Set Interview Availability</DialogTitle>
                  <DialogDescription>
                    Configure when you're available for interview sessions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {daysOfWeek.map((day, index) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium">{day}</div>
                      <div className="flex items-center gap-2 flex-1">
                        <Select defaultValue="09:00">
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-sm">to</span>
                        <Select defaultValue="17:00">
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={updateAvailability} className="w-full">
                  Save Availability
                </Button>
              </DialogContent>
            </Dialog>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Interview Settings</DialogTitle>
                  <DialogDescription>
                    Configure your interview preferences
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Accept Interview Requests</label>
                      <p className="text-xs text-muted-foreground">Allow students to book interviews</p>
                    </div>
                    <Switch 
                      checked={settings.isAcceptingInterviews}
                      onCheckedChange={(checked) => setSettings(prev => ({...prev, isAcceptingInterviews: checked}))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Interviews per Week</label>
                    <Input
                      type="number"
                      value={settings.maxInterviewsPerWeek}
                      onChange={(e) => setSettings(prev => ({...prev, maxInterviewsPerWeek: parseInt(e.target.value)}))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Default Interview Duration (minutes)</label>
                    <Select 
                      value={settings.interviewDuration.toString()}
                      onValueChange={(value) => setSettings(prev => ({...prev, interviewDuration: parseInt(value)}))}
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
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Require Manual Approval</label>
                      <p className="text-xs text-muted-foreground">Review each request before acceptance</p>
                    </div>
                    <Switch 
                      checked={settings.requireApproval}
                      onCheckedChange={(checked) => setSettings(prev => ({...prev, requireApproval: checked}))}
                    />
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
              <div className="text-sm text-muted-foreground">Accepted</div>
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
                {settings.isAcceptingInterviews ? 'Available' : 'Unavailable'}
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {request.studentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{request.studentName}</h4>
                        <p className="text-sm text-muted-foreground">{request.studentEmail}</p>
                        <p className="text-sm text-muted-foreground">Topic: {request.topic}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="w-4 h-4" />
                        {request.date} at {request.time}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {request.duration} minutes
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
                            <DialogTitle>Accept Interview Request</DialogTitle>
                            <DialogDescription>
                              Accepting interview with {request.studentName} on {request.date} at {request.time}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Optional message to the student..."
                              value={responseMessage}
                              onChange={(e) => setResponseMessage(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleRequestResponse(request.id, 'accept')}
                                className="flex-1"
                              >
                                Confirm Accept
                              </Button>
                            </div>
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
                            <DialogTitle>Decline Interview Request</DialogTitle>
                            <DialogDescription>
                              Declining interview with {request.studentName}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Reason for declining (optional)..."
                              value={responseMessage}
                              onChange={(e) => setResponseMessage(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleRequestResponse(request.id, 'decline')}
                                variant="destructive"
                                className="flex-1"
                              >
                                Confirm Decline
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  {request.notes && (
                    <div className="mt-3 p-3 bg-muted rounded">
                      <p className="text-sm"><strong>Student Notes:</strong> {request.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Interviews */}
      {getRequestsByStatus('accepted').length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Upcoming Interviews</h2>
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
                        <p className="text-sm text-muted-foreground">Topic: {request.topic}</p>
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

      {interviewRequests.length === 0 && (
        <div className="text-center py-8">
          <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No interview requests yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Students will see your profile when you're accepting interviews.
          </p>
        </div>
      )}
    </div>
  );
};