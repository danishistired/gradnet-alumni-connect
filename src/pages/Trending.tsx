import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Heart, MessageCircle, Share2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface TrendingPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  communityId?: string;
  communityName?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  trending_score: number;
}

export const Trending = () => {
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  const fetchTrendingPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/posts/trending`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch trending posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="h-48 bg-muted"></Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-orange-500" />
        <h1 className="text-2xl font-bold">Trending Posts</h1>
        <p className="text-muted-foreground ml-4">Sorted by engagement (likes + comments)</p>
      </div>

      {/* Trending Posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="p-8 text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No trending posts yet</h3>
            <p className="text-muted-foreground">
              Be the first to create engaging content that gets people talking!
            </p>
          </Card>
        ) : (
          posts.map((post, index) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    >
                      #{index + 1}
                    </Badge>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {post.communityName && (
                        <>
                          <Link 
                            to={`/g/${post.communityName}`}
                            className="font-semibold hover:text-accent"
                          >
                            g/{post.communityName}
                          </Link>
                          <span>•</span>
                        </>
                      )}
                      <span>by {post.authorName}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    🔥 {post.trending_score} points
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <Link to={`/blog/${post.id}`} className="block group">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4">
                    {truncateContent(post.content)}
                  </p>
                </Link>

                {/* Post Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {post.likesCount} likes
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {post.commentsCount} comments
                  </div>
                  
                  <Button variant="ghost" size="sm" className="ml-auto">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {posts.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline" onClick={fetchTrendingPosts}>
            Load More Trending Posts
          </Button>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};
