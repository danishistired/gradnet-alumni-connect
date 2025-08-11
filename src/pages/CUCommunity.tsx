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
  Send,
  ThumbsUp,
  Reply
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

export const CUCommunity = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [answerDialogs, setAnswerDialogs] = useState<Set<string>>(new Set());
  const [newAnswers, setNewAnswers] = useState<{[key: string]: string}>({});

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

  const handleAnswerQuestion = async (questionId: string) => {
    const answerContent = newAnswers[questionId];
    if (!answerContent?.trim()) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/prospective/questions/${questionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: answerContent })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update the questions list with the new answer
        setQuestions(prevQuestions => 
          prevQuestions.map(q => 
            q.id === questionId 
              ? { ...q, answers: [...q.answers, data.answer] }
              : q
          )
        );
        setNewAnswers(prev => ({ ...prev, [questionId]: "" }));
        setAnswerDialogs(prev => {
          const newSet = new Set(prev);
          newSet.delete(questionId);
          return newSet;
        });
      } else {
        console.error('Server returned error:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to post answer:', error);
    }
  };

  const toggleQuestionExpanded = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const toggleAnswerDialog = (questionId: string) => {
    setAnswerDialogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
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
                  Help prospective students by answering their questions about Chandigarh University
                </p>
              </div>
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

            {/* Stats */}
            <div className="flex gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <MessageSquare className="w-4 h-4" />
                <span>{filteredQuestions.length} questions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Users className="w-4 h-4" />
                <span>Help prospective CU students</span>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <Card className="p-8 text-center">
                <HelpCircle className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No questions found</h3>
                <p className="text-text-secondary">
                  {searchTerm || selectedCategory !== "all" 
                    ? "Try adjusting your search or filters"
                    : "No questions have been posted yet"}
                </p>
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
                  
                  <CardContent className="pt-0">
                    {/* Answer Button - Only for students and alumni */}
                    {user && (user.accountType === 'student' || user.accountType === 'alumni') && (
                      <div className="flex items-center gap-3 mb-4">
                        <Button
                          onClick={() => toggleAnswerDialog(question.id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Reply className="w-4 h-4" />
                          Answer Question
                        </Button>
                        {question.answers.length > 0 && (
                          <Button
                            onClick={() => toggleQuestionExpanded(question.id)}
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
                            {expandedQuestions.has(question.id) ? ' (Hide)' : ' (Show)'}
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Message for prospective students */}
                    {user && user.accountType === 'prospective' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Note:</span> As a prospective student, you can view answers but cannot post answers yourself. Only current CU students and alumni can answer questions.
                        </p>
                      </div>
                    )}

                    {/* Show answers button for all users if there are answers */}
                    {(!user || (user.accountType !== 'student' && user.accountType !== 'alumni')) && question.answers.length > 0 && (
                      <div className="flex items-center gap-3 mb-4">
                        <Button
                          onClick={() => toggleQuestionExpanded(question.id)}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
                          {expandedQuestions.has(question.id) ? ' (Hide)' : ' (Show)'}
                        </Button>
                      </div>
                    )}

                    {/* Answer Input - Only for students and alumni */}
                    {user && (user.accountType === 'student' || user.accountType === 'alumni') && answerDialogs.has(question.id) && (
                      <div className="border rounded-lg p-4 mb-4 bg-surface-muted">
                        <Label htmlFor={`answer-${question.id}`} className="text-sm font-medium mb-2 block">
                          Your Answer
                        </Label>
                        <Textarea
                          id={`answer-${question.id}`}
                          value={newAnswers[question.id] || ""}
                          onChange={(e) => setNewAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                          placeholder="Share your knowledge and help this prospective student..."
                          rows={3}
                          className="mb-3"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAnswerQuestion(question.id)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Post Answer
                          </Button>
                          <Button
                            onClick={() => toggleAnswerDialog(question.id)}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Answers */}
                    {expandedQuestions.has(question.id) && question.answers.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="space-y-3">
                          {question.answers.map((answer) => (
                            <div key={answer.id} className="bg-surface-muted rounded-lg p-4">
                              <p className="text-sm text-text-primary mb-3">{answer.content}</p>
                              <div className="flex items-center justify-between">
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
                                <div className="flex items-center gap-2">
                                  {answer.helpfulCount > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-text-muted">
                                      <ThumbsUp className="w-3 h-3" />
                                      <span>{answer.helpfulCount}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
