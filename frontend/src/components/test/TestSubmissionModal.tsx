'use client';

import { AlertTriangle, CheckCircle2, FileText, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface TestSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  answeredCount: number;
  totalQuestions: number;
  timeRemaining?: number;
}

export function TestSubmissionModal({
  isOpen,
  onClose,
  onConfirm,
  answeredCount,
  totalQuestions,
  timeRemaining
}: TestSubmissionModalProps) {
  const unansweredCount = totalQuestions - answeredCount;
  const completionPercentage = (answeredCount / totalQuestions) * 100;
  const isIncomplete = answeredCount < totalQuestions;

  const formatTime = (seconds?: number) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCompletionMessage = () => {
    if (completionPercentage === 100) {
      return {
        type: 'success' as const,
        message: 'Excellent! You have answered all questions.',
        icon: CheckCircle2
      };
    } else if (completionPercentage >= 80) {
      return {
        type: 'warning' as const,
        message: `You have answered ${answeredCount} out of ${totalQuestions} questions. ${unansweredCount} questions remain unanswered.`,
        icon: AlertTriangle
      };
    } else {
      return {
        type: 'destructive' as const,
        message: `You have only answered ${answeredCount} out of ${totalQuestions} questions. ${unansweredCount} questions remain unanswered.`,
        icon: AlertTriangle
      };
    }
  };

  const completion = getCompletionMessage();
  const CompletionIcon = completion.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submit Test
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to submit your test? Once submitted, you cannot make any changes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Test Progress</span>
              <Badge variant="outline" className="bg-white">
                {completionPercentage.toFixed(1)}% Complete
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>{answeredCount} Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-gray-300 bg-gray-100"></div>
                <span>{unansweredCount} Unanswered</span>
              </div>
            </div>
          </div>

          {/* Time Remaining */}
          {timeRemaining !== undefined && timeRemaining > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Time remaining: <strong>{formatTime(timeRemaining)}</strong>
              </span>
            </div>
          )}

          {/* Completion Status Alert */}
          <Alert variant={completion.type === 'success' ? 'default' : 'destructive'}>
            <CompletionIcon className="h-4 w-4" />
            <AlertDescription>
              {completion.message}
            </AlertDescription>
          </Alert>

          {/* Warning for incomplete submission */}
          {isIncomplete && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Submitting with unanswered questions may affect your score. 
                Make sure you have reviewed all questions before submitting.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Continue Test
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="min-w-[120px]"
          >
            <FileText className="h-4 w-4 mr-2" />
            Submit Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}