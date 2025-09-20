// Content Moderation System
// Detects inappropriate content and manages user warnings

const inappropriateWords = [
  // Hate speech and discrimination
  'hate', 'racist', 'bigot', 'nazi', 'terrorism', 'terrorist',
  
  // Profanity (mild examples for demo)
  'damn', 'hell', 'stupid', 'idiot', 'moron',
  
  // Violence and threats
  'kill', 'murder', 'violence', 'threat', 'harm', 'hurt',
  
  // Harassment
  'harass', 'bully', 'stalk', 'abuse', 'attack',
  
  // Inappropriate content
  'spam', 'scam', 'fraud', 'fake', 'lie', 'lies',
  
  // Add more words as needed
];

const severeWords = [
  'terrorist', 'nazi', 'kill', 'murder', 'threat', 'harm'
];

export interface ModerationResult {
  isInappropriate: boolean;
  detectedWords: string[];
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface ModerationAlert {
  id: string;
  userId: string;
  userName: string;
  contentType: 'post' | 'comment';
  contentId: string;
  flaggedContent: string;
  detectedWords: string[];
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

export interface UserWarning {
  id: string;
  userId: string;
  warningType: 'inappropriate_content' | 'hate_speech' | 'spam';
  message: string;
  severity: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
  expiresAt: string;
}

class ContentModerationSystem {
  private alerts: ModerationAlert[] = [];
  private warnings: UserWarning[] = [];
  private userWarningCounts: Record<string, number> = {};

  // Load existing data from localStorage
  constructor() {
    this.loadData();
  }

  private loadData() {
    const savedAlerts = localStorage.getItem('moderationAlerts');
    const savedWarnings = localStorage.getItem('userWarnings');
    const savedCounts = localStorage.getItem('userWarningCounts');

    if (savedAlerts) {
      this.alerts = JSON.parse(savedAlerts);
    }
    if (savedWarnings) {
      this.warnings = JSON.parse(savedWarnings);
    }
    if (savedCounts) {
      this.userWarningCounts = JSON.parse(savedCounts);
    }
  }

  private saveData() {
    localStorage.setItem('moderationAlerts', JSON.stringify(this.alerts));
    localStorage.setItem('userWarnings', JSON.stringify(this.warnings));
    localStorage.setItem('userWarningCounts', JSON.stringify(this.userWarningCounts));
  }

  // Check if content contains inappropriate words
  moderateContent(content: string): ModerationResult {
    const lowercaseContent = content.toLowerCase();
    const detectedWords: string[] = [];
    
    // Check for inappropriate words
    inappropriateWords.forEach(word => {
      if (lowercaseContent.includes(word.toLowerCase())) {
        detectedWords.push(word);
      }
    });

    if (detectedWords.length === 0) {
      return {
        isInappropriate: false,
        detectedWords: [],
        severity: 'low',
        confidence: 0
      };
    }

    // Determine severity
    const hasSevereWords = detectedWords.some(word => 
      severeWords.includes(word.toLowerCase())
    );
    
    let severity: 'low' | 'medium' | 'high' = 'low';
    if (hasSevereWords) {
      severity = 'high';
    } else if (detectedWords.length >= 3) {
      severity = 'medium';
    }

    return {
      isInappropriate: true,
      detectedWords,
      severity,
      confidence: Math.min(detectedWords.length * 0.3, 1.0)
    };
  }

  // Create moderation alert for admin review
  createAlert(
    userId: string,
    userName: string,
    contentType: 'post' | 'comment',
    contentId: string,
    content: string,
    moderationResult: ModerationResult
  ): ModerationAlert {
    const alert: ModerationAlert = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId,
      userName,
      contentType,
      contentId,
      flaggedContent: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
      detectedWords: moderationResult.detectedWords,
      severity: moderationResult.severity,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.alerts.unshift(alert); // Add to beginning of array
    this.saveData();
    return alert;
  }

  // Issue warning to user
  issueWarning(userId: string, moderationResult: ModerationResult): UserWarning {
    const warningCount = (this.userWarningCounts[userId] || 0) + 1;
    this.userWarningCounts[userId] = warningCount;

    let warningType: 'inappropriate_content' | 'hate_speech' | 'spam' = 'inappropriate_content';
    if (moderationResult.detectedWords.some(word => severeWords.includes(word))) {
      warningType = 'hate_speech';
    }

    let message = '';
    if (warningCount === 1) {
      message = `Warning: Your content contained inappropriate language. Please keep discussions respectful and constructive. Detected words: ${moderationResult.detectedWords.join(', ')}`;
    } else if (warningCount === 2) {
      message = `Second Warning: Continued use of inappropriate language may result in account restrictions. Please review our community guidelines.`;
    } else {
      message = `Final Warning: Multiple violations detected. Further inappropriate content may result in account suspension.`;
    }

    const warning: UserWarning = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId,
      warningType,
      message,
      severity: warningCount >= 3 ? 'high' : warningCount === 2 ? 'medium' : 'low',
      isRead: false,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

    this.warnings.unshift(warning);
    this.saveData();
    
    return warning;
  }

  // Get all pending alerts for admin
  getPendingAlerts(): ModerationAlert[] {
    return this.alerts.filter(alert => alert.status === 'pending');
  }

  // Get all alerts (for admin dashboard)
  getAllAlerts(): ModerationAlert[] {
    return this.alerts;
  }

  // Get user warnings
  getUserWarnings(userId: string): UserWarning[] {
    const now = new Date().toISOString();
    const userWarnings = this.warnings.filter(warning => 
      warning.userId === userId && warning.expiresAt > now
    );
    
    return userWarnings;
  }

  // Get unread warnings for user
  getUnreadWarnings(userId: string): UserWarning[] {
    return this.getUserWarnings(userId).filter(warning => !warning.isRead);
  }

  // Mark warning as read
  markWarningAsRead(warningId: string): boolean {
    const warning = this.warnings.find(w => w.id === warningId);
    if (warning) {
      warning.isRead = true;
      this.saveData();
      return true;
    }
    return false;
  }

  // Update alert status (admin action)
  updateAlertStatus(alertId: string, status: 'reviewed' | 'dismissed'): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = status;
      alert.updatedAt = new Date().toISOString();
      this.saveData();
      return true;
    }
    return false;
  }

  // Get moderation stats for admin dashboard
  getModerationStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayAlerts = this.alerts.filter(alert => 
      new Date(alert.createdAt) >= today
    );

    return {
      totalAlerts: this.alerts.length,
      pendingAlerts: this.alerts.filter(a => a.status === 'pending').length,
      todayAlerts: todayAlerts.length,
      highSeverityAlerts: this.alerts.filter(a => a.severity === 'high' && a.status === 'pending').length,
      totalWarningsIssued: this.warnings.length,
      activeWarnings: this.warnings.filter(w => new Date(w.expiresAt) > now).length
    };
  }

  // Clean up expired warnings
  cleanupExpiredWarnings() {
    const now = new Date().toISOString();
    this.warnings = this.warnings.filter(warning => warning.expiresAt > now);
    this.saveData();
  }
}

// Create singleton instance
export const contentModerationSystem = new ContentModerationSystem();

// Main moderation function to be called when content is created
export const moderateAndAlert = (
  content: string,
  userId: string,
  userName: string,
  contentType: 'post' | 'comment',
  contentId: string
): { shouldBlock: boolean; warning?: UserWarning } => {
  const moderationResult = contentModerationSystem.moderateContent(content);
  
  if (moderationResult.isInappropriate) {
    // Create alert for admin
    contentModerationSystem.createAlert(
      userId,
      userName,
      contentType,
      contentId,
      content,
      moderationResult
    );

    // Issue warning to user
    const warning = contentModerationSystem.issueWarning(userId, moderationResult);

    // Determine if content should be blocked
    const shouldBlock = moderationResult.severity === 'high';

    return { shouldBlock, warning };
  }

  return { shouldBlock: false };
};

export default contentModerationSystem;