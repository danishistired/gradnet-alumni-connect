import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBlog } from "@/contexts/BlogContext";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, MessageCircle, Share2, BookmarkPlus, Search, TrendingUp, Users, GraduationCap, Briefcase, Star, Plus, Trash2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

const Feed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { posts, fetchPosts, likePost, deletePost, loading } = useBlog();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filters = [
    { id: "all", label: "All Posts", icon: Users },
    { id: "students", label: "Students", icon: GraduationCap },
    { id: "alumni", label: "Alumni", icon: Briefcase },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "my-posts", label: "My Posts", icon: Star }
  ];

  const filteredPosts = posts.filter(post => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        `${post.author.firstName} ${post.author.lastName}`.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Category filter
    if (activeFilter === "all") return true;
    if (activeFilter === "students") return post.author.accountType === "student";
    if (activeFilter === "alumni") return post.author.accountType === "alumni";
    if (activeFilter === "trending") return post.likesCount >= 5; // Posts with 5+ likes
    if (activeFilter === "my-posts") return user && post.author.id === user.id;
    
    return true;
  });

  const handleLike = async (postId: string) => {
    await likePost(postId);
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(postId);
    }
  };

  const truncateContent = (content: string, maxLength: number = 300) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffMs = now.getTime() - postTime.getTime();
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return postTime.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-text-primary mb-2">Community Feed</h1>
              <p className="text-text-secondary">Connect, share, and learn from the GradNet community</p>
            </div>
            {user && (
              <Button 
                onClick={() => navigate("/create-post")}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Post
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-text-secondary" />
              <Input
                placeholder="Search posts, people, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {filters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <Button
                    key={filter.id}
                    variant={activeFilter === filter.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(filter.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {filter.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Empty State */}
          {!loading && filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-secondary mb-4">
                {searchQuery || activeFilter !== "all" 
                  ? "No posts found matching your criteria." 
                  : "No posts yet. Be the first to share something!"}
              </p>
              {user && (
                <Button onClick={() => navigate("/create-post")}>
                  Create Your First Post
                </Button>
              )}
            </div>
          )}

          {/* Posts Feed */}
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        {post.author.profilePicture ? (
                          <AvatarImage src={post.author.profilePicture} />
                        ) : null}
                        <AvatarFallback className="bg-accent text-accent-foreground">
                          {post.author.firstName.charAt(0)}{post.author.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-text-primary">
                            {post.author.firstName} {post.author.lastName}
                          </h3>
                          <Badge variant={post.author.accountType === "alumni" ? "default" : "secondary"}>
                            {post.author.accountType === "alumni" ? "Alumni" : "Student"}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-secondary">
                          {post.author.accountType === "alumni" 
                            ? `Alumni • ${post.author.university}`
                            : `Student • ${post.author.university}`
                          }
                        </p>
                        <p className="text-xs text-text-secondary">{formatTimeAgo(post.createdAt)}</p>
                      </div>
                    </div>
                    
                    {/* Post Actions for Author */}
                    {user && post.author.id === user.id && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                          className="text-text-secondary hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Post Title */}
                  <h2 className="text-xl font-semibold text-text-primary mb-3">{post.title}</h2>
                  
                  {/* Post Content */}
                  <div className="prose prose-sm max-w-none text-text-primary mb-4">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        // Customize markdown rendering
                        h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                        h2: ({children}) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                        h3: ({children}) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                        p: ({children}) => <p className="mb-2 leading-relaxed">{children}</p>,
                        code: ({children, className}) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="bg-surface-muted px-1 py-0.5 rounded text-sm">{children}</code>
                          ) : (
                            <code className={className}>{children}</code>
                          );
                        },
                        pre: ({children}) => (
                          <pre className="bg-surface-muted p-3 rounded-lg text-sm overflow-x-auto">{children}</pre>
                        ),
                        a: ({children, href}) => (
                          <a href={href} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
                        ),
                        ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                      }}
                    >
                      {truncateContent(post.content)}
                    </ReactMarkdown>
                  </div>
                  
                  {/* Category Badge */}
                  <Badge variant="outline" className="mb-4">
                    {post.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                  
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Engagement Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-6">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`flex items-center gap-2 text-text-secondary hover:text-red-500 ${
                          user && post.isLiked ? 'text-red-500' : ''
                        }`}
                        onClick={() => user && handleLike(post.id)}
                        disabled={!user}
                      >
                        <Heart className={`h-4 w-4 ${user && post.isLiked ? 'fill-current' : ''}`} />
                        <span>{post.likesCount}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2 text-text-secondary hover:text-blue-500">
                        <MessageCircle className="h-4 w-4" />
                        <span>0</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2 text-text-secondary hover:text-green-500">
                        <Share2 className="h-4 w-4" />
                        <span>0</span>
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-text-secondary hover:text-accent">
                      <BookmarkPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          {filteredPosts.length > 0 && (
            <div className="text-center">
              <Button variant="outline" className="w-full sm:w-auto">
                Load More Posts
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
