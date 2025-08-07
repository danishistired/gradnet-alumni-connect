import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, ArrowDown, MessageCircle, Share2, TrendingUp, Users, Mail } from "lucide-react";
import { MessagesDialog } from "@/components/MessagesDialog";

export default function Feed() {
  const [feedType, setFeedType] = useState("alumni");
  const [messagesOpen, setMessagesOpen] = useState(false);
  const navigate = useNavigate();

  const mockAlumniPosts = [
    {
      id: 1,
      author: "Sarah Chen",
      avatar: "SC",
      role: "Senior Software Engineer at Google",
      college: "Stanford University",
      graduation: "2019",
      title: "Building Scalable React Applications with TypeScript",
      preview: "After 5 years at Google, here are the patterns I've learned for creating maintainable React applications at enterprise scale. We'll cover component architecture, state management, and testing strategies...",
      tags: ["React", "TypeScript", "Architecture"],
      upvotes: 342,
      downvotes: 12,
      comments: 28,
      timeAgo: "2 hours ago",
      achievements: ["🏆", "💼", "📚"]
    },
    {
      id: 2,
      author: "Michael Rodriguez",
      avatar: "MR",
      role: "Product Manager at Spotify",
      college: "UC Berkeley",
      graduation: "2018",
      title: "From CS Student to Product Manager: My Journey",
      preview: "Transitioning from engineering to product management wasn't easy, but it was one of the best decisions I made. Here's how I navigated the career change and what I learned along the way...",
      tags: ["Career", "Product Management", "Transition"],
      upvotes: 156,
      downvotes: 3,
      comments: 15,
      timeAgo: "6 hours ago",
      achievements: ["🚀", "💡"]
    },
    {
      id: 3,
      author: "Emily Zhang",
      avatar: "EZ",
      role: "Data Scientist at Netflix",
      college: "MIT",
      graduation: "2020",
      title: "Machine Learning in Production: Lessons from Netflix",
      preview: "Building ML models is one thing, but deploying them at scale is another. Here are the key challenges we face at Netflix and how we solve them with robust MLOps practices...",
      tags: ["Machine Learning", "Data Science", "MLOps"],
      upvotes: 298,
      downvotes: 8,
      comments: 34,
      timeAgo: "1 day ago",
      achievements: ["🤖", "📊", "🏆"]
    }
  ];

  const mockStudentPosts = [
    {
      id: 4,
      author: "Alex Kim",
      avatar: "AK",
      role: "CS Student",
      college: "Carnegie Mellon University",
      graduation: "2025",
      title: "Building My First Full-Stack App with Next.js",
      preview: "As a sophomore, I decided to challenge myself by building a complete web application. Here's what I learned about Next.js, databases, and deployment along the way...",
      tags: ["Next.js", "Full-Stack", "Learning"],
      upvotes: 89,
      downvotes: 2,
      comments: 12,
      timeAgo: "4 hours ago",
      achievements: ["🌟", "💻"]
    },
    {
      id: 5,
      author: "Priya Patel",
      avatar: "PP",
      role: "Engineering Student",
      college: "Georgia Tech",
      graduation: "2024",
      title: "Internship Hunt: What I Wish I Knew Earlier",
      preview: "After applying to 100+ internships and getting rejected many times, I finally landed my dream internship. Here are the lessons I learned and tips for fellow students...",
      tags: ["Internships", "Career", "Tips"],
      upvotes: 234,
      downvotes: 5,
      comments: 18,
      timeAgo: "12 hours ago",
      achievements: ["📈", "🎯"]
    }
  ];

  const currentPosts = feedType === "alumni" ? mockAlumniPosts : mockStudentPosts;

  const trendingTopics = ["React", "Machine Learning", "Career Advice", "Internships", "Startups", "Web Development"];
  const colleges = ["Stanford University", "MIT", "UC Berkeley", "Carnegie Mellon", "Georgia Tech"];

  const handlePostClick = (postId: number) => {
    navigate(`/blog/${postId}`);
  };

  const handleVote = (postId: number, type: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulate voting logic
    console.log(`Voted ${type} on post ${postId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        user={{ type: 'student', verified: true }} 
        onMessagesClick={() => setMessagesOpen(true)}
      />
      
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text-primary mb-4">Your Feed</h1>
              
              {/* Feed Type Tabs */}
              <Tabs value={feedType} onValueChange={setFeedType} className="mb-4">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="alumni">Alumni Blogs</TabsTrigger>
                  <TabsTrigger value="student">Student Blogs</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="ml">Machine Learning</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="career">Career</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="College" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((college) => (
                      <SelectItem key={college} value={college.toLowerCase().replace(/\s+/g, '-')}>
                        {college}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="discussed">Most Discussed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {currentPosts.map((post) => (
                <Card 
                  key={post.id} 
                  className="card-elevated cursor-pointer"
                  onClick={() => handlePostClick(post.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Avatar & Voting */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-accent-light rounded-full flex items-center justify-center">
                          <span className="text-accent font-semibold text-sm">
                            {post.avatar}
                          </span>
                        </div>
                        
                        {/* Voting */}
                        <div className="flex flex-col items-center gap-1">
                          <button 
                            className="p-1 hover:bg-surface-muted rounded"
                            onClick={(e) => handleVote(post.id, 'up', e)}
                          >
                            <ArrowUp className="w-4 h-4 text-text-muted hover:text-accent" />
                          </button>
                          <span className="text-sm font-medium text-text-primary">
                            {post.upvotes - post.downvotes}
                          </span>
                          <button 
                            className="p-1 hover:bg-surface-muted rounded"
                            onClick={(e) => handleVote(post.id, 'down', e)}
                          >
                            <ArrowDown className="w-4 h-4 text-text-muted hover:text-accent" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-text-primary">{post.author}</h3>
                              <span className="text-text-muted">•</span>
                              <span className="text-text-secondary text-sm">{post.timeAgo}</span>
                            </div>
                            <p className="text-text-secondary text-sm">{post.role}</p>
                            <p className="text-text-muted text-sm">
                              {post.college} • Class of {post.graduation}
                            </p>
                          </div>
                          
                          {/* Achievement badges */}
                          <div className="flex gap-1">
                            {post.achievements.map((achievement, idx) => (
                              <span key={idx} className="text-lg">{achievement}</span>
                            ))}
                          </div>
                        </div>

                        <h4 className="font-semibold text-text-primary text-lg mb-2 hover:text-accent">
                          {post.title}
                        </h4>
                        
                        <p className="text-text-secondary mb-4 line-clamp-2">
                          {post.preview}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="bg-accent-light text-accent border-accent/20"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 text-sm text-text-muted">
                          <button 
                            className="flex items-center gap-1 hover:text-accent"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MessageCircle className="w-4 h-4" />
                            {post.comments} comments
                          </button>
                          <button 
                            className="flex items-center gap-1 hover:text-accent"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trending Topics */}
            <Card className="card-elevated">
              <CardContent className="p-4">
                <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  Trending Topics
                </h3>
                <div className="space-y-2">
                  {trendingTopics.map((topic, idx) => (
                    <button 
                      key={topic}
                      className="block w-full text-left p-2 rounded hover:bg-surface-muted text-text-secondary hover:text-accent text-sm"
                    >
                      #{topic}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-elevated">
              <CardContent className="p-4">
                <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    Message Alumni
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm">
                    Find Mentors
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm">
                    Join Study Groups
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <MessagesDialog 
        open={messagesOpen}
        onOpenChange={setMessagesOpen}
      />
    </div>
  );
}