import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search, MessageCircle } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isMe: boolean;
}

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Senior Software Engineer",
    company: "Google",
    avatar: "SC",
    lastMessage: "Thanks for reaching out! I'd be happy to help with your questions about React development.",
    timestamp: "2 min ago",
    unread: 2,
    online: true
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    role: "Product Manager",
    company: "Spotify",
    avatar: "MR",
    lastMessage: "The internship application process can be challenging, but I have some tips that might help.",
    timestamp: "1 hour ago",
    unread: 0,
    online: true
  },
  {
    id: "3",
    name: "Emily Zhang",
    role: "Data Scientist",
    company: "Netflix",
    avatar: "EZ",
    lastMessage: "Machine learning is a fascinating field! What specific area interests you most?",
    timestamp: "3 hours ago",
    unread: 1,
    online: false
  },
  {
    id: "4",
    name: "Alex Kim",
    role: "CS Student",
    company: "Carnegie Mellon",
    avatar: "AK",
    lastMessage: "Hey! Saw your post about the hackathon. Mind if we team up?",
    timestamp: "1 day ago",
    unread: 0,
    online: true
  }
];

const mockMessages: { [key: string]: Message[] } = {
  "1": [
    { id: "1", senderId: "me", content: "Hi Sarah! I'm a CS student interested in React development. Could you share some advice?", timestamp: "10:30 AM", isMe: true },
    { id: "2", senderId: "1", content: "Hi! Absolutely, I'd be happy to help. React is a great choice for web development.", timestamp: "10:32 AM", isMe: false },
    { id: "3", senderId: "1", content: "What specific aspects are you curious about? Component architecture, state management, or something else?", timestamp: "10:32 AM", isMe: false },
    { id: "4", senderId: "me", content: "I'm particularly interested in best practices for large-scale applications and state management patterns.", timestamp: "10:35 AM", isMe: true },
    { id: "5", senderId: "1", content: "Great question! For large apps, I'd recommend starting with understanding component composition and the Context API.", timestamp: "10:37 AM", isMe: false },
    { id: "6", senderId: "1", content: "Thanks for reaching out! I'd be happy to help with your questions about React development.", timestamp: "10:38 AM", isMe: false }
  ],
  "2": [
    { id: "1", senderId: "me", content: "Hi Michael! I'm looking for internship advice. How did you transition from engineering to PM?", timestamp: "Yesterday", isMe: true },
    { id: "2", senderId: "2", content: "Hey! Great question. The transition took some time, but I started by taking on more product-focused projects during my engineering role.", timestamp: "Yesterday", isMe: false },
    { id: "3", senderId: "2", content: "The internship application process can be challenging, but I have some tips that might help.", timestamp: "1 hour ago", isMe: false }
  ]
};

interface MessagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MessagesDialog({ open, onOpenChange }: MessagesDialogProps) {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchInput.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedContact) {
      // Simulate sending message
      setMessageInput("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[600px] p-0">
        <div className="flex h-full">
          {/* Contacts Sidebar */}
          <div className="w-80 border-r border-border flex flex-col bg-surface">
            <DialogHeader className="p-4 border-b border-border">
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-accent" />
                Messages
              </DialogTitle>
            </DialogHeader>
            
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                <Input
                  placeholder="Search conversations..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact.id)}
                  className={`w-full p-4 text-left hover:bg-surface-muted transition-colors border-b border-border/50 ${
                    selectedContact === contact.id ? 'bg-accent-light border-l-2 border-l-accent' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-accent-light text-accent font-semibold text-sm">
                          {contact.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {contact.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-text-primary truncate">{contact.name}</h4>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-text-muted">{contact.timestamp}</span>
                          {contact.unread > 0 && (
                            <Badge className="bg-accent text-accent-foreground px-1.5 py-0.5 text-xs min-w-[18px] h-[18px] rounded-full">
                              {contact.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-text-muted mb-1">{contact.role} at {contact.company}</p>
                      <p className="text-sm text-text-secondary truncate">{contact.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border bg-surface">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-accent-light text-accent font-semibold">
                        {mockContacts.find(c => c.id === selectedContact)?.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-text-primary">
                        {mockContacts.find(c => c.id === selectedContact)?.name}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {mockContacts.find(c => c.id === selectedContact)?.role} at{' '}
                        {mockContacts.find(c => c.id === selectedContact)?.company}
                      </p>
                    </div>
                    {mockContacts.find(c => c.id === selectedContact)?.online && (
                      <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
                        Online
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {mockMessages[selectedContact]?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.isMe
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-surface-muted text-text-primary'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.isMe ? 'text-accent-foreground/70' : 'text-text-muted'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border bg-surface">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-surface-muted/30">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">Select a conversation</h3>
                  <p className="text-text-muted">Choose from your existing conversations or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}