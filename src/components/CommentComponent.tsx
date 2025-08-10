import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface Author {
  id: string;
  firstName: string;
  lastName: string;
  accountType: 'student' | 'alumni';
  university: string;
  profilePicture?: string;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  author: Author;
  timeAgo: string;
  isLiked: boolean;
  replies: Comment[];
}

interface CommentProps {
  comment: Comment;
  currentUserId?: string;
  onReply: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onLike: (commentId: string) => Promise<{ success: boolean; isLiked: boolean; likesCount: number }>;
  depth?: number;
}

export const CommentComponent: React.FC<CommentProps> = ({ 
  comment, 
  currentUserId, 
  onReply, 
  onDelete, 
  onLike,
  depth = 0 
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [localComment, setLocalComment] = useState(comment);

  const maxDepth = 5; // Maximum nesting depth for replies
  const canReply = depth < maxDepth;

  // Update local comment when parent comment changes
  React.useEffect(() => {
    setLocalComment(comment);
  }, [comment]);

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onReply(localComment.id, replyContent.trim());
      setReplyContent("");
      setIsReplying(false);
    } catch (error) {
      console.error('Failed to post reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await onDelete(localComment.id);
    }
  };

  const handleLike = async () => {
    if (!currentUserId) return;

    try {
      const result = await onLike(localComment.id);
      if (result.success) {
        setLocalComment(prev => ({
          ...prev,
          isLiked: result.isLiked,
          likesCount: result.likesCount
        }));
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'} border-l-2 border-border pl-4`}>
      {/* Comment Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {localComment.author.profilePicture ? (
              <AvatarImage src={localComment.author.profilePicture} />
            ) : null}
            <AvatarFallback className="bg-accent text-accent-foreground text-xs">
              {localComment.author.firstName.charAt(0)}{localComment.author.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-primary text-sm">
                {localComment.author.firstName} {localComment.author.lastName}
              </span>
              <Badge 
                variant={localComment.author.accountType === "alumni" ? "default" : "secondary"}
                className="text-xs"
              >
                {localComment.author.accountType === "alumni" ? "Alumni" : "Student"}
              </Badge>
              <span className="text-xs text-text-secondary">
                {localComment.timeAgo}
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              {localComment.author.university}
            </p>
          </div>
        </div>
        
        {/* Delete button for comment author */}
        {currentUserId && localComment.author.id === currentUserId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-text-secondary hover:text-red-500 h-6 w-6 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Comment Content */}
      <div className="mb-3">
        <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
          {localComment.content}
        </p>
      </div>

      {/* Comment Actions */}
      <div className="flex items-center gap-4 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLike}
          disabled={!currentUserId}
          className={`text-text-secondary hover:text-red-500 h-6 px-2 text-xs ${
            localComment.isLiked ? 'text-red-500' : ''
          }`}
        >
          <Heart className={`h-3 w-3 mr-1 ${localComment.isLiked ? 'fill-current' : ''}`} />
          {localComment.likesCount > 0 && localComment.likesCount}
        </Button>
        
        {canReply && currentUserId && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsReplying(!isReplying)}
            className="text-text-secondary hover:text-accent h-6 px-2 text-xs"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Reply
          </Button>
        )}

        {localComment.replies.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleReplies}
            className="text-text-secondary hover:text-accent h-6 px-2 text-xs"
          >
            {showReplies ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Hide {localComment.replies.length} {localComment.replies.length === 1 ? 'reply' : 'replies'}
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show {localComment.replies.length} {localComment.replies.length === 1 ? 'reply' : 'replies'}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Reply Form */}
      {isReplying && (
        <div className="mb-4 bg-surface-muted p-3 rounded-lg">
          <div className="flex gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                {currentUserId ? 'U' : '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder={`Reply to ${localComment.author.firstName}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="mb-2 text-sm"
                rows={2}
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleReply}
                  disabled={!replyContent.trim() || isSubmitting}
                  className="text-xs"
                >
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent("");
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      {showReplies && localComment.replies.length > 0 && (
        <div className="space-y-2">
          {localComment.replies.map((reply) => (
            <CommentComponent
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
              onLike={onLike}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
