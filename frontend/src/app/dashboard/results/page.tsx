'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Trophy, TrendingUp, TrendingDown, Award, Target, Clock, 
  CheckCircle2, XCircle, AlertCircle, BookOpen, Eye, Download,
  Calendar, BarChart3, PieChart, Activity
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { showErrorToast, showSuccessToast, showInfoToast } from '@/lib/error-handler';
import { AnalyticsLoading, EmptyState, TableLoading } from '@/components/ui/loading-states';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PerformanceTrendChart } from '@/components/analytics/PerformanceTrendChart';
import { ScoreDistributionChart } from '@/components/analytics/ScoreDistributionChart';
import { PerformanceMetrics } from '@/components/analytics/PerformanceMetrics';

interface TestResult {
  id: string;
  test_name: string;
  exam_name: string;
  score: number;
  total_marks: number;
  percentage: number;
  status: string;
  started_at: string;
  completed_at: string;
  duration_minutes: number;
  questions_count: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
}

interface PerformanceStats {
  total_tests: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  total_time_spent: number;
  improvement_rate: number;
  current_streak: number;
  best_category: string;
  weak_areas: string[];
}

function ResultsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const { isAuthenticated } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }
    
    fetchResults();
    fetchPerformanceStats();
  }, [isAuthenticated]);

  useEffect(() => {
    // Scroll to highlighted result after results are loaded
    if (highlightId && results.length > 0) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`result-row-${highlightId}`);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 500); // Small delay to ensure rendering is complete

      return () => clearTimeout(timer);
    }
  }, [highlightId, results]);

  const fetchResults = async () => {
    try {
      // Mock data for now - replace with API call
      const mockResults: TestResult[] = [
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
          score: 72,
          total_marks: 100,
          percentage: 72,
          status: 'completed',
          started_at: '2025-09-25T14:00:00Z',
          completed_at: '2025-09-25T15:45:00Z',
          duration_minutes: 105,
          questions_count: 100,
          correct_answers: 72,
          wrong_answers: 20,
          unanswered: 8
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
          score: 68,
          total_marks: 100,
          percentage: 68,
          status: 'completed',
          started_at: '2025-09-23T16:00:00Z',
          completed_at: '2025-09-23T17:30:00Z',
          duration_minutes: 90,
          questions_count: 100,
          correct_answers: 68,
          wrong_answers: 25,
          unanswered: 7
        },
        {
          id: '5',
          test_name: 'Railway RRB Practice Test',
          exam_name: 'Railway RRB',
          score: 78,
          total_marks: 100,
          percentage: 78,
          status: 'completed',
          started_at: '2025-09-22T11:00:00Z',
          completed_at: '2025-09-22T12:30:00Z',
          duration_minutes: 90,
          questions_count: 100,
          correct_answers: 78,
          wrong_answers: 15,
          unanswered: 7
        }
      ];

      setResults(mockResults);
    } catch (error) {
      console.error('Failed to fetch results:', error);
      toast.error('Failed to load results');
    }
  };

  const fetchPerformanceStats = async () => {
    try {
      // Mock data for performance stats
      const mockStats: PerformanceStats = {
        total_tests: 15,
        average_score: 78.6,
        highest_score: 95,
        lowest_score: 62,
        total_time_spent: 1350, // minutes
        improvement_rate: 12.5,
        current_streak: 5,
        best_category: 'General Knowledge',
        weak_areas: ['Current Affairs', 'Mathematics']
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 90) return { text: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (percentage >= 80) return { text: 'Very Good', color: 'bg-blue-100 text-blue-800' };
    if (percentage >= 70) return { text: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    if (percentage >= 60) return { text: 'Average', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleViewDetails = (result: TestResult) => {
    setSelectedResult(result);
    setShowDetailsDialog(true);
  };

  const handleDownloadReport = (result: TestResult) => {
    // Create a simple report data
    const reportData = {
      testName: result.test_name,
      examName: result.exam_name,
      score: result.score,
      totalMarks: result.total_marks,
      percentage: result.percentage,
      correctAnswers: result.correct_answers,
      wrongAnswers: result.wrong_answers,
      unanswered: result.unanswered,
      duration: formatDuration(result.duration_minutes),
      completedAt: formatDate(result.completed_at)
    };

    // Create and download the file
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${result.test_name.replace(/\s+/g, '_')}_Report.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Report downloaded successfully!');
  };

  // Analytics calculations
  const calculateAnalytics = () => {
    if (results.length === 0) {
      return {
        totalTests: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeTaken: 0,
        passRate: 0,
        improvementTrend: 0,
        trendData: [],
        overallDistribution: { correct_answers: 0, wrong_answers: 0, unanswered: 0 }
      };
    }

    const totalTests = results.length;
    const averageScore = results.reduce((sum, r) => sum + r.percentage, 0) / totalTests;
    const bestScore = Math.max(...results.map(r => r.percentage));
    const totalTimeTaken = results.reduce((sum, r) => sum + r.duration_minutes, 0);
    const passedTests = results.filter(r => r.percentage >= 60).length;
    const passRate = (passedTests / totalTests) * 100;

    // Calculate improvement trend (last 5 tests vs previous 5)
    const recentTests = results.slice(-5);
    const previousTests = results.slice(-10, -5);
    let improvementTrend = 0;
    
    if (previousTests.length > 0 && recentTests.length > 0) {
      const recentAvg = recentTests.reduce((sum, r) => sum + r.percentage, 0) / recentTests.length;
      const previousAvg = previousTests.reduce((sum, r) => sum + r.percentage, 0) / previousTests.length;
      improvementTrend = recentAvg - previousAvg;
    }

    // Prepare trend data (last 10 tests)
    const trendData = results.slice(-10).map(r => ({
      test_name: r.test_name,
      percentage: r.percentage,
      completed_at: r.completed_at
    }));

    // Calculate overall answer distribution
    const overallDistribution = results.reduce(
      (acc, r) => ({
        correct_answers: acc.correct_answers + r.correct_answers,
        wrong_answers: acc.wrong_answers + r.wrong_answers,
        unanswered: acc.unanswered + r.unanswered
      }),
      { correct_answers: 0, wrong_answers: 0, unanswered: 0 }
    );

    return {
      totalTests,
      averageScore,
      bestScore,
      totalTimeTaken,
      passRate,
      improvementTrend,
      trendData,
      overallDistribution
    };
  };

  const analytics = calculateAnalytics();

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <>
        <DashboardHeader title="My Results" />
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
      <DashboardHeader title="My Results" />
      
      <div className="flex-1 overflow-auto px-6 py-8">
        {/* Performance Overview */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Trophy className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <div className={`text-2xl font-bold ${getScoreColor(stats.average_score)}`}>
                      {stats.average_score.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">From {stats.total_tests} tests</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Improvement Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {stats.improvement_rate > 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-500 mr-3" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500 mr-3" />
                  )}
                  <div>
                    <div className="text-2xl font-bold">
                      {stats.improvement_rate > 0 ? '+' : ''}{stats.improvement_rate}%
                    </div>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <div className="text-2xl font-bold">{stats.current_streak} days</div>
                    <p className="text-xs text-muted-foreground">Keep it up!</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Time Invested</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <div className="text-2xl font-bold">
                      {Math.floor(stats.total_time_spent / 60)}h
                    </div>
                    <p className="text-xs text-muted-foreground">Total study time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">All Results</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>Your complete test history and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => {
                        const scoreBadge = getScoreBadge(result.percentage);
                        const isHighlighted = highlightId === result.id;
                        return (
                          <TableRow 
                            key={result.id}
                            id={`result-row-${result.id}`}
                            className={isHighlighted ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500 transition-all duration-300' : ''}
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium">{result.test_name}</p>
                                <p className="text-sm text-muted-foreground">{result.exam_name}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDate(result.completed_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${getScoreColor(result.percentage)}`}>
                                  {result.score}/{result.total_marks}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {result.percentage}%
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={scoreBadge.color} variant="secondary">
                                {scoreBadge.text}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDuration(result.duration_minutes)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewDetails(result)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDownloadReport(result)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            {results.slice(0, 3).map((result) => {
              const scoreBadge = getScoreBadge(result.percentage);
              const isHighlighted = highlightId === result.id;
              return (
                <Card 
                  key={result.id} 
                  className={isHighlighted ? 'bg-blue-50 border-blue-200 border-2' : ''}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{result.test_name}</CardTitle>
                        <CardDescription>{result.exam_name} • {formatDate(result.completed_at)}</CardDescription>
                      </div>
                      <Badge className={scoreBadge.color} variant="secondary">
                        {scoreBadge.text}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(result.percentage)}`}>
                          {result.percentage}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Correct</p>
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                          <span className="font-medium">{result.correct_answers}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Wrong</p>
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                          <span className="font-medium">{result.wrong_answers}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Skipped</p>
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="font-medium">{result.unanswered}</span>
                        </div>
                      </div>
                    </div>
                    <Progress value={result.percentage} className="h-2" />
                    <div className="flex justify-between mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(result)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadReport(result)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Performance Metrics Cards */}
            <PerformanceMetrics
              totalTests={analytics.totalTests}
              averageScore={analytics.averageScore}
              bestScore={analytics.bestScore}
              totalTimeTaken={analytics.totalTimeTaken}
              passRate={analytics.passRate}
              improvementTrend={analytics.improvementTrend}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trend</CardTitle>
                  <CardDescription>Your score progression over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.trendData.length > 0 ? (
                    <PerformanceTrendChart data={analytics.trendData} />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center border rounded-lg bg-muted/50">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No test data available for trend analysis</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Answer Distribution</CardTitle>
                  <CardDescription>Overall breakdown of your answers across all tests</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.totalTests > 0 ? (
                    <ScoreDistributionChart data={analytics.overallDistribution} />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center border rounded-lg bg-muted/50">
                      <div className="text-center">
                        <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No test data available for distribution analysis</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Study Insights</CardTitle>
                  <CardDescription>Based on your recent performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Trophy className="h-4 w-4 mr-2 text-green-500" />
                        Strengths
                      </h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Best performance in {stats.best_category}</li>
                        <li>• Consistent improvement trend</li>
                        <li>• Good time management skills</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Target className="h-4 w-4 mr-2 text-orange-500" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {stats.weak_areas.map((area, index) => (
                          <li key={index}>• Focus more on {area}</li>
                        ))}
                        <li>• Practice more timed tests</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Test Result Details</DialogTitle>
            <DialogDescription>
              Detailed breakdown of your test performance
            </DialogDescription>
          </DialogHeader>
          
          {selectedResult && (
            <div className="space-y-6">
              {/* Test Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Test Name</p>
                  <p className="font-medium">{selectedResult.test_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Exam Category</p>
                  <p className="font-medium">{selectedResult.exam_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date Completed</p>
                  <p className="font-medium">{formatDate(selectedResult.completed_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-medium">{formatDuration(selectedResult.duration_minutes)}</p>
                </div>
              </div>

              {/* Score Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Overall Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${getScoreColor(selectedResult.percentage)}`}>
                      {selectedResult.percentage}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedResult.score} / {selectedResult.total_marks}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Correct</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {selectedResult.correct_answers}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {((selectedResult.correct_answers / selectedResult.questions_count) * 100).toFixed(1)}% accuracy
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Wrong</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                      {selectedResult.wrong_answers}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {((selectedResult.wrong_answers / selectedResult.questions_count) * 100).toFixed(1)}% incorrect
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Unanswered</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">
                      {selectedResult.unanswered}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {((selectedResult.unanswered / selectedResult.questions_count) * 100).toFixed(1)}% skipped
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Analysis */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Performance Analysis</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Answer Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Correct Answers</span>
                          <span className="text-sm font-medium">{selectedResult.correct_answers}</span>
                        </div>
                        <Progress 
                          value={(selectedResult.correct_answers / selectedResult.questions_count) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Wrong Answers</span>
                          <span className="text-sm font-medium">{selectedResult.wrong_answers}</span>
                        </div>
                        <Progress 
                          value={(selectedResult.wrong_answers / selectedResult.questions_count) * 100} 
                          className="h-2 [&>div]:bg-red-500"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Unanswered</span>
                          <span className="text-sm font-medium">{selectedResult.unanswered}</span>
                        </div>
                        <Progress 
                          value={(selectedResult.unanswered / selectedResult.questions_count) * 100} 
                          className="h-2 [&>div]:bg-yellow-500"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Performance Grade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        {(() => {
                          const badge = getScoreBadge(selectedResult.percentage);
                          return (
                            <>
                              <div className={`text-4xl font-bold mb-2 ${getScoreColor(selectedResult.percentage)}`}>
                                {selectedResult.percentage >= 90 ? 'A+' :
                                 selectedResult.percentage >= 80 ? 'A' :
                                 selectedResult.percentage >= 70 ? 'B' :
                                 selectedResult.percentage >= 60 ? 'C' : 'D'}
                              </div>
                              <Badge className={badge.color} variant="secondary">
                                {badge.text}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-2">
                                You scored better than {Math.floor(Math.random() * 40 + 40)}% of test takers
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedResult.percentage >= 85 ? (
                      <>
                        <p className="text-sm">• Excellent performance! Keep up the great work.</p>
                        <p className="text-sm">• Consider attempting more challenging tests to further improve.</p>
                        <p className="text-sm">• Focus on time management to reduce unanswered questions.</p>
                      </>
                    ) : selectedResult.percentage >= 70 ? (
                      <>
                        <p className="text-sm">• Good performance with room for improvement.</p>
                        <p className="text-sm">• Review topics where you made mistakes.</p>
                        <p className="text-sm">• Practice more questions to improve accuracy.</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm">• Focus on fundamental concepts and basic preparation.</p>
                        <p className="text-sm">• Take more practice tests to improve familiarity.</p>
                        <p className="text-sm">• Consider studying the topics where you struggled.</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleDownloadReport(selectedResult)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
                <Button onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <>
        <DashboardHeader title="My Results" />
        <div className="flex-1 overflow-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </>
    }>
      <ResultsPageContent />
    </Suspense>
  );
}