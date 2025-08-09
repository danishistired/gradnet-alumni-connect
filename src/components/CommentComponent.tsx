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
  replies: Comment[];
}

interface CommentProps {
  comment: Comment;
  currentUserId?: string;
  onReply: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  depth?: number;
}

export const CommentComponent: React.FC<CommentProps> = ({ 
  comment, 
  currentUserId, 
  onReply, 
  onDelete, 
  depth = 0 
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const maxDepth = 5; // Maximum nesting depth for replies
  const canReply = depth < maxDepth;

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyContent.trim());
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
      await onDelete(comment.id);
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
            {comment.author.profilePicture ? (
              <AvatarImage src={comment.author.profilePicture} />
            ) : null}
            <AvatarFallback className="bg-accent text-accent-foreground text-xs">
              {comment.author.firstName.charAt(0)}{comment.author.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-primary text-sm">
                {comment.author.firstName} {comment.author.lastName}
              </span>
              <Badge 
                variant={comment.author.accountType === "alumni" ? "default" : "secondary"}
                className="text-xs"
              >
                {comment.author.accountType === "alumni" ? "Alumni" : "Student"}
              </Badge>
              <span className="text-xs text-text-secondary">
                {comment.timeAgo}
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              {comment.author.university}
            </p>
          </div>
        </div>
        
        {/* Delete button for comment author */}
        {currentUserId && comment.author.id === currentUserId && (
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
          {comment.content}
        </p>
      </div>

      {/* Comment Actions */}
      <div className="flex items-center gap-4 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-text-secondary hover:text-red-500 h-6 px-2 text-xs"
        >
          <Heart className="h-3 w-3 mr-1" />
          {comment.likesCount > 0 && comment.likesCount}
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

        {comment.replies.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleReplies}
            className="text-text-secondary hover:text-accent h-6 px-2 text-xs"
          >
            {showReplies ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Hide {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
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
                placeholder={`Reply to ${comment.author.firstName}...`}
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
      {showReplies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentComponent
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
