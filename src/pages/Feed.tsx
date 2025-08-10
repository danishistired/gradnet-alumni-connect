import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/FollowButton";
import { useBlog } from "@/contexts/BlogContext";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, MessageCircle, Share2, BookmarkPlus, TrendingUp, Users, GraduationCap, Briefcase, Star, Trash2 } from "lucide-react";

const Feed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { posts, fetchPosts, likePost, deletePost, loading, totalPages, currentPage } = useBlog();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Get search query from URL params (set by navbar)
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    fetchPosts();
  }, []); // Remove fetchPosts from dependencies since it's now memoized

  const handleLoadMore = async () => {
    console.log('Load More clicked. Current page:', currentPage, 'Total pages:', totalPages, 'Loading:', loading);
    if (currentPage < totalPages && !loading) {
      console.log('Fetching next page:', currentPage + 1);
      try {
        await fetchPosts(currentPage + 1);
        console.log('Fetch completed');
      } catch (error) {
        console.error('Load more error:', error);
      }
    } else {
      console.log('Cannot load more - currentPage:', currentPage, 'totalPages:', totalPages, 'loading:', loading);
    }
  };

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
          
          {/* Filters */}
          <div className="flex gap-2 flex-wrap justify-center">
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

          {/* Empty State */}
          {!loading && filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-secondary mb-4">
                {searchQuery || activeFilter !== "all" 
                  ? "No posts found matching your criteria." 
                  : "No posts yet. Be the first to share something!"}
              </p>
            </div>
          )}

          {/* Posts Feed */}
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <Card 
                key={post.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/blog/${post.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    
                    {/* Vote/Like Section */}
                    <div className="flex flex-col items-center gap-1 min-w-[50px]">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`p-1 hover:bg-surface-muted ${
                          user && post.isLiked ? 'text-red-500' : 'text-text-secondary'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          user && handleLike(post.id);
                        }}
                        disabled={!user}
                      >
                        <Heart className={`h-5 w-5 ${user && post.isLiked ? 'fill-current' : ''}`} />
                      </Button>
                      <span className="text-sm font-medium text-text-primary">
                        {post.likesCount}
                      </span>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <Avatar className="h-6 w-6">
                            {post.author.profilePicture ? (
                              <AvatarImage src={post.author.profilePicture} />
                            ) : null}
                            <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                              {post.author.firstName.charAt(0)}{post.author.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span 
                            className="font-medium cursor-pointer hover:text-accent transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/user/${post.author.id}`);
                            }}
                          >
                            {post.author.firstName} {post.author.lastName}
                          </span>
                          <Badge 
                            variant={post.author.accountType === "alumni" ? "default" : "secondary"}
                            className="text-xs px-2 py-0"
                          >
                            {post.author.accountType === "alumni" ? "Alumni" : "Student"}
                          </Badge>
                          <span>•</span>
                          <span>{formatTimeAgo(post.createdAt)}</span>
                          <span>•</span>
                          <span className="text-xs">
                            {post.author.university}
                          </span>
                          {/* Follow Button */}
                          <div onClick={(e) => e.stopPropagation()}>
                            <FollowButton 
                              userId={post.author.id} 
                              variant="outline" 
                              size="sm"
                              showIcon={false}
                              className="ml-2 h-6 px-2 text-xs"
                            />
                          </div>
                        </div>
                        
                        {/* Post Actions for Author */}
                        {user && post.author.id === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 text-text-secondary hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(post.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* Post Title */}
                      <h2 className="text-lg font-semibold text-text-primary mb-2 hover:text-accent">
                        {post.title}
                      </h2>
                      
                      {/* Category and Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {post.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* Engagement Actions */}
                      <div className="flex items-center gap-4 text-sm text-text-secondary">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.commentsCount} comments</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookmarkPlus className="h-4 w-4" />
                          <span>Save</span>
                        </div>
                        <div className="flex items-center gap-1 ml-auto">
                          <span className="text-xs">
                            {post.viewsCount} views
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          {filteredPosts.length > 0 && currentPage < totalPages && (
            <div className="text-center">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More Posts"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
