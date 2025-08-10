import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, MessageCircle, Plus, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useCommunity } from '@/contexts/CommunityContext';

interface Community {
  id: string;
  name: string;
  displayName: string;
  description: string;
  memberCount: number;
  postCount: number;
  icon: string;
  createdAt: string;
}

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export const CommunityPage = () => {
  const { communityName } = useParams<{ communityName: string }>();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  
  const { joinCommunity, leaveCommunity, joinedCommunities } = useCommunity();

  useEffect(() => {
    if (communityName) {
      fetchCommunity();
      fetchCommunityPosts();
    }
  }, [communityName]);

  useEffect(() => {
    if (community) {
      setIsJoined(joinedCommunities.includes(community.id));
    }
  }, [community, joinedCommunities]);

  const fetchCommunity = async () => {
    try {
      const response = await fetch(`/api/communities/${communityName}`);
      const data = await response.json();
      
      if (data.success) {
        setCommunity(data.community);
      }
    } catch (error) {
      console.error('Failed to fetch community:', error);
    }
  };

  const fetchCommunityPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/communities/${communityName}/posts`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch community posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinToggle = async () => {
    if (!community) return;

    const success = isJoined 
      ? await leaveCommunity(community.id)
      : await joinCommunity(community.id);

    if (success) {
      setIsJoined(!isJoined);
      // Update local community data
      setCommunity(prev => prev ? {
        ...prev,
        memberCount: isJoined ? prev.memberCount - 1 : prev.memberCount + 1
      } : null);
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (!community) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Community not found</h2>
          <p className="text-muted-foreground">
            The community "g/{communityName}" doesn't exist or has been removed.
          </p>
          <Link to="/communities" className="inline-block mt-4">
            <Button>Browse Communities</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Community Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {community.icon}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">g/{community.name}</h1>
                    <p className="text-lg text-muted-foreground">{community.displayName}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleJoinToggle}
                    variant={isJoined ? "outline" : "default"}
                  >
                    {isJoined ? "Leave" : "Join"}
                  </Button>
                  
                  <Link to={`/create-post?community=${community.id}`}>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Post
                    </Button>
                  </Link>
                </div>
              </div>
              
              <p className="text-muted-foreground mt-4">{community.description}</p>
            </CardHeader>
          </Card>

          {/* Posts */}
          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="h-32 bg-muted"></Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to start a discussion in this community!
                </p>
                <Link to={`/create-post?community=${community.id}`}>
                  <Button>Create First Post</Button>
                </Link>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <span>Posted by {post.authorName}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                    </div>
                    
                    <Link to={`/post/${post.id}`} className="block group">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4">
                        {truncateContent(post.content)}
                      </p>
                    </Link>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{post.likesCount} likes</span>
                      <span>{post.commentsCount} comments</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Community Info */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">About Community</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Members</span>
                </div>
                <Badge variant="secondary">{community.memberCount}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Posts</span>
                </div>
                <Badge variant="secondary">{community.postCount}</Badge>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Created {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}</span>
              </div>
            </CardContent>
          </Card>

          {/* Community Rules */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Community Rules</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>1. Be respectful and professional</p>
                <p>2. Keep posts relevant to the community</p>
                <p>3. No spam or self-promotion</p>
                <p>4. Use descriptive titles</p>
                <p>5. Follow GradNet community guidelines</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
