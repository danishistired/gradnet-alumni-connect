import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  MessageCircle, 
  Clock, 
  Star, 
  CalendarIcon, 
  Search,
  Filter,
  CreditCard,
  Users,
  Heart,
  BookOpen
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AlumniProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  skills: string[];
  university: string;
  graduationYear: string;
  location: string;
  profilePicture?: string;
  rating?: number;
  totalCounselling?: number;
  specialties?: string[];
}

interface CounsellingSession {
  id: string;
  alumniId: string;
  studentId: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  topic: string;
  sessionType: 'career-guidance' | 'academic-advice' | 'personal-development' | 'industry-insights';
  notes?: string;
  meetingLink?: string;
  createdAt: string;
}

export const CounsellingSessions = () => {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [bookingDate, setBookingDate] = useState<Date>();
  const [bookingTime, setBookingTime] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [sessionTopic, setSessionTopic] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [mySessions, setMySessions] = useState<CounsellingSession[]>([]);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  const COUNSELLING_COST = 50; // Credit points per session

  const sessionTypes = [
    { value: 'career-guidance', label: 'Career Guidance', icon: BookOpen },
    { value: 'academic-advice', label: 'Academic Advice', icon: Heart },
    { value: 'personal-development', label: 'Personal Development', icon: Users },
    { value: 'industry-insights', label: 'Industry Insights', icon: Star },
  ];

  useEffect(() => {
    fetchAlumni();
    fetchMySessions();
  }, []);

  const fetchAlumni = async () => {
    try {
      const response = await fetch('/api/users/alumni');
      const data = await response.json();
      if (data.success) {
        setAlumni(data.alumni);
      }
    } catch (error) {
      console.error('Error fetching alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/career-sessions/counselling/my-sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMySessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching my counselling sessions:', error);
    }
  };

  const handleBookSession = async () => {
    if (!selectedAlumni || !bookingDate || !bookingTime || !sessionType || !sessionTopic) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!user?.creditPoints || user.creditPoints < COUNSELLING_COST) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${COUNSELLING_COST} credits to book a counselling session.`,
        variant: "destructive"
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/career-sessions/counselling/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          alumniId: selectedAlumni.id,
          date: format(bookingDate, 'yyyy-MM-dd'),
          time: bookingTime,
          sessionType: sessionType,
          topic: sessionTopic,
          notes: additionalNotes,
          duration: 60 // Default 1 hour
        })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Session Booked!",
          description: `Your counselling session with ${selectedAlumni.firstName} ${selectedAlumni.lastName} has been scheduled.`
        });
        setIsBookingDialogOpen(false);
        resetBookingForm();
        fetchMySessions();
      } else {
        toast({
          title: "Booking Failed",
          description: data.message || "Failed to book counselling session.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Error",
        description: "Failed to book counselling session.",
        variant: "destructive"
      });
    }
  };

  const resetBookingForm = () => {
    setSelectedAlumni(null);
    setBookingDate(undefined);
    setBookingTime('');
    setSessionType('');
    setSessionTopic('');
    setAdditionalNotes('');
  };

  const filteredAlumni = alumni.filter(alumnus => {
    const matchesSearch = 
      `${alumnus.firstName} ${alumnus.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumnus.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumnus.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = !filterSpecialty || 
      (alumnus.specialties && alumnus.specialties.some(specialty => 
        specialty.toLowerCase().includes(filterSpecialty.toLowerCase())
      )) ||
      alumnus.skills.some(skill => 
        skill.toLowerCase().includes(filterSpecialty.toLowerCase())
      );

    return matchesSearch && matchesSpecialty;
  });

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading alumni profiles...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Navbar />
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Counselling Sessions</h1>
        <p className="text-muted-foreground">
          Book personalized counselling sessions with experienced alumni for career guidance, academic advice, and personal development.
        </p>
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            {COUNSELLING_COST} Credits per Session
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Your Credits: {user?.creditPoints || 0}
          </Badge>
        </div>
      </div>

      {/* Session Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {sessionTypes.map((type) => (
          <Card key={type.value} className="text-center">
            <CardContent className="p-4">
              <type.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium text-sm">{type.label}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search alumni by name, company, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Filter by specialty..."
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Alumni Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredAlumni.map((alumnus) => (
          <Card key={alumnus.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={alumnus.profilePicture} />
                  <AvatarFallback>
                    {alumnus.firstName[0]}{alumnus.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {alumnus.firstName} {alumnus.lastName}
                  </CardTitle>
                  <CardDescription>
                    {alumnus.jobTitle} at {alumnus.company}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-1">
                    {alumnus.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{alumnus.rating}</span>
                      </div>
                    )}
                    {alumnus.totalCounselling && (
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {alumnus.totalCounselling} sessions
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Expertise</p>
                  <div className="flex flex-wrap gap-1">
                    {alumnus.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {alumnus.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{alumnus.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{alumnus.location}</p>
                  <p>Graduated: {alumnus.graduationYear}</p>
                </div>
                <Dialog open={isBookingDialogOpen && selectedAlumni?.id === alumnus.id} onOpenChange={setIsBookingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      onClick={() => setSelectedAlumni(alumnus)}
                      disabled={!user?.creditPoints || user.creditPoints < COUNSELLING_COST}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Book Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Book Counselling Session</DialogTitle>
                      <DialogDescription>
                        Schedule a 1-hour counselling session with {alumnus.firstName} {alumnus.lastName}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Session Type</label>
                        <Select value={sessionType} onValueChange={setSessionType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose session type" />
                          </SelectTrigger>
                          <SelectContent>
                            {sessionTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Session Topic</label>
                        <Input
                          placeholder="e.g., Career transition advice, Job search strategy"
                          value={sessionTopic}
                          onChange={(e) => setSessionTopic(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Select Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !bookingDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {bookingDate ? format(bookingDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={bookingDate}
                              onSelect={setBookingDate}
                              disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Select Time</label>
                        <Select value={bookingTime} onValueChange={setBookingTime}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose time slot" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Additional Notes (Optional)</label>
                        <Textarea
                          placeholder="Any specific areas you'd like to discuss..."
                          value={additionalNotes}
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Cost: {COUNSELLING_COST} credits
                        </div>
                        <Button onClick={handleBookSession}>
                          Book Session
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAlumni.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No alumni found matching your criteria.</p>
        </div>
      )}

      {/* My Upcoming Sessions */}
      {mySessions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">My Counselling Sessions</h2>
          <div className="space-y-4">
            {mySessions.map((session) => {
              const alumnus = alumni.find(a => a.id === session.alumniId);
              const sessionTypeLabel = sessionTypes.find(t => t.value === session.sessionType)?.label;
              return (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {alumnus?.firstName[0]}{alumnus?.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">
                            {alumnus?.firstName} {alumnus?.lastName}
                          </h4>
                          <p className="text-sm text-muted-foreground">{sessionTypeLabel} - {session.topic}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="w-4 h-4" />
                          {session.date}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {session.time}
                        </div>
                      </div>
                      <Badge variant={
                        session.status === 'confirmed' ? 'default' :
                        session.status === 'pending' ? 'secondary' :
                        session.status === 'completed' ? 'outline' : 'destructive'
                      }>
                        {session.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};