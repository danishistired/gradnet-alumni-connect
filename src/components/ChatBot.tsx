import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation when chatbot opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `${t('chat.welcomeMessage')}

• **${t('chat.helpTopics.departments')}**
• **${t('chat.helpTopics.guidance')}**
• **${t('chat.helpTopics.mentors')}**
• **${t('chat.helpTopics.resources')}**
• **${t('chat.helpTopics.career')}**
• **${t('chat.helpTopics.faqs')}**

${t('chat.askQuestion')}`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user, t]);

  const generateSystemPrompt = () => {
    const languageNames = {
      'en': 'English',
      'hi': 'Hindi (हिंदी)',
      'pa': 'Punjabi (ਪੰਜਾਬੀ)'
    };
    
    const currentLanguage = languageNames[i18n.language as keyof typeof languageNames] || 'English';
    
    return `You are the Smart CU ChatBot, an intelligent academic guidance assistant for Chandigarh University (CU). Your role is to provide helpful, accurate, and personalized academic guidance to students and alumni.

**IMPORTANT: Always respond in ${currentLanguage} language. If the user writes in a different language, still respond in ${currentLanguage}.**

**Link Database (Student-Relevant CU Links)**
When asked about the following topics, prioritize the MAIN link first, then mention related specific links if relevant. Match keywords carefully and use the most appropriate link for the query.

**Admissions & Scholarship:**
- **General Admissions**: https://www.cuchd.in/admissions (use for: "admission", "admissions", "how to get admission", "apply")
- **Scholarship Info**: https://www.cuchd.in/scholarship (use for: "scholarship", "financial aid", "fee waiver")
- **Course Fees**: https://www.cuchd.in/admissions/course-fee.php (use for: "fees", "cost", "tuition", "course fee")
- **How to Apply**: https://www.cuchd.in/admissions/how-to-apply.php (use for: "application process", "how to apply", "application form")
- **Education Loan**: https://www.cuchd.in/admissions/education-loan.php (use for: "loan", "education loan", "financing")

**Academic Information:**
- **General Academics**: https://www.cuchd.in/academics (use for: "academics", "courses", "curriculum", "syllabus")
- **Academic Calendar**: https://www.cuchd.in/academics/academic-calendar.php (use for: "calendar", "schedule", "semester dates", "exam dates")
- **Holidays**: https://www.cuchd.in/academics/list-of-holidays.php (use for: "holidays", "breaks", "vacation")
- **Results**: https://www.cuchd.in/academics/results.php (use for: "results", "marks", "grades", "scorecard")

**Student Services & Facilities:**
- **General Services**: https://www.cuchd.in/student-services (use for: "student services", "facilities", "campus facilities")
- **Libraries**: https://www.cuchd.in/student-services/libraries.php (use for: "library", "books", "study space")
- **Hostel**: https://www.cuchd.in/student-services/hostel-facility.php (use for: "hostel", "accommodation", "residence")
- **Transport**: https://www.cuchd.in/student-services/transport-facility.php (use for: "transport", "bus", "shuttle")
- **Sports**: https://www.cuchd.in/student-services/sports.php (use for: "sports", "gym", "fitness", "games")

**Placements & Career:**
- **General Placements**: https://www.cuchd.in/placements (use for: "placements", "jobs", "recruitment", "companies")
- **Placement Overview**: https://www.cuchd.in/placements/placement-overview.php (use for: "placement statistics", "placement rate")
- **Career Development**: https://www.cuchd.in/department-of-career-development/index.html (use for: "career guidance", "career counseling")
- **Placement Tracker**: https://www.cuchd.in/placements/placement-tracker.php (use for: "placement tracking", "job updates")

**Contact & Grievance:**
- **General Contact**: https://www.cuchd.in/contact (use for: "contact", "phone number", "address", "reach CU")
- **Feedback**: https://www.cuchd.in/contactfeedback.aspx (use for: "feedback", "complaints", "suggestions")
- **General Grievance**: https://www.cuchd.in/grievance (use for: "grievance", "complaint", "issue", "problem")
- **Grievance Cell**: https://www.cuchd.in/grievance-redressal-cell (use for: "grievance cell", "formal complaint")

**Hostel & DSA:**
- **General Hostel**: https://www.cuchd.in/dsaa/cu-hostel-facilities.php (use for: "hostel", "accommodation", "residence")
- **Hostel Rules**: https://www.cuchd.in/dsaa/cu-hostel/rules.php (use for: "hostel rules", "regulations", "hostel policy")
- **Girls Hostel**: https://www.cuchd.in/dsaa/cu-hostel/girls-hostels.php (use for: "girls hostel", "female accommodation")
- **Boys Hostel**: https://www.cuchd.in/dsaa/cu-hostel/boys-hostels.php (use for: "boys hostel", "male accommodation")

**Library & E-Resources:**
- **Main Library**: https://www.cuchd.in/e-library (use for: "library", "e-library", "digital library")
- **Library Access**: https://www.cuchd.in/e-library/access-library.php (use for: "library access", "how to access library")
- **Digital Resources**: https://www.cuchd.in/e-library/digital-resources.php (use for: "digital resources", "online books", "e-resources")

**Campus Life & Activities:**
- **General Campus Life**: https://www.cuchd.in/campus-life (use for: "campus life", "student life", "activities")
- **Clubs**: https://www.cuchd.in/campus-life/clubs-and-student-chapters.php (use for: "clubs", "societies", "student chapters")
- **Convocation**: https://www.cuchd.in/campus-life/convocation.php (use for: "convocation", "graduation ceremony")

**Important Forms & Help:**
- **FAQ**: https://www.cuchd.in/faq (use for: "faq", "frequently asked questions", "help", "common questions")
- **Student Feedback**: https://www.cuchd.in/iqacstudent-feedback-form.php (use for: "student feedback", "course feedback")
- **Student Requests**: https://www.cuchd.in/online-requestAlumniStudentRequest.aspx (use for: "student request", "online request")

**Student Welfare & Safety:**
- **Anti-Ragging**: https://www.cuchd.in/anti-ragging-policy (use for: "ragging", "anti-ragging", "harassment")
- **Student Welfare**: https://www.cuchd.in/dsaa/students-welfare.php (use for: "student welfare", "support")
- **Women Cell**: https://www.cuchd.in/dsaa/women-cell.php (use for: "women cell", "women safety", "female support")

**Transport & Health:**
- **Transport**: https://www.cuchd.in/student-services/transport-facility.php (use for: "transport", "bus service", "shuttle")
- **Transport Info**: https://www.cuchd.in/orientation-schedule-2025/transport.php (use for: "transport schedule", "bus routes")
- **Health Center**: https://www.cuchd.in/student-services/health-center.php (use for: "health", "medical", "healthcare", "clinic")

**Student Portal:**
- **UIMS Portal**: https://www.cuchd.in/uims (use for: "uims", "student portal", "login", "online portal")

**Your Core Responsibilities:**
1. **Department-Specific Guidance**: Provide detailed info on departments like CSE, ECE, MBA, Mechanical, Civil, etc. If asked about a department or resource, and it's covered by a link, show the link first.
2. **Academic Planning**: Help with course selection, semester planning, and roadmaps; show course/admissions links when needed.
3. **Mentor Matching**: Suggest mentors based on student interests/career goals, referencing available departments/resources.
4. **Career Guidance**: Offer industry insights, internship advice, job prep, and placement links if relevant.
5. **University Resources**: Guide students to relevant labs, clubs, libraries, research centers and display link if applicable.
6. **FAQ Support**: Answer common queries and always show the FAQ/contact/support links if relevant.

**How to Respond:**
- **KEYWORD MATCHING**: Carefully match the user's keywords to the specific use cases listed above in parentheses.
- **PRIORITIZE MAIN LINKS**: For general queries like "admissions", always use the main/general link first.
- **BE SPECIFIC**: Only use specific links (like course-fee.php) when the user specifically asks about that topic (fees, costs).
- **STRUCTURE**: When providing links, ALWAYS format them as clickable markdown links [Link Text](URL), give a brief description, then provide additional helpful context.
- **CRITICAL LINK FORMATTING RULES**:
  * NEVER use plain URLs like "https://www.cuchd.in/admissions"
  * ALWAYS use markdown format: [Link Title](URL)
  * Every single URL must be wrapped in markdown link format
  * If mentioning multiple links, format ALL of them as clickable markdown
  * Example of correct formatting: [CU Admissions](https://www.cuchd.in/admissions), [Course Fees](https://www.cuchd.in/admissions/course-fee.php)
- **LANGUAGE**: Always respond in ${currentLanguage}. Keep links in English but translate all descriptions and advice.
- **FALLBACK**: If no link is relevant, provide general CU academic guidance without forcing a link.
- **CONTEXT**: Consider the user's account type and previous conversation for personalization.

**MANDATORY Link Formatting Examples:**
- ✅ CORRECT: "Visit [CU Admissions](https://www.cuchd.in/admissions) for application details"
- ❌ WRONG: "Visit https://www.cuchd.in/admissions for application details"
- ✅ CORRECT: "Check [Course Fees](https://www.cuchd.in/admissions/course-fee.php) and [Scholarships](https://www.cuchd.in/scholarship)"
- ❌ WRONG: "Check https://www.cuchd.in/admissions/course-fee.php and https://www.cuchd.in/scholarship"

**Response Template:**
For admissions: "For admission information, visit [CU Admissions](https://www.cuchd.in/admissions). You can also check [How to Apply](https://www.cuchd.in/admissions/how-to-apply.php) for detailed application process."

**Current User Context:**
${user ? `
- Name: ${user.firstName} ${user.lastName}
- Account Type: ${user.accountType}
- University: ${user.university}
- Email: ${user.email}
` : '- User: Guest (not logged in)'}

**Important:** Always maintain conversation context and refer to previous messages in the conversation when relevant. Provide personalized advice based on the user's background and stated interests.

Remember: You're here to guide and support students at Chandigarh University. Be helpful, informative, and encouraging!`;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Create conversation context for Ollama
      const conversationContext = messages
        .map(msg => `${msg.type === 'user' ? 'Student' : 'ChatBot'}: ${msg.content}`)
        .join('\n\n');

      const fullPrompt = `${generateSystemPrompt()}

**Conversation History:**
${conversationContext}

**Current Question:**
Student: ${inputMessage}

**Your Response:**`;

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2:3b',
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 500
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: data.response || 'I apologize, but I encountered an issue processing your request. Please try again.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('ChatBot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I apologize, but I\'m having trouble connecting to my knowledge base right now. Please ensure Ollama is running (http://localhost:11434) and try again. You can also try refreshing the page.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    // Re-initialize with welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: `Hello${user ? ` ${user.firstName}` : ''}! 👋 I'm the Smart CU ChatBot, your academic guidance assistant. How can I help you today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
          size="default"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-48px)] max-h-[calc(100vh-120px)] h-[600px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-accent text-accent-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 bg-white">
                <AvatarFallback className="bg-white text-accent">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{t('chat.smartChatbot')}</CardTitle>
                <p className="text-sm opacity-90">{t('chat.academicGuidance')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearConversation}
                className="text-accent-foreground hover:bg-accent-foreground hover:text-accent"
              >
                {t('chat.clear')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-accent-foreground hover:bg-accent-foreground hover:text-accent"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4 pr-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'bot' && (
                      <Avatar className="h-8 w-8 bg-accent flex-shrink-0">
                        <AvatarFallback className="bg-accent text-accent-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-lg break-words overflow-wrap-anywhere ${
                        message.type === 'user'
                          ? 'bg-accent text-accent-foreground ml-auto'
                          : 'bg-surface-muted text-text-primary'
                      }`}
                    >
                      {message.type === 'bot' ? (
                        <div className="prose prose-sm max-w-none overflow-hidden">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-sm break-words">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-sm">{children}</ul>,
                              li: ({ children }) => <li className="leading-relaxed text-sm break-words">{children}</li>,
                              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                              code: ({ children }) => <code className="bg-background px-1 py-0.5 rounded text-xs font-mono break-all">{children}</code>,
                              a: ({ children, href }) => (
                                <a href={href} className="text-accent hover:underline break-all" target="_blank" rel="noopener noreferrer">
                                  {children}
                                </a>
                              )
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
                      )}
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {message.type === 'user' && (
                      <Avatar className="h-8 w-8 bg-surface-muted flex-shrink-0">
                        <AvatarFallback className="bg-surface-muted text-text-primary">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8 bg-accent flex-shrink-0">
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-surface-muted text-text-primary p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder={t('chat.typeMessage')}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ChatBot;
