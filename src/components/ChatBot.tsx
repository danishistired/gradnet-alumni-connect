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

**Your Core Responsibilities:**
1. **Department-Specific Guidance**: Provide detailed information about various departments like CSE, ECE, MBA, Mechanical, Civil, etc.
2. **Academic Planning**: Help with course selection, semester planning, and academic roadmaps
3. **Mentor Matching**: Suggest appropriate mentors based on student interests and career goals
4. **Career Guidance**: Offer industry insights, internship advice, and job preparation tips
5. **University Resources**: Guide students to relevant labs, libraries, research centers, and clubs
6. **FAQ Support**: Answer common questions about admissions, exams, deadlines, policies

**Your Personality:**
- Friendly, encouraging, and supportive
- Professional yet approachable
- Knowledgeable about academic and industry trends
- Patient and willing to explain complex topics simply

**Response Guidelines:**
- Keep responses concise but comprehensive (2-4 paragraphs max)
- Use bullet points for lists and multiple options
- Include specific actionable advice when possible
- Ask follow-up questions to better understand student needs
- Reference relevant CU departments, programs, or resources when appropriate
- If you don't know specific CU details, acknowledge it and provide general guidance

**Current User Context:**
${user ? `
- Name: ${user.firstName} ${user.lastName}
- Account Type: ${user.accountType}
- University: ${user.university}
- Email: ${user.email}
` : '- User: Guest (not logged in)'}

**Important:** Always maintain conversation context and refer to previous messages in the conversation when relevant. Provide personalized advice based on the user's background and stated interests.

Remember: You're here to guide and support students in their academic journey at Chandigarh University. Be helpful, informative, and encouraging!`;
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
