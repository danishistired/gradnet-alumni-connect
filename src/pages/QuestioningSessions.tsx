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
import { 
  HelpCircle, 
  Star, 
  Search,
  Filter,
  CreditCard,
  Send,
  MessageSquare,
  Clock,
  CheckCircle
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
  totalQuestions?: number;
  responseRate?: number;
  avgResponseTime?: string;
}

interface Question {
  id: string;
  alumniId: string;
  studentId: string;
  question: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'answered' | 'rejected';
  answer?: string;
  askedAt: string;
  answeredAt?: string;
  credits: number;
}

export const QuestioningSessions = () => {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [questionCategory, setQuestionCategory] = useState('');
  const [questionPriority, setQuestionPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);

  const QUESTION_COST = 1; // Credit points per question

  const questionCategories = [
    'Career Guidance',
    'Technical Skills',
    'Industry Insights', 
    'Job Search',
    'Interview Preparation',
    'Academic Advice',
    'Personal Development',
    'Company Culture',
    'Salary Negotiation',
    'Work-Life Balance'
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', cost: 1 },
    { value: 'medium', label: 'Medium Priority', cost: 1 },
    { value: 'high', label: 'High Priority', cost: 2 }
  ];

  useEffect(() => {
    fetchAlumni();
    fetchMyQuestions();
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

  const fetchMyQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/career-sessions/questions/my-questions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMyQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching my questions:', error);
    }
  };

  const handleAskQuestion = async () => {
    if (!selectedAlumni || !questionText.trim() || !questionCategory) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const cost = priorityOptions.find(p => p.value === questionPriority)?.cost || 1;

    if (!user?.creditPoints || user.creditPoints < cost) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${cost} credit${cost > 1 ? 's' : ''} to ask this question.`,
        variant: "destructive"
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/career-sessions/questions/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          alumniId: selectedAlumni.id,
          question: questionText.trim(),
          category: questionCategory,
          priority: questionPriority
        })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Question Sent!",
          description: `Your question has been sent to ${selectedAlumni.firstName} ${selectedAlumni.lastName}.`
        });
        setIsQuestionDialogOpen(false);
        resetQuestionForm();
        fetchMyQuestions();
      } else {
        toast({
          title: "Failed to Send",
          description: data.message || "Failed to send question.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error asking question:', error);
      toast({
        title: "Error",
        description: "Failed to send question.",
        variant: "destructive"
      });
    }
  };

  const resetQuestionForm = () => {
    setSelectedAlumni(null);
    setQuestionText('');
    setQuestionCategory('');
    setQuestionPriority('medium');
  };

  const filteredAlumni = alumni.filter(alumnus => {
    const matchesSearch = 
      `${alumnus.firstName} ${alumnus.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumnus.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumnus.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkill = !filterSkill || alumnus.skills.some(skill => 
      skill.toLowerCase().includes(filterSkill.toLowerCase())
    );

    return matchesSearch && matchesSkill;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionsByStatus = (status: string) => {
    return myQuestions.filter(q => q.status === status);
  };

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
        <h1 className="text-3xl font-bold mb-2">Questioning Sessions</h1>
        <p className="text-muted-foreground">
          Ask direct questions to experienced alumni and get personalized answers to help guide your career journey.
        </p>
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            1-2 Credits per Question
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Your Credits: {user?.creditPoints || 0}
          </Badge>
        </div>
      </div>

      {/* Question Categories */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Popular Question Categories</h2>
        <div className="flex flex-wrap gap-2">
          {questionCategories.map((category) => (
            <Badge key={category} variant="outline" className="cursor-pointer hover:bg-accent">
              {category}
            </Badge>
          ))}
        </div>
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
            placeholder="Filter by skill..."
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
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
                  <div className="flex items-center gap-2 mt-1 text-sm">
                    {alumnus.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{alumnus.rating}</span>
                      </div>
                    )}
                    {alumnus.responseRate && (
                      <Badge variant="secondary" className="text-xs">
                        {alumnus.responseRate}% response rate
                      </Badge>
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
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{alumnus.location}</p>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>{alumnus.totalQuestions || 0} questions answered</span>
                  </div>
                  {alumnus.avgResponseTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Avg response: {alumnus.avgResponseTime}</span>
                    </div>
                  )}
                </div>
                <Dialog open={isQuestionDialogOpen && selectedAlumni?.id === alumnus.id} onOpenChange={setIsQuestionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      onClick={() => setSelectedAlumni(alumnus)}
                      disabled={!user?.creditPoints || user.creditPoints < QUESTION_COST}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Ask Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Ask a Question</DialogTitle>
                      <DialogDescription>
                        Send a question to {alumnus.firstName} {alumnus.lastName}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Question Category</label>
                        <Select value={questionCategory} onValueChange={setQuestionCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {questionCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Priority Level</label>
                        <Select value={questionPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setQuestionPriority(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityOptions.map((priority) => (
                              <SelectItem key={priority.value} value={priority.value}>
                                {priority.label} ({priority.cost} credit{priority.cost > 1 ? 's' : ''})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Your Question</label>
                        <Textarea
                          placeholder="Ask a clear, specific question..."
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Cost: {priorityOptions.find(p => p.value === questionPriority)?.cost || 1} credit{(priorityOptions.find(p => p.value === questionPriority)?.cost || 1) > 1 ? 's' : ''}
                        </div>
                        <Button onClick={handleAskQuestion}>
                          <Send className="w-4 h-4 mr-2" />
                          Send Question
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

      {/* My Questions */}
      {myQuestions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">My Questions</h2>
          
          {/* Questions by Status */}
          <div className="space-y-6">
            {/* Answered Questions */}
            {getQuestionsByStatus('answered').length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Answered Questions ({getQuestionsByStatus('answered').length})
                </h3>
                <div className="space-y-3">
                  {getQuestionsByStatus('answered').map((question) => {
                    const alumnus = alumni.find(a => a.id === question.alumniId);
                    return (
                      <Card key={question.id}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="text-xs">
                                    {alumnus?.firstName[0]}{alumnus?.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">
                                    {alumnus?.firstName} {alumnus?.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{question.category}</p>
                                </div>
                              </div>
                              <Badge className={getStatusColor(question.status)}>
                                {question.status}
                              </Badge>
                            </div>
                            <div className="bg-muted p-3 rounded">
                              <p className="text-sm font-medium mb-1">Question:</p>
                              <p className="text-sm">{question.question}</p>
                            </div>
                            {question.answer && (
                              <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                                <p className="text-sm font-medium mb-1 text-green-800">Answer:</p>
                                <p className="text-sm text-green-700">{question.answer}</p>
                                <p className="text-xs text-green-600 mt-2">
                                  Answered on {new Date(question.answeredAt!).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pending Questions */}
            {getQuestionsByStatus('pending').length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  Pending Questions ({getQuestionsByStatus('pending').length})
                </h3>
                <div className="space-y-3">
                  {getQuestionsByStatus('pending').map((question) => {
                    const alumnus = alumni.find(a => a.id === question.alumniId);
                    return (
                      <Card key={question.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs">
                                  {alumnus?.firstName[0]}{alumnus?.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">
                                  {alumnus?.firstName} {alumnus?.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">{question.category}</p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(question.status)}>
                              {question.status}
                            </Badge>
                          </div>
                          <div className="bg-muted p-3 rounded mt-3">
                            <p className="text-sm">{question.question}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Asked on {new Date(question.askedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};