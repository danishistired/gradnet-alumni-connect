import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navbar } from '@/components/Navbar';
import useContentModeration from '@/hooks/useContentModeration';
import { contentModerationSystem } from '@/utils/contentModeration';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export const ModerationDemo = () => {
  const [testContent, setTestContent] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const { moderateContent, isModeratingContent } = useContentModeration();

  const handleTestModeration = async () => {
    if (!testContent.trim()) return;

    const result = await moderateContent(testContent, 'post', `demo_${Date.now()}`);
    setTestResult(result);
  };

  const handleClearTest = () => {
    setTestContent('');
    setTestResult(null);
  };

  // Get moderation stats for display
  const stats = contentModerationSystem.getModerationStats();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              Content Moderation System Demo
            </h1>
            <p className="text-muted-foreground">
              Test the automatic content moderation and user warning system
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.pendingAlerts}</div>
                <p className="text-sm text-muted-foreground">Pending Alerts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.todayAlerts}</div>
                <p className="text-sm text-muted-foreground">Today's Alerts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-700">{stats.highSeverityAlerts}</div>
                <p className="text-sm text-muted-foreground">High Severity</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.activeWarnings}</div>
                <p className="text-sm text-muted-foreground">Active Warnings</p>
              </CardContent>
            </Card>
          </div>

          {/* Test Content Moderation */}
          <Card>
            <CardHeader>
              <CardTitle>Test Content Moderation</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter content below to test the moderation system. Try words like: "hate", "stupid", "kill", "spam", etc.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                placeholder="Enter your test content here..."
                className="min-h-[100px]"
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleTestModeration}
                  disabled={!testContent.trim() || isModeratingContent}
                >
                  {isModeratingContent ? 'Checking...' : 'Test Moderation'}
                </Button>
                <Button variant="outline" onClick={handleClearTest}>
                  Clear
                </Button>
              </div>

              {testResult && (
                <Alert className={testResult.allowed ? 'border-green-200' : 'border-red-200'}>
                  {testResult.allowed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium">
                        {testResult.allowed ? 'Content Allowed' : 'Content Blocked'}
                      </div>
                      {testResult.warning && (
                        <div className="text-sm">
                          <strong>Warning issued:</strong> {testResult.warning.message}
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Example Test Cases */}
          <Card>
            <CardHeader>
              <CardTitle>Example Test Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600">✅ Safe Content</h4>
                  <div className="space-y-1 text-sm">
                    <p>"I love this community!"</p>
                    <p>"Great job on the project!"</p>
                    <p>"Thanks for sharing this information"</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-600">⚠️ Warning Level</h4>
                  <div className="space-y-1 text-sm">
                    <p>"That's really stupid"</p>
                    <p>"This is spam content"</p>
                    <p>"Stop being an idiot"</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">🚫 Blocked Content</h4>
                  <div className="space-y-1 text-sm">
                    <p>"I hate this and want to kill it"</p>
                    <p>"You're a terrorist nazi"</p>
                    <p>"I will harm you and your family"</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">🔍 Detection</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Automatically scans all posts and comments</li>
                    <li>• Detects inappropriate words and phrases</li>
                    <li>• Categorizes severity (low, medium, high)</li>
                    <li>• Creates alerts for admin review</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">⚡ Actions</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Issues warnings to users via notifications</li>
                    <li>• Blocks high-severity content automatically</li>
                    <li>• Tracks user warning history</li>
                    <li>• Escalates repeat offenders</li>
                  </ul>
                </div>
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Admin Access:</strong> Go to Admin Dashboard → Content Moderation tab to review all flagged content and manage user warnings.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModerationDemo;