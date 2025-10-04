'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Target, Award, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';

interface TestResult {
  id: string;
  test_name: string;
  exam_name: string;
  score: number | string;
  total_marks: number | string;
  percentage: number | string | null;
  status: string;
  started_at: string;
  completed_at: string;
  duration_minutes: number | string;
  questions_count: number | string;
  correct_answers: number | string;
  wrong_answers: number | string;
  unanswered: number | string;
}

export default function TestResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const testId = params.testId as string;
  const attemptId = params.attemptId as string;
  
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }

    fetchResults();
  }, [isAuthenticated, attemptId]);

  const fetchResults = async () => {
    try {
      const response = await apiService.getTestAttemptResults(attemptId);
      setResult(response);
    } catch (error) {
      console.error('Failed to fetch results:', error);
      toast.error('Failed to load test results');
      router.push('/exams');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceLevel = (percentage: number | string | null) => {
    const numPercentage = Number(percentage || 0);
    if (numPercentage >= 90) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (numPercentage >= 75) return { level: 'Very Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (numPercentage >= 60) return { level: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (numPercentage >= 40) return { level: 'Average', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { level: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Results not found</h2>
          <Button onClick={() => router.push('/exams')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  const performance = getPerformanceLevel(result.percentage);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Test Results</h1>
              <p className="text-blue-100 mt-2">{result.test_name}</p>
              <p className="text-blue-200 text-sm">{result.exam_name}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/exams')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Exams
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Score Card */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${performance.bg} ${performance.color}`}>
                <Award className="mr-2 h-4 w-4" />
                {performance.level}
              </div>
              
              <div className="text-6xl font-bold text-primary mb-2">
                {Number(result.percentage || 0).toFixed(1)}%
              </div>
              
              <p className="text-xl text-muted-foreground mb-4">
                {Number(result.score || 0)} out of {Number(result.total_marks || 0)} marks
              </p>
              
              <Progress value={Number(result.percentage || 0)} className="w-full max-w-md mx-auto h-3" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Correct Answers */}
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-600">{Number(result.correct_answers || 0)}</div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </CardContent>
          </Card>

          {/* Wrong Answers */}
          <Card>
            <CardContent className="p-6 text-center">
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-red-600">{Number(result.wrong_answers || 0)}</div>
              <div className="text-sm text-muted-foreground">Wrong Answers</div>
            </CardContent>
          </Card>

          {/* Unanswered */}
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-600">{Number(result.unanswered || 0)}</div>
              <div className="text-sm text-muted-foreground">Unanswered</div>
            </CardContent>
          </Card>

          {/* Time Taken */}
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-600">{formatDuration(Number(result.duration_minutes || 0))}</div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Accuracy Rate</span>
                  <span className="font-medium">
                    {Number(result.questions_count || 0) > 0 ? ((Number(result.correct_answers || 0) / Number(result.questions_count || 0)) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="font-medium">
                    {Number(result.questions_count || 0) > 0 ? (((Number(result.correct_answers || 0) + Number(result.wrong_answers || 0)) / Number(result.questions_count || 0)) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Questions per Minute</span>
                  <span className="font-medium">
                    {Number(result.duration_minutes || 0) > 0 ? (Number(result.questions_count || 0) / Number(result.duration_minutes || 0)).toFixed(1) : 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Information */}
          <Card>
            <CardHeader>
              <CardTitle>Test Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Questions</span>
                  <span className="font-medium">{Number(result.questions_count || 0)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Started At</span>
                  <span className="font-medium text-sm">{formatDateTime(result.started_at)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed At</span>
                  <span className="font-medium text-sm">{formatDateTime(result.completed_at)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={result.status === 'completed' ? 'default' : 'secondary'}>
                    {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button onClick={() => router.push('/exams')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Button>
          
          <Button onClick={() => router.push('/dashboard')}>
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}