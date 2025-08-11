import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ApprovalStatusAlertProps {
  isApproved: boolean;
  className?: string;
}

export const ApprovalStatusAlert: React.FC<ApprovalStatusAlertProps> = ({ 
  isApproved, 
  className = "" 
}) => {
  const { refreshUser } = useAuth();

  if (isApproved) {
    return null;
  }

  const handleRefresh = async () => {
    await refreshUser();
  };

  return (
    <Alert variant="destructive" className={`border-red-200 bg-red-50 ${className}`}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="text-red-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Account Pending Approval</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="text-red-600 border-red-300 hover:bg-red-100 h-8"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
        <p className="mt-2 text-sm">
          Your alumni account is currently under review by our admin team. 
          Until approved, you cannot create posts, comments, or join communities. 
          This process typically takes 1-2 business days.
        </p>
        <p className="mt-1 text-xs text-red-600">
          If you've been approved, click the refresh button to update your status.
        </p>
      </AlertDescription>
    </Alert>
  );
};