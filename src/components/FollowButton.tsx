import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useFollow } from "@/contexts/FollowContext";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  showIcon?: boolean;
  className?: string;
}

export const FollowButton = ({ 
  userId, 
  variant = "default", 
  size = "sm",
  showIcon = true,
  className = ""
}: FollowButtonProps) => {
  const { user } = useAuth();
  const { followUser, unfollowUser, checkFollowStatus, loading } = useFollow();
  const [isFollowing, setIsFollowing] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  // Don't show follow button for own profile
  if (!user || user.id === userId) {
    return null;
  }

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkFollowStatus(userId);
      setIsFollowing(status);
    };
    
    checkStatus();
  }, [userId, checkFollowStatus]);

  const handleFollow = async () => {
    setButtonLoading(true);
    
    try {
      if (isFollowing) {
        const success = await unfollowUser(userId);
        if (success) {
          setIsFollowing(false);
        }
      } else {
        const success = await followUser(userId);
        if (success) {
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.error('Follow action error:', error);
    } finally {
      setButtonLoading(false);
    }
  };

  const isLoading = loading || buttonLoading;

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={handleFollow}
      disabled={isLoading}
      className={`${className} ${isFollowing ? 'hover:bg-red-50 hover:text-red-600 hover:border-red-200' : ''}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {showIcon && (
            isFollowing ? (
              <UserMinus className="w-4 h-4 mr-1" />
            ) : (
              <UserPlus className="w-4 h-4 mr-1" />
            )
          )}
          {isFollowing ? 'Unfollow' : 'Follow'}
        </>
      )}
    </Button>
  );
};
