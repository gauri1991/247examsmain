'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, Pause, Trash2, Clock, BookOpen, Flag, 
  AlertCircle, CheckCircle2, Calendar
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface TestAttemptSession {
  id: string;
  testId: string;
  testName: string;
  examName: string;
  status: 'in_progress' | 'paused' | 'completed' | 'expired';
  currentQuestionIndex: number;
  answers: Record<string, any>;
  flaggedQuestions: string[];
  timeRemaining: number;
  lastActivity: string;
  totalQuestions: number;
  progressPercentage: number;
  startedAt: string;
  canResume: boolean;
}

interface ResumeTestCardProps {
  session: TestAttemptSession;
  onSessionUpdate?: () => void;
  resumeTestAttempt?: (attemptId: string) => Promise<string>;
  pauseTestAttempt?: (attemptId: string) => Promise<boolean>;
  abandonTestAttempt?: (attemptId: string) => Promise<boolean>;
  formatTimeRemaining?: (seconds: number) => string;
  formatLastActivity?: (timestamp: string) => string;
}

export function ResumeTestCard({ 
  session, 
  onSessionUpdate,
  resumeTestAttempt: resumeTestAttemptProp,
  pauseTestAttempt: pauseTestAttemptProp,
  abandonTestAttempt: abandonTestAttemptProp,
  formatTimeRemaining: formatTimeRemainingProp,
  formatLastActivity: formatLastActivityProp
}: ResumeTestCardProps) {
  const router = useRouter();
  
  // Default formatting functions if not provided
  const formatTimeRemaining = formatTimeRemainingProp || ((seconds: number) => {
    if (seconds <= 0) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });
  
  const formatLastActivity = formatLastActivityProp || ((timestamp: string) => {
    const now = new Date();
    const lastActivity = new Date(timestamp);
    const diffMs = now.getTime() - lastActivity.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  });
  
  const resumeTestAttempt = resumeTestAttemptProp || (async (attemptId: string) => {
    // Default implementation - just navigate to a generic test page
    return `/tests/${session.testId}/attempt/${attemptId}`;
  });
  
  const pauseTestAttempt = pauseTestAttemptProp || (async (attemptId: string) => {
    // Default implementation - just return true
    return true;
  });
  
  const abandonTestAttempt = abandonTestAttemptProp || (async (attemptId: string) => {
    // Default implementation - just return true
    return true;
  });
  
  const [isResuming, setIsResuming] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'in_progress': { 
        label: 'In Progress', 
        variant: 'default' as const, 
        icon: <Play className="w-3 h-3" /> 
      },
      'paused': { 
        label: 'Paused', 
        variant: 'secondary' as const, 
        icon: <Pause className="w-3 h-3" /> 
      },
      'expired': { 
        label: 'Expired', 
        variant: 'destructive' as const, 
        icon: <AlertCircle className="w-3 h-3" /> 
      },
      'completed': { 
        label: 'Completed', 
        variant: 'outline' as const, 
        icon: <CheckCircle2 className="w-3 h-3" /> 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.in_progress;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const handleResume = async () => {
    try {
      setIsResuming(true);
      const resumeUrl = await resumeTestAttempt(session.id);
      toast.success('Resuming test...');
      router.push(resumeUrl);
    } catch (error) {
      toast.error('Failed to resume test');
    } finally {
      setIsResuming(false);
    }
  };

  const handlePause = async () => {
    try {
      setIsPausing(true);
      await pauseTestAttempt(session.id);
      toast.success('Test paused');
      onSessionUpdate?.();
    } catch (error) {
      toast.error('Failed to pause test');
    } finally {
      setIsPausing(false);
    }
  };

  const handleAbandon = async () => {
    try {
      setIsAbandoning(true);
      await abandonTestAttempt(session.id);
      toast.success('Test attempt abandoned');
      onSessionUpdate?.();
    } catch (error) {
      toast.error('Failed to abandon test');
    } finally {
      setIsAbandoning(false);
    }
  };

  const isTimeExpired = session.timeRemaining <= 0;
  const answeredQuestions = Object.keys(session.answers).length;
  const flaggedCount = session.flaggedQuestions.length;

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      !session.canResume ? 'opacity-60' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{session.testName}</CardTitle>
            <CardDescription className="text-sm">{session.examName}</CardDescription>
          </div>
          {getStatusBadge(session.status)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{session.currentQuestionIndex + 1}/{session.totalQuestions}</span>
          </div>
          <Progress value={session.progressPercentage} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Answered: {answeredQuestions}</span>
          </div>
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-orange-600" />
            <span>Flagged: {flaggedCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className={isTimeExpired ? 'text-red-600 font-medium' : ''}>
              {formatTimeRemaining(session.timeRemaining)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span>{formatLastActivity(session.lastActivity)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {session.canResume && session.status !== 'expired' && (
            <Button
              onClick={handleResume}
              disabled={isResuming}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              {isResuming ? 'Resuming...' : 'Resume'}
            </Button>
          )}
          
          {session.status === 'in_progress' && (
            <Button
              variant="outline"
              onClick={handlePause}
              disabled={isPausing}
            >
              <Pause className="w-4 h-4 mr-2" />
              {isPausing ? 'Pausing...' : 'Pause'}
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Abandon Test Attempt?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to abandon this test attempt? This action cannot be undone.
                  You will lose all progress including {answeredQuestions} answered questions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleAbandon}
                  disabled={isAbandoning}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isAbandoning ? 'Abandoning...' : 'Abandon'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Warning for expired tests */}
        {session.status === 'expired' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-800 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>This test attempt has expired and cannot be resumed.</span>
          </div>
        )}

        {/* Warning for low time */}
        {session.canResume && session.timeRemaining > 0 && session.timeRemaining < 300 && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg text-orange-800 text-sm">
            <Clock className="w-4 h-4" />
            <span>Less than 5 minutes remaining! Resume soon to avoid expiration.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}