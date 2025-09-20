import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Info } from 'lucide-react';
import { type AIModerationResult } from '@/utils/aiContentModeration';

interface ContentModerationWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  onCancel: () => void;
  result: AIModerationResult;
  contentType: 'post' | 'comment';
}

export const ContentModerationWarningDialog: React.FC<ContentModerationWarningDialogProps> = ({
  isOpen,
  onClose,
  onProceed,
  onCancel,
  result,
  contentType
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Shield className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              result.severity === 'high' ? 'bg-red-100' : 
              result.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
            }`}>
              {getSeverityIcon(result.severity)}
            </div>
            <div>
              <DialogTitle className="text-lg">Content Review Required</DialogTitle>
              <DialogDescription>
                Our AI system has flagged potential concerns with your {contentType}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Severity Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Severity Level:</span>
            <Badge className={`${getSeverityColor(result.severity)} capitalize`}>
              {result.severity} Risk
            </Badge>
            <span className="text-sm text-gray-500">
              ({result.confidence}% confidence)
            </span>
          </div>

          {/* Explanation */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Analysis:</h4>
            <p className="text-sm text-gray-700">{result.explanation}</p>
          </div>

          {/* Concerns */}
          {result.concerns.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Specific Concerns:</h4>
              <ul className="space-y-1">
                {result.concerns.map((concern, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                    {concern}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Info */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-900 font-medium mb-1">What happens next?</p>
                <p className="text-blue-700">
                  If you proceed, your {contentType} will be published but flagged for admin review. 
                  Repeated violations may result in account restrictions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex-1"
          >
            Cancel & Edit
          </Button>
          <Button 
            onClick={onProceed}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Proceed Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContentModerationWarningDialog;