import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Users,
  MessageSquare,
  FileText
} from 'lucide-react';
import { 
  contentModerationSystem, 
  type ModerationAlert,
  type UserWarning 
} from '@/utils/contentModeration';

export const ContentModerationPanel = () => {
  const [alerts, setAlerts] = useState<ModerationAlert[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModerationData();
    // Clean up expired warnings
    contentModerationSystem.cleanupExpiredWarnings();
  }, []);

  const loadModerationData = () => {
    const allAlerts = contentModerationSystem.getAllAlerts();
    const moderationStats = contentModerationSystem.getModerationStats();
    
    setAlerts(allAlerts);
    setStats(moderationStats);
    setLoading(false);
  };

  const handleReviewAlert = (alertId: string, action: 'reviewed' | 'dismissed') => {
    contentModerationSystem.updateAlertStatus(alertId, action);
    loadModerationData();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'destructive';
      case 'reviewed':
        return 'default';
      case 'dismissed':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading moderation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.pendingAlerts}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Alerts</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.todayAlerts}</div>
            <p className="text-xs text-muted-foreground">New alerts today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            <Shield className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats.highSeverityAlerts}</div>
            <p className="text-xs text-muted-foreground">Critical violations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Warnings</CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.activeWarnings}</div>
            <p className="text-xs text-muted-foreground">Users with warnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Content Moderation Alerts
          </CardTitle>
          <CardDescription>
            Review flagged content and take appropriate actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({alerts.filter(a => a.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="all">All Alerts ({alerts.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {alerts.filter(alert => alert.status === 'pending').length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    No pending alerts! All flagged content has been reviewed.
                  </AlertDescription>
                </Alert>
              ) : (
                alerts
                  .filter(alert => alert.status === 'pending')
                  .map((alert) => (
                    <Card key={alert.id} className="border-l-4 border-l-red-500">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={getSeverityColor(alert.severity) as any}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {alert.contentType === 'post' ? <FileText className="h-3 w-3 mr-1" /> : <MessageSquare className="h-3 w-3 mr-1" />}
                                {alert.contentType.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                by {alert.userName}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(alert.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Flagged Content:</h4>
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                              <p className="text-sm">{alert.flaggedContent}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Detected Issues:</h4>
                            <div className="flex flex-wrap gap-1">
                              {alert.detectedWords.map((word, index) => (
                                <Badge key={index} variant="destructive" className="text-xs">
                                  {word}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReviewAlert(alert.id, 'reviewed')}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Mark as Reviewed
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReviewAlert(alert.id, 'dismissed')}
                              className="flex items-center gap-1"
                            >
                              <XCircle className="h-3 w-3" />
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4 mt-4">
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      No moderation alerts yet. The system will automatically flag inappropriate content.
                    </AlertDescription>
                  </Alert>
                ) : (
                  alerts.map((alert) => (
                    <Card key={alert.id} className="relative">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={getSeverityColor(alert.severity) as any}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge variant={getStatusColor(alert.status) as any}>
                                {alert.status.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {alert.contentType === 'post' ? <FileText className="h-3 w-3 mr-1" /> : <MessageSquare className="h-3 w-3 mr-1" />}
                                {alert.contentType.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                by {alert.userName}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(alert.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <p className="text-sm">{alert.flaggedContent}</p>
                          <div className="flex flex-wrap gap-1">
                            {alert.detectedWords.map((word, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {word}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentModerationPanel;