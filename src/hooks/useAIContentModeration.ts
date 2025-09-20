// Enhanced content moderation hook using AI
import { useState, useCallback } from 'react';
import { moderateContentWithAI, type AIModerationResult } from '@/utils/aiContentModeration';
import { moderateAndAlert } from '@/utils/contentModeration';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ModerationState {
  isAnalyzing: boolean;
  result: AIModerationResult | null;
  showWarningDialog: boolean;
  canProceed: boolean;
}

export const useAIContentModeration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [moderationState, setModerationState] = useState<ModerationState>({
    isAnalyzing: false,
    result: null,
    showWarningDialog: false,
    canProceed: false
  });

  const analyzeContent = useCallback(
    async (content: string): Promise<AIModerationResult> => {
      setModerationState(prev => ({ ...prev, isAnalyzing: true }));
      
      try {
        const result = await moderateContentWithAI(content);
        setModerationState(prev => ({
          ...prev,
          isAnalyzing: false,
          result,
          showWarningDialog: result.suggestedAction === 'warn',
          canProceed: result.suggestedAction === 'allow'
        }));

        return result;
      } catch (error) {
        console.error('Content analysis failed:', error);
        setModerationState(prev => ({
          ...prev,
          isAnalyzing: false,
          result: null,
          showWarningDialog: false,
          canProceed: true // Allow if analysis fails
        }));
        throw error;
      }
    },
    []
  );

  const proceedWithWarning = useCallback(() => {
    setModerationState(prev => ({
      ...prev,
      showWarningDialog: false,
      canProceed: true
    }));
  }, []);

  const blockContent = useCallback(() => {
    setModerationState(prev => ({
      ...prev,
      showWarningDialog: false,
      canProceed: false
    }));
  }, []);

  const publishContent = useCallback(
    async (
      content: string,
      contentType: 'post' | 'comment',
      contentId?: string
    ): Promise<{ success: boolean; blocked: boolean; warning?: string }> => {
      if (!user) {
        return { success: false, blocked: false, warning: 'User not authenticated' };
      }

      const result = moderationState.result;
      
      if (!result) {
        return { success: false, blocked: false, warning: 'Content not analyzed' };
      }

      // Block high-risk content
      if (result.suggestedAction === 'block') {
        // Trigger existing alert system
        moderateAndAlert(
          content,
          user.id,
          `${user.firstName} ${user.lastName}`.trim() || 'Unknown User',
          contentType,
          contentId || `${contentType}_${Date.now()}`
        );

        toast({
          title: "Content Blocked",
          description: `Your ${contentType} contains inappropriate content and cannot be published. ${result.explanation}`,
          variant: "destructive",
        });

        return { 
          success: false, 
          blocked: true, 
          warning: result.explanation 
        };
      }

      // Issue warning for medium-risk content but allow publishing
      if (result.suggestedAction === 'warn') {
        // Create a warning alert for admin review
        moderateAndAlert(
          content,
          user.id,
          `${user.firstName} ${user.lastName}`.trim() || 'Unknown User',
          contentType,
          contentId || `${contentType}_${Date.now()}`
        );

        toast({
          title: "Content Published with Warning",
          description: "Your content has been flagged for review but published successfully.",
          variant: "default",
        });
      }

      return { success: true, blocked: false };
    },
    [user, moderationState.result, toast]
  );

  const resetModeration = useCallback(() => {
    setModerationState({
      isAnalyzing: false,
      result: null,
      showWarningDialog: false,
      canProceed: false
    });
  }, []);

  return {
    moderationState,
    analyzeContent,
    proceedWithWarning,
    blockContent,
    publishContent,
    resetModeration
  };
};

export default useAIContentModeration;