import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowUp, ArrowDown, MessageCircle, Share2, User, MapPin, Calendar } from "lucide-react";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");

  // Mock blog data - in real app, would fetch based on ID
  const blog = {
    id: 1,
    author: "Sarah Chen",
    avatar: "SC",
    role: "Senior Software Engineer at Google",
    college: "Stanford University",
    graduation: "2019",
    bio: "Full-stack developer passionate about scalable systems and mentoring. Previously at Facebook and Uber.",
    location: "San Francisco, CA",
    title: "Building Scalable React Applications with TypeScript",
    content: `
After 5 years at Google, I've learned that building scalable React applications isn't just about writing good code—it's about creating systems that can grow with your team and product.

## Component Architecture

The foundation of any scalable React app is a well-thought-out component architecture. Here are the key principles I follow:

### 1. Single Responsibility Principle
Each component should have one clear purpose. If you find yourself adding multiple unrelated features to a component, it's time to split it up.

### 2. Composition Over Inheritance
React's composition model is powerful. Instead of creating complex inheritance hierarchies, compose smaller components together.

### 3. Props Interface Design
Design your props interfaces carefully. They're contracts between components and should be:
- Clear and self-documenting
- Minimal but complete
- Backward compatible when possible

## State Management at Scale

When your app grows beyond a few components, you need a strategy for state management:

### Local State First
Not everything needs global state. Use local state (useState, useReducer) for component-specific data.

### Context for Theme/User Data
React Context is perfect for data that many components need but doesn't change often, like user information or themes.

### External Libraries for Complex State
For complex state management, consider libraries like Zustand or Redux Toolkit. The key is choosing the right tool for your specific needs.

## Testing Strategies

Testing is crucial for scalable applications:

1. **Unit Tests**: Test individual components and functions
2. **Integration Tests**: Test how components work together
3. **E2E Tests**: Test critical user journeys

## Performance Considerations

As your app scales, performance becomes critical:

- Use React.memo() judiciously
- Implement proper code splitting
- Optimize bundle sizes
- Monitor performance metrics

## Conclusion

Building scalable React applications is a journey, not a destination. The patterns I've shared have served me well at Google, but remember—the best architecture is the one that fits your team and product needs.

Keep learning, keep building, and don't be afraid to refactor when your architecture no longer serves you.
    `,
    tags: ["React", "TypeScript", "Architecture", "Scalability"],
    upvotes: 342,
    downvotes: 12,
    comments: 28,
    timeAgo: "2 hours ago",
    readTime: "8 min read"
  };

  const mockComments = [
    {
      id: 1,
      author: "David Park",
      avatar: "DP",
      role: "Frontend Developer at Airbnb",
      content: "Great article! The point about composition over inheritance really resonates with me. We've been refactoring our component library at Airbnb using these exact principles.",
      timeAgo: "1 hour ago",
      upvotes: 12,
      downvotes: 0,
      replies: [
        {
          id: 11,
          author: "Sarah Chen",
          avatar: "SC",
          role: "Senior Software Engineer at Google",
          content: "Thanks David! I'd love to hear more about your component library refactor. Are you planning to open source any of it?",
          timeAgo: "45 minutes ago",
          upvotes: 5,
          downvotes: 0
        }
      ]
    },
    {
      id: 2,
      author: "Maria Gonzalez",
      avatar: "MG",
      role: "CS Student at UC Berkeley",
      content: "This is exactly what I needed! I'm working on my capstone project and was struggling with state management. The Context vs external library guidance is super helpful.",
      timeAgo: "2 hours ago",
      upvotes: 8,
      downvotes: 0,
      replies: []
    },
    {
      id: 3,
      author: "Alex Kim",
      avatar: "AK",
      role: "Software Engineer at Microsoft",
      content: "The testing strategy section is gold. We've been following a similar approach at Microsoft and it's made our codebase so much more maintainable.",
      timeAgo: "3 hours ago",
      upvotes: 15,
      downvotes: 1,
      replies: []
    }
  ];

  const handleVote = (type: 'up' | 'down') => {
    console.log(`Voted ${type} on blog ${id}`);
  };

  const handleCommentVote = (commentId: number, type: 'up' | 'down') => {
    console.log(`Voted ${type} on comment ${commentId}`);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      console.log("Adding comment:", newComment);
      setNewComment("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={{ type: 'student', verified: true }} />
      
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/feed')}
                className="mb-4 text-text-secondary hover:text-accent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Feed
              </Button>
              
              <h1 className="text-3xl font-bold text-text-primary mb-4">{blog.title}</h1>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent-light rounded-full flex items-center justify-center">
                    <span className="text-accent font-semibold">{blog.avatar}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{blog.author}</h3>
                    <p className="text-text-secondary text-sm">{blog.role}</p>
                    <div className="flex items-center gap-2 text-text-muted text-sm">
                      <span>{blog.timeAgo}</span>
                      <span>•</span>
                      <span>{blog.readTime}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="bg-accent-light text-accent border-accent/20"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Content */}
            <Card className="card-elevated mb-8">
              <CardContent className="p-8">
                <div className="prose prose-gray max-w-none">
                  {blog.content.split('\n\n').map((paragraph, idx) => {
                    if (paragraph.startsWith('##')) {
                      return (
                        <h2 key={idx} className="text-xl font-semibold text-text-primary mt-8 mb-4">
                          {paragraph.replace('## ', '')}
                        </h2>
                      );
                    } else if (paragraph.startsWith('###')) {
                      return (
                        <h3 key={idx} className="text-lg font-medium text-text-primary mt-6 mb-3">
                          {paragraph.replace('### ', '')}
                        </h3>
                      );
                    } else if (paragraph.trim()) {
                      return (
                        <p key={idx} className="text-text-secondary mb-4 leading-relaxed">
                          {paragraph}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Voting */}
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <button 
                  className="p-2 hover:bg-surface-muted rounded-lg"
                  onClick={() => handleVote('up')}
                >
                  <ArrowUp className="w-5 h-5 text-text-muted hover:text-accent" />
                </button>
                <span className="font-medium text-text-primary">
                  {blog.upvotes - blog.downvotes}
                </span>
                <button 
                  className="p-2 hover:bg-surface-muted rounded-lg"
                  onClick={() => handleVote('down')}
                >
                  <ArrowDown className="w-5 h-5 text-text-muted hover:text-accent" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-text-muted">
                <MessageCircle className="w-5 h-5" />
                <span>{blog.comments} comments</span>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-text-primary">Comments</h3>
              
              {/* Add Comment */}
              <Card className="card-elevated">
                <CardContent className="p-4">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-3 min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="btn-accent"
                    >
                      Post Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Comments List */}
              {mockComments.map((comment) => (
                <Card key={comment.id} className="card-elevated">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-accent-light rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-accent font-semibold text-sm">{comment.avatar}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-text-primary">{comment.author}</h4>
                          <span className="text-text-muted text-sm">•</span>
                          <span className="text-text-muted text-sm">{comment.timeAgo}</span>
                        </div>
                        <p className="text-text-secondary text-sm mb-2">{comment.role}</p>
                        <p className="text-text-secondary mb-3">{comment.content}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <button 
                            className="flex items-center gap-1 hover:text-accent"
                            onClick={() => handleCommentVote(comment.id, 'up')}
                          >
                            <ArrowUp className="w-4 h-4" />
                            {comment.upvotes}
                          </button>
                          <button 
                            className="flex items-center gap-1 hover:text-accent"
                            onClick={() => handleCommentVote(comment.id, 'down')}
                          >
                            <ArrowDown className="w-4 h-4" />
                            {comment.downvotes}
                          </button>
                          <button className="text-text-muted hover:text-accent">
                            Reply
                          </button>
                        </div>

                        {/* Replies */}
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="mt-4 pl-6 border-l-2 border-border">
                            <div className="flex gap-3">
                              <div className="w-8 h-8 bg-accent-light rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-accent font-semibold text-xs">{reply.avatar}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium text-text-primary text-sm">{reply.author}</h5>
                                  <span className="text-text-muted text-xs">•</span>
                                  <span className="text-text-muted text-xs">{reply.timeAgo}</span>
                                </div>
                                <p className="text-text-secondary text-sm mb-2">{reply.content}</p>
                                <div className="flex items-center gap-3 text-xs">
                                  <button className="flex items-center gap-1 hover:text-accent">
                                    <ArrowUp className="w-3 h-3" />
                                    {reply.upvotes}
                                  </button>
                                  <button className="flex items-center gap-1 hover:text-accent">
                                    <ArrowDown className="w-3 h-3" />
                                    {reply.downvotes}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="card-elevated">
              <CardContent className="p-6">
                <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" />
                  About the Author
                </h3>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center">
                    <span className="text-accent font-semibold text-lg">{blog.avatar}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">{blog.author}</h4>
                    <p className="text-text-secondary text-sm">{blog.role}</p>
                  </div>
                </div>
                
                <p className="text-text-secondary text-sm mb-4">{blog.bio}</p>
                
                <div className="space-y-2 text-sm text-text-muted">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{blog.college} • Class of {blog.graduation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{blog.location}</span>
                  </div>
                </div>
                
                <Button className="w-full mt-4 btn-accent">
                  Message Author
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}