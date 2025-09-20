// Hook for integrating content moderation into content creation
import { useState, useCallback } from 'react';
import { moderateAndAlert, type UserWarning } from '@/utils/contentModeration';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useContentModeration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isModeratingContent, setIsModeratingContent] = useState(false);

  const moderateContent = useCallback(
    async (
      content: string, 
      contentType: 'post' | 'comment', 
      contentId?: string
    ): Promise<{ allowed: boolean; warning?: UserWarning }> => {
      if (!user) {
        return { allowed: true };
      }

      setIsModeratingContent(true);
      
      try {
        // Generate content ID if not provided
        const finalContentId = contentId || `${contentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const result = moderateAndAlert(
          content,
          user.id,
          `${user.firstName} ${user.lastName}`.trim() || 'Unknown User',
          contentType,
          finalContentId
        );

        if (result.shouldBlock) {
          // Show blocking message to user
          toast({
            title: "Content Blocked",
            description: "Your content contains inappropriate language and cannot be published. Please review and edit your content.",
            variant: "destructive",
          });

          return { allowed: false, warning: result.warning };
        } else if (result.warning) {
          // Show warning message to user
          toast({
            title: "Content Warning",
            description: "Your content has been flagged for review. Please keep discussions respectful and constructive.",
            variant: "default",
          });

          return { allowed: true, warning: result.warning };
        }

        return { allowed: true };
      } catch (error) {
        console.error('Content moderation error:', error);
        // Allow content if moderation system fails
        return { allowed: true };
      } finally {
        setIsModeratingContent(false);
      }
    },
    [user, toast]
  );

  return {
    moderateContent,
    isModeratingContent,
  };
};

export default useContentModeration;