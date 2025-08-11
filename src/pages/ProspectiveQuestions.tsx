import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Navbar } from "@/components/Navbar";
import { 
  HelpCircle, 
  Plus, 
  MessageSquare, 
  Users, 
  Clock, 
  Search,
  GraduationCap,
  Building,
  Star,
  Send
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface Question {
  id: string;
  title: string;
  content: string;
  category: string;
  askedBy: {
    id: string;
    firstName: string;
    lastName: string;
    accountType: 'prospective' | 'student' | 'alumni';
    currentSchool?: string;
  };
  answers: Answer[];
  createdAt: string;
  isResolved: boolean;
}

interface Answer {
  id: string;
  content: string;
  answeredBy: {
    id: string;
    firstName: string;
    lastName: string;
    accountType: 'student' | 'alumni';
    university?: string;
    graduationYear?: string;
  };
  createdAt: string;
  isHelpful: boolean;
  helpfulCount: number;
}

export const ProspectiveQuestions = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAskDialog, setShowAskDialog] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    content: "",
    category: "general"
  });

  const categories = [
    { id: "all", label: "All Questions", count: 0 },
    { id: "admissions", label: "Admissions", count: 0 },
    { id: "academics", label: "Academics", count: 0 },
    { id: "campus-life", label: "Campus Life", count: 0 },
    { id: "placements", label: "Placements", count: 0 },
    { id: "facilities", label: "Facilities", count: 0 },
    { id: "general", label: "General", count: 0 }
  ];

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/prospective/questions');
      const data = await response.json();
      
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!newQuestion.title.trim() || !newQuestion.content.trim()) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/prospective/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newQuestion)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setQuestions([data.question, ...questions]);
        setNewQuestion({ title: "", content: "", category: "general" });
        setShowAskDialog(false);
      } else {
        console.error('Server returned error:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to ask question:', error);
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || question.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getAccountTypeBadge = (accountType: string) => {
    switch (accountType) {
      case 'prospective':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Prospective</Badge>;
      case 'student':
        return <Badge variant="default" className="bg-green-600">Student</Badge>;
      case 'alumni':
        return <Badge variant="default" className="bg-purple-600">Alumni</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <p className="text-text-secondary mt-4">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                  <HelpCircle className="w-8 h-8 text-blue-600" />
                  CU Community Q&A
                </h1>
                <p className="text-text-secondary mt-2">
                  Ask questions about Chandigarh University and get answers from current students and alumni
                </p>
              </div>
              
              {user && (
                <Dialog open={showAskDialog} onOpenChange={setShowAskDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Ask Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Ask a Question</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Question Title</Label>
                        <Input
                          id="title"
                          value={newQuestion.title}
                          onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                          placeholder="What would you like to know?"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          value={newQuestion.category}
                          onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                          className="w-full p-2 border border-border rounded-md"
                        >
                          {categories.slice(1).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="content">Question Details</Label>
                        <Textarea
                          id="content"
                          value={newQuestion.content}
                          onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
                          placeholder="Provide more details about your question..."
                          rows={4}
                        />
                      </div>
                      <Button 
                        onClick={handleAskQuestion}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Post Question
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="text-sm"
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <Card className="p-8 text-center">
                <HelpCircle className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No questions found</h3>
                <p className="text-text-secondary mb-4">
                  {searchTerm || selectedCategory !== "all" 
                    ? "Try adjusting your search or filters"
                    : "Be the first to ask a question about CU!"}
                </p>
                {user && (
                  <Button onClick={() => setShowAskDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                    Ask First Question
                  </Button>
                )}
              </Card>
            ) : (
              filteredQuestions.map((question) => (
                <Card key={question.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {question.category.replace('-', ' ').toUpperCase()}
                          </Badge>
                          {question.isResolved && (
                            <Badge className="bg-green-600 text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg font-semibold text-text-primary mb-2">
                          {question.title}
                        </CardTitle>
                        <p className="text-text-secondary text-sm mb-3">
                          {question.content}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {question.askedBy.firstName.charAt(0)}{question.askedBy.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{question.askedBy.firstName} {question.askedBy.lastName}</span>
                            {getAccountTypeBadge(question.askedBy.accountType)}
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {question.answers.length > 0 && (
                    <CardContent className="pt-0">
                      <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-4 h-4 text-text-secondary" />
                          <span className="text-sm font-medium">
                            {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {question.answers.slice(0, 2).map((answer) => (
                            <div key={answer.id} className="bg-surface-muted rounded-lg p-3">
                              <p className="text-sm text-text-primary mb-2">{answer.content}</p>
                              <div className="flex items-center gap-3 text-xs text-text-muted">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-5 h-5">
                                    <AvatarFallback className="text-xs">
                                      {answer.answeredBy.firstName.charAt(0)}{answer.answeredBy.lastName.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{answer.answeredBy.firstName} {answer.answeredBy.lastName}</span>
                                  {getAccountTypeBadge(answer.answeredBy.accountType)}
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                          ))}
                          {question.answers.length > 2 && (
                            <Button variant="outline" size="sm" className="w-full">
                              View {question.answers.length - 2} more answer{question.answers.length - 2 !== 1 ? 's' : ''}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Call to Action for Non-Users */}
          {!user && (
            <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  Join the CU Community
                </h3>
                <p className="text-blue-800 mb-4">
                  Create an account to ask questions and get personalized answers from CU students and alumni
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => window.location.href = '/prospective-student'}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Join as Prospective Student
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/register'}
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Join as Student/Alumni
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
