'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Clock, Trophy, FileText, Eye, Calendar, CheckCircle2, XCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';

interface TestAttempt {
  id: string;
  test_name: string;
  exam_name: string;
  score: number;
  total_marks: number;
  percentage: number;
  status: 'completed' | 'in_progress' | 'abandoned';
  started_at: string;
  completed_at: string | null;
  duration_minutes: number;
  questions_count: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
}

const statusColors = {
  completed: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  abandoned: 'bg-red-100 text-red-800'
};

const statusIcons = {
  completed: CheckCircle2,
  in_progress: Clock,
  abandoned: XCircle
};

export default function TestsPage() {
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_attempts: 0,
    completed: 0,
    average_score: 0,
    best_score: 0
  });
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }
    
    fetchTestAttempts();
  }, [isAuthenticated]);

  const fetchTestAttempts = async () => {
    try {
      // For now, use mock data to demonstrate restart functionality
      // In production, this would be: const response = await apiRequest('/exams/attempts/');
      const mockAttempts: TestAttempt[] = [
        {
          id: '1',
          test_name: 'UPSC Prelims Mock Test 1',
          exam_name: 'UPSC Civil Services',
          score: 85,
          total_marks: 100,
          percentage: 85,
          status: 'completed',
          started_at: '2025-09-26T10:00:00Z',
          completed_at: '2025-09-26T11:30:00Z',
          duration_minutes: 90,
          questions_count: 100,
          correct_answers: 85,
          wrong_answers: 10,
          unanswered: 5
        },
        {
          id: '2',
          test_name: 'General Studies Paper 2',
          exam_name: 'UPSC Civil Services',
          score: 0,
          total_marks: 100,
          percentage: 0,
          status: 'in_progress',
          started_at: '2025-09-27T09:00:00Z',
          completed_at: null,
          duration_minutes: 45,
          questions_count: 100,
          correct_answers: 0,
          wrong_answers: 0,
          unanswered: 0
        },
        {
          id: '3',
          test_name: 'SSC CGL Tier 1 Mock',
          exam_name: 'SSC CGL',
          score: 90,
          total_marks: 100,
          percentage: 90,
          status: 'completed',
          started_at: '2025-09-24T09:00:00Z',
          completed_at: '2025-09-24T10:00:00Z',
          duration_minutes: 60,
          questions_count: 100,
          correct_answers: 90,
          wrong_answers: 8,
          unanswered: 2
        },
        {
          id: '4',
          test_name: 'Banking Awareness Test',
          exam_name: 'IBPS PO',
          score: 0,
          total_marks: 100,
          percentage: 0,
          status: 'in_progress',
          started_at: '2025-09-25T14:30:00Z',
          completed_at: null,
          duration_minutes: 30,
          questions_count: 50,
          correct_answers: 0,
          wrong_answers: 0,
          unanswered: 0
        },
        {
          id: '5',
          test_name: 'Railway RRB Practice Test',
          exam_name: 'Railway RRB',
          score: 0,
          total_marks: 80,
          percentage: 0,
          status: 'abandoned',
          started_at: '2025-09-23T16:00:00Z',
          completed_at: null,
          duration_minutes: 15,
          questions_count: 80,
          correct_answers: 0,
          wrong_answers: 0,
          unanswered: 0
        }
      ];

      setTestAttempts(mockAttempts);
      
      // Calculate stats
      const completed = mockAttempts.filter((attempt: TestAttempt) => attempt.status === 'completed');
      const averageScore = completed.length > 0 
        ? completed.reduce((acc: number, attempt: TestAttempt) => acc + attempt.percentage, 0) / completed.length
        : 0;
      const bestScore = completed.length > 0
        ? Math.max(...completed.map((attempt: TestAttempt) => attempt.percentage))
        : 0;

      setStats({
        total_attempts: mockAttempts.length,
        completed: completed.length,
        average_score: Math.round(averageScore),
        best_score: Math.round(bestScore)
      });
    } catch (error) {
      console.error('Failed to fetch test attempts:', error);
      toast.error('Failed to load test attempts');
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = (attemptId: string) => {
    // Navigate to the dashboard results page with the test ID as a query parameter
    router.push(`/dashboard/results?highlight=${attemptId}`);
  };

  const handleRestartTest = async (attempt: TestAttempt) => {
    try {
      // For now, simulate creating a new attempt for the same test
      // In production, this would make an API call to restart or create a new attempt
      
      // Generate a mock new attempt ID
      const newAttemptId = `new-${Date.now()}`;
      
      toast.success(`Restarting ${attempt.test_name}...`);
      
      // Simulate navigation to the test attempt page
      // For now, we'll redirect to a mock test attempt
      router.push(`/tests/f0e412c9-7fd0-492c-aa18-e9935f53a209/attempt/${newAttemptId}`);
      
      // In production, this would be:
      // const response = await apiRequest(`/exams/tests/${actualTestId}/start_attempt/`, {
      //   method: 'POST'
      // });
      // if (response.id) {
      //   toast.success('Test restarted successfully!');
      //   router.push(`/tests/${actualTestId}/attempt/${response.id}`);
      // }
      
    } catch (error: any) {
      console.error('Failed to restart test:', error);
      toast.error(error.message || 'Failed to restart test');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <>
        <DashboardHeader title="My Tests" />
        <div className="flex-1 overflow-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader title="My Tests" />
      
      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">My Test Attempts</h1>
          <p className="text-muted-foreground">Track your progress and view detailed results</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-primary mr-3" />
                <div className="text-2xl font-bold text-foreground">{stats.total_attempts}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
                <div className="text-2xl font-bold text-foreground">{stats.completed}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Trophy className="h-5 w-5 text-blue-600 mr-3" />
                <div className="text-2xl font-bold text-foreground">{stats.average_score}%</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Best Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Trophy className="h-5 w-5 text-yellow-600 mr-3" />
                <div className="text-2xl font-bold text-foreground">{stats.best_score}%</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Attempts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Test History</CardTitle>
            <CardDescription>Your complete test attempt history</CardDescription>
          </CardHeader>
          <CardContent>
            {testAttempts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2 text-foreground">No test attempts yet</h3>
                <p className="text-muted-foreground mb-4">Start taking tests to see your progress here</p>
                <Button onClick={() => router.push('/exams')}>
                  Browse Exams
                </Button>
              </div>
            ) : (
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test & Exam</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testAttempts.map((attempt) => {
                      const StatusIcon = statusIcons[attempt.status];
                      
                      return (
                        <TableRow key={attempt.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">{attempt.test_name}</div>
                              <div className="text-sm text-muted-foreground">{attempt.exam_name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[attempt.status]} variant="secondary">
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {attempt.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {attempt.status === 'completed' ? (
                              <div>
                                <div className="font-medium text-foreground">{attempt.percentage}%</div>
                                <div className="text-sm text-muted-foreground">
                                  {attempt.score}/{attempt.total_marks}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                              {formatDuration(attempt.duration_minutes)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                              {formatDate(attempt.started_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {attempt.status === 'completed' ? (
                              <Button 
                                onClick={() => handleViewResults(attempt.id)}
                                variant="outline"
                                size="sm"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Results
                              </Button>
                            ) : attempt.status === 'in_progress' ? (
                              <Button 
                                onClick={() => handleRestartTest(attempt)}
                                variant="outline"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Restart
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-sm">No action available</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}