import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { CommentComponent } from "@/components/CommentComponent";
import { useBlog } from "@/contexts/BlogContext";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Heart, MessageCircle, Share2, BookmarkPlus, Eye, Trash2, Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { posts, likePost, deletePost, loading, fetchComments, addComment, deleteComment, likeComment } = useBlog();
  const [newComment, setNewComment] = useState("");
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [summary, setSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  useEffect(() => {
    // Find the post from the posts array
    const foundPost = posts.find(p => p.id === id);
    setPost(foundPost);
    
    // Load comments when post is found
    if (foundPost) {
      loadComments();
    }
  }, [id, posts]);

  const loadComments = async () => {
    if (!id) return;
    
    setLoadingComments(true);
    try {
      const commentsData = await fetchComments(id);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSummarize = async () => {
    setSummarizing(true);
    setSummaryError("");
    setSummary("");
    
    try {
      // Call local Ollama API
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.2:3b",
          prompt: `Summarize the following blog post in no more than 5 bullet points.

- Use actual markdown bullet points starting with "-" and a space.
- Each bullet should be on its own line.
- Keep only the main arguments, conclusions, and actionable insights.
- Avoid rephrasing — distill ideas to their essence. 

Title: ${post.title}

Content: ${post.content}

Please provide a clear, concise summary that captures the main ideas and value for the academic community.`,
          stream: false
        })
      });
      
      if (!response.ok) throw new Error("Ollama API error");
      const data = await response.json();
      setSummary(data.response || "No summary generated.");
    } catch (err) {
      setSummaryError("Failed to generate summary. Please make sure Ollama is running with the llama3.2:3b model.");
    } finally {
      setSummarizing(false);
    }
  };

  const handleLike = async () => {
    if (post && user) {
      await likePost(post.id);
      // Update local post state
      const updatedPost = posts.find(p => p.id === id);
      setPost(updatedPost);
    }
  };

  const handleDelete = async () => {
    if (post && window.confirm("Are you sure you want to delete this post?")) {
      const result = await deletePost(post.id);
      if (result.success) {
        navigate("/feed");
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !post) return;

    setSubmittingComment(true);
    try {
      const result = await addComment(post.id, newComment.trim());
      if (result.success) {
        setNewComment("");
        // Reload comments to show the new one
        await loadComments();
        // Update post state to reflect new comment count
        const updatedPost = posts.find(p => p.id === id);
        setPost(updatedPost);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!post) return;

    try {
      const result = await addComment(post.id, content, parentId);
      if (result.success) {
        // Reload comments to show the new reply
        await loadComments();
        // Update post state to reflect new comment count
        const updatedPost = posts.find(p => p.id === id);
        setPost(updatedPost);
      }
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const result = await deleteComment(commentId);
      if (result.success) {
        // Reload comments to reflect the deletion
        await loadComments();
        // Update post state to reflect new comment count
        const updatedPost = posts.find(p => p.id === id);
        setPost(updatedPost);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const result = await likeComment(commentId);
      return result;
    } catch (error) {
      console.error('Failed to like comment:', error);
      return { success: false, isLiked: false, likesCount: 0 };
    }
  };

  const formatTimeAgo = (timestamp) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center py-12">
            <p className="text-text-secondary">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center py-12">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Post Not Found</h1>
            <p className="text-text-secondary mb-6">The post you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/feed")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Feed
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate("/feed")}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Feed
          </Button>

          {/* Main Post */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    {post.author.profilePicture ? (
                      <AvatarImage src={post.author.profilePicture} />
                    ) : null}
                    <AvatarFallback className="bg-accent text-accent-foreground text-lg">
                      {post.author.firstName.charAt(0)}{post.author.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {post.author.firstName} {post.author.lastName}
                      </h3>
                      <Badge variant={post.author.accountType === "alumni" ? "default" : "secondary"}>
                        {post.author.accountType === "alumni" ? "Alumni" : "Student"}
                      </Badge>
                    </div>
                    <p className="text-text-secondary">
                      {post.author.university}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Posted {formatTimeAgo(post.createdAt)}
                    </p>
                  </div>
                </div>
                
                {/* Post Actions for Author */}
                {user && post.author.id === user.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="text-text-secondary hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Post Title */}
              <h1 className="text-3xl font-bold text-text-primary mb-4">{post.title}</h1>
              
              {/* Post Image */}
              {post.image && (
                <div className="mb-6">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full max-h-96 object-cover rounded-lg border border-border"
                    onError={(e) => {
                      // Hide image if it fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Category and Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">
                  {post.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Post Content */}
              <div className="prose prose-lg max-w-none text-text-primary mb-6">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    h1: ({children}) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>,
                    p: ({children}) => <p className="mb-4 leading-relaxed">{children}</p>,
                    code: ({children, className}) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-surface-muted px-2 py-1 rounded text-sm font-mono">{children}</code>
                      ) : (
                        <code className={className}>{children}</code>
                      );
                    },
                    pre: ({children}) => (
                      <pre className="bg-surface-muted p-4 rounded-lg text-sm overflow-x-auto my-4 font-mono">{children}</pre>
                    ),
                    a: ({children, href}) => (
                      <a href={href} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
                    ),
                    ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-accent pl-4 italic my-4 text-text-secondary">{children}</blockquote>
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* AI Summarize Button */}
              <div className="flex justify-start mb-6">
                <Button
                  onClick={handleSummarize}
                  disabled={summarizing}
                  className="relative overflow-hidden text-white font-medium py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                    backgroundSize: '300% 300%',
                    animation: 'rainbow 4s ease infinite'
                  }}
                  size="default"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {summarizing ? "Summarizing..." : "Summarize"}
                </Button>
              </div>

              {/* AI Summary Display */}
              {summary && (
                <div 
                  className="mb-6 p-6 rounded-lg border-2 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 25%, rgba(240, 147, 251, 0.1) 50%, rgba(245, 87, 108, 0.1) 75%, rgba(79, 172, 254, 0.1) 100%)',
                    borderImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%) 1'
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <h3 
                      className="font-bold text-lg"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      AI Summary
                    </h3>
                  </div>
                  <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
                        li: ({children}) => <li className="mb-1 leading-relaxed">{children}</li>,
                        p: ({children}) => <p className="mb-2 leading-relaxed">{children}</p>,
                      }}
                    >
                      {summary}
                    </ReactMarkdown>
                  </div>
                  <div className="text-xs text-gray-500 mt-3 text-right">
                    Generated by AI • Powered by Ollama
                  </div>
                </div>
              )}

              {summaryError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-red-600 font-medium">Failed to generate summary</div>
                  <div className="text-red-500 text-sm mt-1">{summaryError}</div>
                </div>
              )}

              {/* Engagement Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <div className="flex items-center gap-6">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`flex items-center gap-2 text-text-secondary hover:text-red-500 ${
                      user && post.isLiked ? 'text-red-500' : ''
                    }`}
                    onClick={handleLike}
                    disabled={!user}
                  >
                    <Heart className={`h-5 w-5 ${user && post.isLiked ? 'fill-current' : ''}`} />
                    <span>{post.likesCount} likes</span>
                  </Button>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.commentsCount} comments</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Eye className="h-5 w-5" />
                    <span>{post.viewsCount} views</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-text-secondary hover:text-accent">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm" className="text-text-secondary hover:text-accent">
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold text-text-primary">
                Comments ({post.commentsCount})
              </h3>
            </CardHeader>
            <CardContent>
              {/* Add Comment Form */}
              {user && (
                <div className="mb-6">
                  {user.accountType === 'alumni' && !user.isApproved ? (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <div className="text-red-600">
                        <h4 className="font-medium mb-1">Account Pending Approval</h4>
                        <p className="text-sm">
                          You cannot post comments until your alumni account is approved by the admin team.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        {user.profilePicture ? (
                          <AvatarImage src={user.profilePicture} />
                        ) : null}
                        <AvatarFallback className="bg-accent text-accent-foreground">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Write a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="mb-3"
                          rows={3}
                        />
                        <div className="flex justify-end">
                          <Button 
                            size="sm" 
                            disabled={!newComment.trim() || submittingComment}
                            onClick={handleAddComment}
                          >
                            {submittingComment ? 'Posting...' : 'Post Comment'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {loadingComments ? (
                  <div className="text-center py-8">
                    <p className="text-text-secondary">Loading comments...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                    <p className="text-text-secondary">No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  <div>
                    {comments.map((comment) => (
                      <CommentComponent
                        key={comment.id}
                        comment={comment}
                        currentUserId={user?.id}
                        currentUser={user ? {
                          id: user.id,
                          accountType: user.accountType,
                          isApproved: user.isApproved
                        } : undefined}
                        onReply={handleReply}
                        onDelete={handleDeleteComment}
                        onLike={handleLikeComment}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
