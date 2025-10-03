'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, TrendingUp, Target, Clock, CheckCircle2, XCircle, 
  AlertCircle, BookOpen, Home, ArrowLeft, BarChart3, 
  ThumbsUp, ThumbsDown, Flag, Lightbulb, RotateCcw
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface QuestionResult {
  id: string;
  question_text: string;
  question_type: string;
  marks: number;
  options?: {
    id: string;
    option_text: string;
    is_correct: boolean;
  }[];
  user_answer: any;
  correct_answer: any;
  is_correct: boolean;
  marks_obtained: number;
  time_spent: number;
  explanation?: string;
  topic?: string;
  difficulty?: string;
}

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
  questions: QuestionResult[];
}

export default function TestResultReviewPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;
  const attemptId = params.attemptId as string;
  const { isAuthenticated } = useAuth();

  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }
    
    if (testId && attemptId) {
      fetchTestResult();
    }
  }, [testId, attemptId, isAuthenticated]);

  const fetchTestResult = async () => {
    try {
      setLoading(true);
      
      // For now, create comprehensive mock data
      const mockResult: TestResult = {
        id: attemptId,
        test_name: 'UPSC Prelims Mock Test 2024',
        exam_name: 'UPSC Civil Services Examination',
        score: 142,
        total_marks: 200,
        percentage: 71,
        status: 'completed',
        started_at: '2024-09-27T10:00:00Z',
        completed_at: '2024-09-27T12:00:00Z',
        duration_minutes: 120,
        questions_count: 100,
        correct_answers: 71,
        questions: [
          {
            id: '1',
            question_text: 'Who was the first President of India?',
            question_type: 'mcq',
            marks: 2,
            options: [
              { id: 'a', option_text: 'Dr. Rajendra Prasad', is_correct: true },
              { id: 'b', option_text: 'Dr. A.P.J. Abdul Kalam', is_correct: false },
              { id: 'c', option_text: 'Dr. Sarvepalli Radhakrishnan', is_correct: false },
              { id: 'd', option_text: 'Jawaharlal Nehru', is_correct: false }
            ],
            user_answer: 'a',
            correct_answer: 'a',
            is_correct: true,
            marks_obtained: 2,
            time_spent: 45,
            explanation: 'Dr. Rajendra Prasad was the first President of India, serving from 1950 to 1962.',
            topic: 'Indian Polity',
            difficulty: 'easy'
          },
          {
            id: '2',
            question_text: 'The Earth revolves around the Sun in approximately how many days?',
            question_type: 'mcq',
            marks: 2,
            options: [
              { id: 'a', option_text: '365 days', is_correct: true },
              { id: 'b', option_text: '360 days', is_correct: false },
              { id: 'c', option_text: '366 days', is_correct: false },
              { id: 'd', option_text: '364 days', is_correct: false }
            ],
            user_answer: 'b',
            correct_answer: 'a',
            is_correct: false,
            marks_obtained: 0,
            time_spent: 60,
            explanation: 'The Earth takes approximately 365.25 days to complete one revolution around the Sun.',
            topic: 'Geography',
            difficulty: 'easy'
          },
          {
            id: '3',
            question_text: 'Which article of the Indian Constitution deals with the Right to Education?',
            question_type: 'mcq',
            marks: 2,
            options: [
              { id: 'a', option_text: 'Article 19', is_correct: false },
              { id: 'b', option_text: 'Article 21A', is_correct: true },
              { id: 'c', option_text: 'Article 25', is_correct: false },
              { id: 'd', option_text: 'Article 32', is_correct: false }
            ],
            user_answer: 'b',
            correct_answer: 'b',
            is_correct: true,
            marks_obtained: 2,
            time_spent: 90,
            explanation: 'Article 21A was inserted by the 86th Constitutional Amendment Act, 2002, making education a fundamental right.',
            topic: 'Constitutional Law',
            difficulty: 'medium'
          },
          {
            id: '4',
            question_text: 'The concept of "Sustainable Development" was first mentioned in which report?',
            question_type: 'mcq',
            marks: 2,
            options: [
              { id: 'a', option_text: 'Brundtland Report', is_correct: true },
              { id: 'b', option_text: 'Club of Rome Report', is_correct: false },
              { id: 'c', option_text: 'Stockholm Report', is_correct: false },
              { id: 'd', option_text: 'Rio Report', is_correct: false }
            ],
            user_answer: 'c',
            correct_answer: 'a',
            is_correct: false,
            marks_obtained: 0,
            time_spent: 120,
            explanation: 'The Brundtland Report (Our Common Future) published in 1987 first defined sustainable development.',
            topic: 'Environment',
            difficulty: 'hard'
          },
          {
            id: '5',
            question_text: 'Which Indian state has the longest coastline?',
            question_type: 'mcq',
            marks: 2,
            options: [
              { id: 'a', option_text: 'Tamil Nadu', is_correct: false },
              { id: 'b', option_text: 'Gujarat', is_correct: true },
              { id: 'c', option_text: 'Andhra Pradesh', is_correct: false },
              { id: 'd', option_text: 'Kerala', is_correct: false }
            ],
            user_answer: 'b',
            correct_answer: 'b',
            is_correct: true,
            marks_obtained: 2,
            time_spent: 30,
            explanation: 'Gujarat has the longest coastline in India, stretching about 1,600 kilometers.',
            topic: 'Indian Geography',
            difficulty: 'medium'
          }
        ]
      };

      setResult(mockResult);
    } catch (error) {
      console.error('Failed to fetch test result:', error);
      toast.error('Failed to load test result');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'average': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 75) return 'good';
    if (percentage >= 60) return 'average';
    return 'poor';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Result not found</h2>
        <Button onClick={() => router.push('/dashboard/results')}>
          <Home className="mr-2 h-4 w-4" />
          Back to Results
        </Button>
      </div>
    );
  }

  const performanceLevel = getPerformanceLevel(result.percentage);
  const correctQuestions = result.questions.filter(q => q.is_correct);
  const incorrectQuestions = result.questions.filter(q => !q.is_correct);
  
  const topicWiseAnalysis = result.questions.reduce((acc, question) => {
    if (!question.topic) return acc;
    if (!acc[question.topic]) {
      acc[question.topic] = { total: 0, correct: 0 };
    }
    acc[question.topic].total++;
    if (question.is_correct) {
      acc[question.topic].correct++;
    }
    return acc;
  }, {} as Record<string, { total: number; correct: number }>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">{result.test_name}</h1>
                <p className="text-sm text-muted-foreground">{result.exam_name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge className={cn("text-lg px-4 py-2", getStatusColor(performanceLevel))}>
                {result.percentage}% ({performanceLevel.toUpperCase()})
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="questions">Question Review</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Performance Overview */}
                <div className="grid md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Score</p>
                          <p className="text-2xl font-bold">{result.score}/{result.total_marks}</p>
                        </div>
                        <Trophy className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Accuracy</p>
                          <p className="text-2xl font-bold">{result.percentage}%</p>
                        </div>
                        <Target className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Correct</p>
                          <p className="text-2xl font-bold text-green-600">{correctQuestions.length}</p>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Incorrect</p>
                          <p className="text-2xl font-bold text-red-600">{incorrectQuestions.length}</p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Topic-wise Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Topic-wise Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(topicWiseAnalysis).map(([topic, stats]) => {
                        const percentage = Math.round((stats.correct / stats.total) * 100);
                        return (
                          <div key={topic} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{topic}</span>
                              <span>{stats.correct}/{stats.total} ({percentage}%)</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="questions" className="space-y-6">
                <div className="grid lg:grid-cols-4 gap-6">
                  {/* Question List */}
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Questions</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="space-y-1 max-h-96 overflow-y-auto">
                          {result.questions.map((question, index) => (
                            <button
                              key={question.id}
                              onClick={() => setSelectedQuestion(index)}
                              className={cn(
                                "w-full p-3 text-left hover:bg-muted transition-colors border-l-4",
                                selectedQuestion === index ? "bg-muted" : "",
                                question.is_correct ? "border-l-green-500" : "border-l-red-500"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Q{index + 1}</span>
                                <div className="flex items-center gap-1">
                                  {question.is_correct ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {question.marks_obtained}/{question.marks}
                                  </span>
                                </div>
                              </div>
                              {question.topic && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {question.topic}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Question Detail */}
                  <div className="lg:col-span-3">
                    {result.questions[selectedQuestion] && (
                      <Card>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                Question {selectedQuestion + 1}
                                {result.questions[selectedQuestion].is_correct ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-4 mt-2">
                                <span>Marks: {result.questions[selectedQuestion].marks_obtained}/{result.questions[selectedQuestion].marks}</span>
                                <span>Time: {formatTime(result.questions[selectedQuestion].time_spent)}</span>
                                {result.questions[selectedQuestion].difficulty && (
                                  <Badge variant="outline" className={getDifficultyColor(result.questions[selectedQuestion].difficulty)}>
                                    {result.questions[selectedQuestion].difficulty}
                                  </Badge>
                                )}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <h4 className="font-medium mb-3">Question:</h4>
                            <p className="text-gray-700">{result.questions[selectedQuestion].question_text}</p>
                          </div>

                          {result.questions[selectedQuestion].options && (
                            <div>
                              <h4 className="font-medium mb-3">Options:</h4>
                              <div className="space-y-2">
                                {result.questions[selectedQuestion].options!.map((option) => {
                                  const isUserAnswer = result.questions[selectedQuestion].user_answer === option.id;
                                  const isCorrect = option.is_correct;
                                  
                                  return (
                                    <div
                                      key={option.id}
                                      className={cn(
                                        "p-3 rounded-lg border",
                                        isCorrect && "border-green-500 bg-green-50",
                                        isUserAnswer && !isCorrect && "border-red-500 bg-red-50",
                                        !isCorrect && !isUserAnswer && "border-gray-200"
                                      )}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>{option.id.toUpperCase()}. {option.option_text}</span>
                                        <div className="flex items-center gap-2">
                                          {isUserAnswer && (
                                            <Badge variant="outline">Your Answer</Badge>
                                          )}
                                          {isCorrect && (
                                            <Badge className="bg-green-100 text-green-800">Correct</Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {result.questions[selectedQuestion].explanation && (
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" />
                                Explanation:
                              </h4>
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-blue-900">{result.questions[selectedQuestion].explanation}</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(topicWiseAnalysis)
                          .filter(([, stats]) => (stats.correct / stats.total) >= 0.8)
                          .map(([topic, stats]) => (
                            <div key={topic} className="flex items-center gap-3">
                              <ThumbsUp className="h-4 w-4 text-green-500" />
                              <div>
                                <p className="font-medium">{topic}</p>
                                <p className="text-sm text-muted-foreground">
                                  {Math.round((stats.correct / stats.total) * 100)}% accuracy
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Areas for Improvement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(topicWiseAnalysis)
                          .filter(([, stats]) => (stats.correct / stats.total) < 0.6)
                          .map(([topic, stats]) => (
                            <div key={topic} className="flex items-center gap-3">
                              <ThumbsDown className="h-4 w-4 text-red-500" />
                              <div>
                                <p className="font-medium">{topic}</p>
                                <p className="text-sm text-muted-foreground">
                                  {Math.round((stats.correct / stats.total) * 100)}% accuracy
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Study Focus</p>
                          <p className="text-sm text-muted-foreground">
                            Focus on {Object.entries(topicWiseAnalysis)
                              .filter(([, stats]) => (stats.correct / stats.total) < 0.6)
                              .map(([topic]) => topic)
                              .join(', ')} for better performance.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <RotateCcw className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Practice More</p>
                          <p className="text-sm text-muted-foreground">
                            Take more practice tests to improve your speed and accuracy.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Duration</span>
                  <span className="text-sm font-medium">{result.duration_minutes} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Questions</span>
                  <span className="text-sm font-medium">{result.questions_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Attempted</span>
                  <span className="text-sm font-medium">{result.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg. Time/Q</span>
                  <span className="text-sm font-medium">
                    {formatTime(Math.round(result.questions.reduce((acc, q) => acc + q.time_spent, 0) / result.questions.length))}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button className="w-full" onClick={() => router.push('/dashboard/results')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View All Results
              </Button>
              
              <Button variant="outline" className="w-full" onClick={() => router.push('/exams')}>
                <BookOpen className="mr-2 h-4 w-4" />
                Take Another Test
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}