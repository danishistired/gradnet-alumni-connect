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
  HelpCircle, 
  Clock, 
  Settings,
  Send,
  Eye,
  MessageSquare,
  Star,
  ThumbsUp,
  Filter,
  Search
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Question {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  title: string;
  content: string;
  category: 'technical' | 'career' | 'academic' | 'general';
  tags: string[];
  isAnonymous: boolean;
  credits: number;
  status: 'pending' | 'answered' | 'closed';
  createdAt: string;
  answer?: {
    content: string;
    answeredAt: string;
    helpful: number;
    rating: number;
  };
}

interface QuestionSettings {
  isAcceptingQuestions: boolean;
  autoAcceptQuestions: boolean;
  maxQuestionsPerDay: number;
  preferredCategories: string[];
  minimumCredits: number;
  responseTimeTarget: number; // hours
}

export const AlumniManageQuestions = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<QuestionSettings>({
    isAcceptingQuestions: true,
    autoAcceptQuestions: true,
    maxQuestionsPerDay: 10,
    preferredCategories: [],
    minimumCredits: 1,
    responseTimeTarget: 24
  });
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { value: 'technical', label: 'Technical', icon: '💻' },
    { value: 'career', label: 'Career', icon: '💼' },
    { value: 'academic', label: 'Academic', icon: '📚' },
    { value: 'general', label: 'General', icon: '💬' }
  ];

  useEffect(() => {
    fetchQuestions();
    fetchSettings();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/alumni/questions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/alumni/settings/questions', {
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

  const submitAnswer = async (questionId: string) => {
    if (!answerContent.trim()) {
      toast({
        title: "Error",
        description: "Please provide an answer before submitting.",
        variant: "destructive"
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/alumni/questions/${questionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answer: answerContent })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Answer Submitted",
          description: "Your answer has been submitted successfully."
        });
        fetchQuestions();
        setSelectedQuestion(null);
        setAnswerContent('');
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to submit answer.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Error",
        description: "Failed to submit answer.",
        variant: "destructive"
      });
    }
  };

  const updateSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/alumni/settings/questions', {
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
          description: "Your question settings have been saved."
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
      case 'answered': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    return categories.find(cat => cat.value === category)?.icon || '💬';
  };

  const getFilteredQuestions = () => {
    return questions.filter(question => {
      const matchesStatus = filterStatus === 'all' || question.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || question.category === filterCategory;
      const matchesSearch = searchTerm === '' || 
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesStatus && matchesCategory && matchesSearch;
    });
  };

  const getQuestionsByStatus = (status: string) => {
    return questions.filter(q => q.status === status);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <Navbar />
        <div className="text-center">Loading question management...</div>
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
            <h1 className="text-3xl font-bold mb-2">Manage Questions</h1>
            <p className="text-muted-foreground">
              Answer student questions and share your knowledge and experience.
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
                  <DialogTitle>Question Settings</DialogTitle>
                  <DialogDescription>
                    Configure your question answering preferences
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Accept Questions</label>
                      <p className="text-xs text-muted-foreground">Allow students to ask you questions</p>
                    </div>
                    <Switch 
                      checked={settings.isAcceptingQuestions}
                      onCheckedChange={(checked) => setSettings(prev => ({...prev, isAcceptingQuestions: checked}))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Max Questions per Day</label>
                    <Input
                      type="number"
                      value={settings.maxQuestionsPerDay}
                      onChange={(e) => setSettings(prev => ({...prev, maxQuestionsPerDay: parseInt(e.target.value)}))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Minimum Credits Required</label>
                    <Select 
                      value={settings.minimumCredits.toString()}
                      onValueChange={(value) => setSettings(prev => ({...prev, minimumCredits: parseInt(value)}))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 credit</SelectItem>
                        <SelectItem value="2">2 credits</SelectItem>
                        <SelectItem value="3">3 credits</SelectItem>
                        <SelectItem value="5">5 credits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Response Time Target (hours)</label>
                    <Select 
                      value={settings.responseTimeTarget.toString()}
                      onValueChange={(value) => setSettings(prev => ({...prev, responseTimeTarget: parseInt(value)}))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 hours</SelectItem>
                        <SelectItem value="12">12 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="48">48 hours</SelectItem>
                        <SelectItem value="72">72 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Preferred Categories</label>
                    <p className="text-xs text-muted-foreground mb-2">Select categories you're most comfortable with</p>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <label key={category.value} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={settings.preferredCategories.includes(category.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSettings(prev => ({
                                  ...prev,
                                  preferredCategories: [...prev.preferredCategories, category.value]
                                }));
                              } else {
                                setSettings(prev => ({
                                  ...prev,
                                  preferredCategories: prev.preferredCategories.filter(c => c !== category.value)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <span>{category.icon} {category.label}</span>
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
                {getQuestionsByStatus('pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending Questions</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {getQuestionsByStatus('answered').length}
              </div>
              <div className="text-sm text-muted-foreground">Answered</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {questions.reduce((sum, q) => sum + (q.answer?.rating || 0), 0) / Math.max(getQuestionsByStatus('answered').length, 1) || 0}
              </div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {settings.isAcceptingQuestions ? 'Available' : 'Unavailable'}
              </div>
              <div className="text-sm text-muted-foreground">Current Status</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="answered">Answered</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.icon} {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {getFilteredQuestions().map((question) => (
          <Card key={question.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-lg">{question.title}</h4>
                    <Badge className={getStatusColor(question.status)}>
                      {question.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {getCategoryIcon(question.category)} {categories.find(cat => cat.value === question.category)?.label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {question.credits} credits
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    {!question.isAnonymous && (
                      <>
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {question.studentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{question.studentName}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{formatTimeAgo(question.createdAt)}</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {question.content}
                  </p>

                  {question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {question.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {question.answer && (
                    <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Your Answer</span>
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <Star className="w-3 h-3 fill-current" />
                          {question.answer.rating}/5
                        </div>
                      </div>
                      <p className="text-sm text-green-700 line-clamp-2">
                        {question.answer.content}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{question.title}</DialogTitle>
                        <DialogDescription>
                          {question.category} • {question.credits} credits • {formatTimeAgo(question.createdAt)}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div>
                          <h4 className="font-medium mb-2">Question Details</h4>
                          <p className="text-sm text-muted-foreground">{question.content}</p>
                        </div>

                        {question.tags.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Tags</h4>
                            <div className="flex flex-wrap gap-1">
                              {question.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {question.status === 'pending' && (
                          <div>
                            <h4 className="font-medium mb-2">Your Answer</h4>
                            <Textarea
                              placeholder="Provide a helpful and detailed answer..."
                              value={answerContent}
                              onChange={(e) => setAnswerContent(e.target.value)}
                              rows={6}
                            />
                            <Button 
                              onClick={() => submitAnswer(question.id)}
                              className="w-full mt-2"
                              disabled={!answerContent.trim()}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Submit Answer
                            </Button>
                          </div>
                        )}

                        {question.answer && (
                          <div>
                            <h4 className="font-medium mb-2">Your Previous Answer</h4>
                            <div className="p-3 bg-muted rounded">
                              <p className="text-sm">{question.answer.content}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  Rating: {question.answer.rating}/5
                                </div>
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="w-3 h-3" />
                                  {question.answer.helpful} helpful
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {question.status === 'pending' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm"
                          onClick={() => setSelectedQuestion(question)}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Answer
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Answer Question</DialogTitle>
                          <DialogDescription>
                            {question.title}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-3 bg-muted rounded">
                            <p className="text-sm">{question.content}</p>
                          </div>
                          <Textarea
                            placeholder="Provide a helpful and detailed answer..."
                            value={answerContent}
                            onChange={(e) => setAnswerContent(e.target.value)}
                            rows={6}
                          />
                          <Button 
                            onClick={() => submitAnswer(question.id)}
                            className="w-full"
                            disabled={!answerContent.trim()}
                          >
                            Submit Answer
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {getFilteredQuestions().length === 0 && (
        <div className="text-center py-8">
          <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {questions.length === 0 ? 'No questions yet.' : 'No questions match your current filters.'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Students will be able to ask you questions when you're accepting them.
          </p>
        </div>
      )}
    </div>
  );
};