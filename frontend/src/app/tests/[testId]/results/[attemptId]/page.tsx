'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle2, XCircle, Clock, Target, Award, BarChart3, 
  TrendingUp, Download, Share2, BookOpen, Lightbulb, Trophy,
  FileText, Calendar, Users, Zap, ChevronRight, Star, PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header with Achievement Celebration */}
      <div className={`bg-gradient-to-r ${Number(result.percentage || 0) >= 75 ? 'from-green-600 to-emerald-600' : Number(result.percentage || 0) >= 60 ? 'from-blue-600 to-cyan-600' : 'from-slate-600 to-gray-600'} text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${Number(result.percentage || 0) >= 75 ? 'bg-green-500/20' : Number(result.percentage || 0) >= 60 ? 'bg-blue-500/20' : 'bg-gray-500/20'}`}>
                <Trophy className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Test Results</h1>
                <p className="text-white/90 text-lg mt-1">{result.test_name}</p>
                <p className="text-white/70 text-sm">{result.exam_name}</p>
              </div>
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

          {/* Overall Score Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <div className="text-center">
                <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold mb-6 ${performance.bg} ${performance.color}`}>
                  <Award className="mr-3 h-6 w-6" />
                  {performance.level}
                </div>
                
                <div className="text-7xl font-bold mb-4">
                  {Number(result.percentage || 0).toFixed(1)}%
                </div>
                
                <p className="text-2xl text-white/90 mb-6">
                  {Number(result.score || 0)} out of {Number(result.total_marks || 0)} marks
                </p>
                
                <div className="bg-white/20 rounded-full p-1 max-w-md mx-auto">
                  <Progress value={Number(result.percentage || 0)} className="h-4 bg-transparent" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-white/90" />
                <div className="text-2xl font-bold">{formatDuration(Number(result.duration_minutes || 0))}</div>
                <div className="text-white/70 text-sm">Time Taken</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-white/90" />
                <div className="text-2xl font-bold">{Number(result.questions_count || 0)}</div>
                <div className="text-white/70 text-sm">Total Questions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">{Number(result.correct_answers || 0)}</div>
              <div className="text-sm text-green-700 font-medium">Correct Answers</div>
              <div className="text-xs text-green-600 mt-1">
                {Number(result.questions_count || 0) > 0 ? ((Number(result.correct_answers || 0) / Number(result.questions_count || 0)) * 100).toFixed(1) : 0}% accuracy
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
            <CardContent className="p-6 text-center">
              <div className="bg-red-100 rounded-full p-3 w-fit mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-red-600 mb-1">{Number(result.wrong_answers || 0)}</div>
              <div className="text-sm text-red-700 font-medium">Wrong Answers</div>
              <div className="text-xs text-red-600 mt-1">
                {Number(result.questions_count || 0) > 0 ? ((Number(result.wrong_answers || 0) / Number(result.questions_count || 0)) * 100).toFixed(1) : 0}% of total
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-slate-50">
            <CardContent className="p-6 text-center">
              <div className="bg-gray-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Target className="h-8 w-8 text-gray-600" />
              </div>
              <div className="text-3xl font-bold text-gray-600 mb-1">{Number(result.unanswered || 0)}</div>
              <div className="text-sm text-gray-700 font-medium">Unanswered</div>
              <div className="text-xs text-gray-600 mt-1">
                {Number(result.questions_count || 0) > 0 ? ((Number(result.unanswered || 0) / Number(result.questions_count || 0)) * 100).toFixed(1) : 0}% skipped
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {Number(result.duration_minutes || 0) > 0 ? (Number(result.questions_count || 0) / Number(result.duration_minutes || 0)).toFixed(1) : 0}
              </div>
              <div className="text-sm text-blue-700 font-medium">Q/min Speed</div>
              <div className="text-xs text-blue-600 mt-1">Questions per minute</div>
            </CardContent>
          </Card>
        </div>

        {/* Comprehensive Analysis Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Breakdown */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Performance Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Accuracy Rate</span>
                      <div className="flex items-center gap-2">
                        <Progress value={Number(result.questions_count || 0) > 0 ? ((Number(result.correct_answers || 0) / Number(result.questions_count || 0)) * 100) : 0} className="w-20 h-2" />
                        <span className="text-sm font-semibold min-w-12">
                          {Number(result.questions_count || 0) > 0 ? ((Number(result.correct_answers || 0) / Number(result.questions_count || 0)) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Completion Rate</span>
                      <div className="flex items-center gap-2">
                        <Progress value={Number(result.questions_count || 0) > 0 ? (((Number(result.correct_answers || 0) + Number(result.wrong_answers || 0)) / Number(result.questions_count || 0)) * 100) : 0} className="w-20 h-2" />
                        <span className="text-sm font-semibold min-w-12">
                          {Number(result.questions_count || 0) > 0 ? (((Number(result.correct_answers || 0) + Number(result.wrong_answers || 0)) / Number(result.questions_count || 0)) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Speed Efficiency</span>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(100, (Number(result.duration_minutes || 0) > 0 ? (Number(result.questions_count || 0) / Number(result.duration_minutes || 0)) * 10 : 0))} className="w-20 h-2" />
                        <span className="text-sm font-semibold min-w-12">
                          {Number(result.duration_minutes || 0) > 0 ? (Number(result.questions_count || 0) / Number(result.duration_minutes || 0)).toFixed(1) : 0}/min
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Test Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Test Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Started</div>
                      <div className="text-sm font-medium">{formatDateTime(result.started_at)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Completed</div>
                      <div className="text-sm font-medium">{formatDateTime(result.completed_at)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Duration</div>
                      <div className="text-sm font-medium">{formatDuration(Number(result.duration_minutes || 0))}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Status</div>
                      <Badge variant={result.status === 'completed' ? 'default' : 'secondary'} className="w-fit">
                        {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Time Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Avg. per question</span>
                      <span className="font-medium">
                        {Number(result.questions_count || 0) > 0 ? (Number(result.duration_minutes || 0) / Number(result.questions_count || 0)).toFixed(1) : 0} min
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Questions/hour</span>
                      <span className="font-medium">
                        {Number(result.duration_minutes || 0) > 0 ? ((Number(result.questions_count || 0) / Number(result.duration_minutes || 0)) * 60).toFixed(0) : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Efficiency Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Correct/Attempted</span>
                      <span className="font-medium">
                        {(Number(result.correct_answers || 0) + Number(result.wrong_answers || 0)) > 0 ? 
                          ((Number(result.correct_answers || 0) / (Number(result.correct_answers || 0) + Number(result.wrong_answers || 0))) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Attempt Rate</span>
                      <span className="font-medium">
                        {Number(result.questions_count || 0) > 0 ? 
                          (((Number(result.correct_answers || 0) + Number(result.wrong_answers || 0)) / Number(result.questions_count || 0)) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Score Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Points per minute</span>
                      <span className="font-medium">
                        {Number(result.duration_minutes || 0) > 0 ? (Number(result.score || 0) / Number(result.duration_minutes || 0)).toFixed(1) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Efficiency score</span>
                      <span className="font-medium">
                        {((Number(result.percentage || 0) / 100) * (Number(result.questions_count || 0) > 0 ? ((Number(result.correct_answers || 0) + Number(result.wrong_answers || 0)) / Number(result.questions_count || 0)) : 0) * 100).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Number(result.percentage || 0) >= 90 && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <Trophy className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-800">Outstanding Performance!</div>
                        <div className="text-sm text-green-700">You've achieved exceptional results. Keep up the excellent work!</div>
                      </div>
                    </div>
                  )}
                  
                  {Number(result.unanswered || 0) > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                      <Target className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-amber-800">Time Management</div>
                        <div className="text-sm text-amber-700">You left {Number(result.unanswered || 0)} questions unanswered. Consider time management strategies.</div>
                      </div>
                    </div>
                  )}
                  
                  {Number(result.duration_minutes || 0) > 0 && (Number(result.questions_count || 0) / Number(result.duration_minutes || 0)) < 1 && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-800">Pace Yourself</div>
                        <div className="text-sm text-blue-700">You spent considerable time per question. Practice speed with accuracy.</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Study Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Number(result.percentage || 0) < 60 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Focus on fundamentals</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Practice more mock tests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Review incorrect answers</span>
                      </div>
                    </div>
                  )}
                  
                  {Number(result.percentage || 0) >= 60 && Number(result.percentage || 0) < 85 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Advanced practice papers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Time-bound practice</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Focus on weak areas</span>
                      </div>
                    </div>
                  )}
                  
                  {Number(result.percentage || 0) >= 85 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Challenging question sets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Speed optimization</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Help others learn</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="bg-blue-100 rounded-full p-4 w-fit mx-auto mb-4">
                    <Share2 className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Share Results</h3>
                  <p className="text-sm text-muted-foreground mb-4">Share your achievement with friends and family</p>
                  <Button className="w-full" onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'My Test Results',
                        text: `I scored ${Number(result.percentage || 0).toFixed(1)}% in ${result.test_name}!`,
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied to clipboard!');
                    }
                  }}>
                    Share Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="bg-green-100 rounded-full p-4 w-fit mx-auto mb-4">
                    <Download className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Download Certificate</h3>
                  <p className="text-sm text-muted-foreground mb-4">Get a printable performance certificate</p>
                  <Button className="w-full" variant="outline" onClick={() => {
                    toast.info('Certificate download will be available soon!');
                  }}>
                    Download PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="bg-purple-100 rounded-full p-4 w-fit mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">View Progress</h3>
                  <p className="text-sm text-muted-foreground mb-4">Track your performance over time</p>
                  <Button className="w-full" variant="outline" onClick={() => router.push('/dashboard')}>
                    Go to Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
          <Button onClick={() => router.push('/exams')} variant="outline" size="lg" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            Back to Exams
          </Button>
          
          <Button onClick={() => router.push(`/exams/${result.exam_name.toLowerCase().replace(/\s+/g, '-')}`)} size="lg" className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Take Another Test
          </Button>
          
          <Button onClick={() => router.push('/dashboard')} variant="outline" size="lg" className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}