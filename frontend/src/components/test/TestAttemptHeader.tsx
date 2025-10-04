'use client';

import { Clock, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface TestAttempt {
  id: string;
  test: {
    id: string;
    title: string;
    duration_minutes: number;
    total_marks: number;
    randomize_questions: boolean;
  };
  status: string;
  start_time: string;
  total_questions: number;
  answered_count: number;
}

interface TestAttemptHeaderProps {
  attempt: TestAttempt;
  timeRemaining: number;
  answeredCount: number;
  progressPercentage: number;
  onSubmit: () => void;
}

export function TestAttemptHeader({
  attempt,
  timeRemaining,
  answeredCount,
  progressPercentage,
  onSubmit
}: TestAttemptHeaderProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerStyle = () => {
    const totalDuration = attempt.test.duration_minutes * 60;
    const timePercentage = (timeRemaining / totalDuration) * 100;
    
    if (timePercentage <= 10) {
      return 'text-red-600 font-bold animate-pulse';
    } else if (timePercentage <= 25) {
      return 'text-orange-600 font-semibold';
    }
    return 'text-green-600 font-semibold';
  };

  const getTimerBadgeVariant = () => {
    const totalDuration = attempt.test.duration_minutes * 60;
    const timePercentage = (timeRemaining / totalDuration) * 100;
    
    if (timePercentage <= 10) {
      return 'destructive' as const;
    } else if (timePercentage <= 25) {
      return 'secondary' as const;
    }
    return 'default' as const;
  };

  return (
    <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Test Info */}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground mb-2">{attempt.test.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{attempt.total_questions} Questions</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{attempt.test.total_marks} Marks</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{attempt.test.duration_minutes} Minutes</span>
              </div>
            </div>
          </div>

          {/* Timer and Progress */}
          <div className="flex items-center gap-6">
            {/* Progress Section */}
            <Card className="w-64">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {answeredCount}/{attempt.total_questions}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progressPercentage.toFixed(1)}% Complete</span>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{answeredCount} answered</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timer */}
            <div className="text-center">
              <Badge variant={getTimerBadgeVariant()} className="mb-2">
                <Clock className="h-3 w-3 mr-1" />
                Time Remaining
              </Badge>
              <div className={`text-2xl font-mono ${getTimerStyle()}`}>
                {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={onSubmit}
              variant="destructive"
              size="lg"
              className="min-w-[120px]"
            >
              <FileText className="h-4 w-4 mr-2" />
              Submit Test
            </Button>
          </div>
        </div>

        {/* Warning for low completion */}
        {progressPercentage < 50 && timeRemaining < 600 && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800">
              You have answered only {answeredCount} out of {attempt.total_questions} questions. 
              Consider reviewing unanswered questions before time runs out.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}