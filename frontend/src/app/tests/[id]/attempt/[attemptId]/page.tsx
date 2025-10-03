'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuestionRenderer } from '@/components/question-types/QuestionRenderer';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2, 
  AlertCircle, BookOpen, Send, Home
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { showErrorToast, showSuccessToast } from '@/lib/error-handler';
import { TestAttemptLoading } from '@/components/ui/loading-states';
import { ErrorBoundary, TestErrorFallback } from '@/components/ui/error-boundary';
import { useAutoSave } from '@/hooks/useAutoSave';
import { AutoSaveIndicator, CompactAutoSaveIndicator } from '@/components/test/AutoSaveIndicator';
import { useTestSession } from '@/hooks/useTestResumption';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  marks: number;
  options?: {
    id: string;
    option_text: string;
    is_correct?: boolean;
  }[];
  statement?: string;
  reason?: string;
}

interface TestAttempt {
  id: string;
  test_name: string;
  exam_name: string;
  status: string;
  total_questions: number;
  duration_minutes: number;
  total_marks: number;
}

export default function TestAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;
  const attemptId = params.attemptId as string;
  const { isAuthenticated } = useAuth();

  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  
  // Session management for resumption
  const { sessionData, saveSessionData, clearSessionData } = useTestSession(attemptId);

  // Auto-save configuration - temporarily disabled due to mock data
  const autoSaveConfig = {
    enabled: false, // Disabled until real test attempts are used
    interval: 30, // Auto-save every 30 seconds
    saveOnNavigation: true,
    saveOnFocusLoss: true
  };

  // Auto-save hook
  const {
    updateAnswer: autoSaveUpdateAnswer,
    saveNow: manualSave,
    isLoading: autoSaveLoading,
    unsavedChanges,
    lastSaveTime
  } = useAutoSave({
    testAttemptId: attemptId,
    config: autoSaveConfig,
    onSaveSuccess: () => {
      // Optional: Show subtle success indication
    },
    onSaveError: (error) => {
      console.error('Auto-save error:', error);
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }
    
    if (testId && attemptId) {
      fetchTestData();
    }
  }, [testId, attemptId, isAuthenticated]);

  // Restore session data when available
  useEffect(() => {
    if (sessionData.answers && Object.keys(sessionData.answers).length > 0) {
      setAnswers(sessionData.answers);
      setCurrentQuestionIndex(sessionData.currentQuestionIndex);
      setFlaggedQuestions(sessionData.flaggedQuestions);
      if (sessionData.timeRemaining > 0) {
        setTimeLeft(sessionData.timeRemaining);
      }
    }
  }, [sessionData]);

  useEffect(() => {
    // Timer countdown
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => {
        const newTimeLeft = timeLeft - 1;
        setTimeLeft(newTimeLeft);
        
        // Save updated time to session every 10 seconds
        if (newTimeLeft % 10 === 0) {
          saveSessionData({
            answers,
            currentQuestionIndex,
            flaggedQuestions,
            timeRemaining: newTimeLeft
          });
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      // Auto-submit when time runs out
      handleSubmit();
    }
  }, [timeLeft, answers, currentQuestionIndex, flaggedQuestions, saveSessionData]);

  const fetchTestData = async () => {
    try {
      // TODO: Replace with actual API call once backend is ready
      // const attempt = await apiRequest(`/exams/attempts/${attemptId}/`, { retries: 2 });
      // const questions = await apiRequest(`/exams/attempts/${attemptId}/questions/`, { retries: 2 });
      
      // For now, create mock data since questions API isn't ready
      // In production, this would fetch from API
      setAttempt({
        id: attemptId,
        test_name: 'Sample Test',
        exam_name: 'Sample Exam',
        status: 'in_progress',
        total_questions: 5,
        duration_minutes: 60,
        total_marks: 100
      });

      // Mock questions with different types
      setQuestions([
        {
          id: '1',
          question_text: 'What is the capital of India?',
          question_type: 'mcq',
          marks: 20,
          options: [
            { id: 'a', option_text: 'Mumbai' },
            { id: 'b', option_text: 'New Delhi' },
            { id: 'c', option_text: 'Bangalore' },
            { id: 'd', option_text: 'Kolkata' }
          ]
        },
        {
          id: '2',
          question_text: 'The Earth revolves around the Sun.',
          question_type: 'true_false',
          marks: 15
        },
        {
          id: '3',
          question_text: 'Fill in the blank: The largest planet in our solar system is ________.',
          question_type: 'fill_blank',
          marks: 20
        },
        {
          id: '4',
          question_text: 'Consider the following statement and reason:',
          question_type: 'statement_reason',
          marks: 25,
          statement: 'India is a democratic country.',
          reason: 'India follows a parliamentary system of government.'
        },
        {
          id: '5',
          question_text: 'Which of the following are prime numbers? (Select all that apply)',
          question_type: 'multi_select',
          marks: 20,
          options: [
            { id: 'a', option_text: '2' },
            { id: 'b', option_text: '4' },
            { id: 'c', option_text: '7' },
            { id: 'd', option_text: '9' },
            { id: 'e', option_text: '11' }
          ]
        }
      ]);

      setTimeLeft(60 * 60); // 60 minutes in seconds
    } catch (error) {
      console.error('Failed to fetch test data:', error);
      showErrorToast(error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    const newAnswers = {
      ...answers,
      [questionId]: value
    };
    setAnswers(newAnswers);
    
    // Save to session for resumption
    saveSessionData({
      answers: newAnswers,
      currentQuestionIndex,
      flaggedQuestions,
      timeRemaining: timeLeft || 0
    });
    
    // Trigger auto-save
    autoSaveUpdateAnswer(questionId, value);
  };

  const handleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      
      // Save to session for resumption
      saveSessionData({
        answers,
        currentQuestionIndex,
        flaggedQuestions: newSet,
        timeRemaining: timeLeft || 0
      });
      
      return newSet;
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      
      // Save to session for resumption
      saveSessionData({
        answers,
        currentQuestionIndex: newIndex,
        flaggedQuestions,
        timeRemaining: timeLeft || 0
      });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      
      // Save to session for resumption
      saveSessionData({
        answers,
        currentQuestionIndex: newIndex,
        flaggedQuestions,
        timeRemaining: timeLeft || 0
      });
    }
  };

  const handleQuestionJump = (index: number) => {
    setCurrentQuestionIndex(index);
    
    // Save to session for resumption
    saveSessionData({
      answers,
      currentQuestionIndex: index,
      flaggedQuestions,
      timeRemaining: timeLeft || 0
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Submit answers to API
      const response = await apiRequest(`/exams/attempts/${attemptId}/submit/`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
        retries: 2 // Retry failed submissions
      });

      // Clear session data on successful submission
      clearSessionData();
      
      showSuccessToast('Test submitted successfully!');
      router.push(`/tests/${testId}/result/${attemptId}`);
    } catch (error) {
      console.error('Failed to submit test:', error);
      showErrorToast(error);
      // For now, just redirect to dashboard on submission errors
      // In production, we might want to keep the user on the test page
      // and allow them to retry submission
      router.push('/dashboard');
    } finally {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (questionId: string) => {
    const answer = answers[questionId];
    if (answer && (typeof answer === 'string' || (Array.isArray(answer) && answer.length > 0))) {
      return 'answered';
    }
    if (flaggedQuestions.has(questionId)) return 'flagged';
    return 'unanswered';
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <TestAttemptLoading />;
  }

  if (!attempt || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Test not found</h2>
        <Button onClick={() => router.push('/dashboard')}>
          <Home className="mr-2 h-4 w-4" />
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.values(answers).filter(answer => 
    answer && (typeof answer === 'string' || (Array.isArray(answer) && answer.length > 0))
  ).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  return (
    <ErrorBoundary fallback={TestErrorFallback}>
      <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{attempt.test_name}</h1>
              <p className="text-sm text-muted-foreground">{attempt.exam_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-lg">
                  {timeLeft !== null ? formatTime(timeLeft) : '--:--:--'}
                </span>
              </div>
              
              {/* Auto-save indicator - desktop */}
              <div className="hidden md:block">
                <AutoSaveIndicator
                  isLoading={autoSaveLoading}
                  unsavedChanges={unsavedChanges}
                  lastSaveTime={lastSaveTime}
                  onManualSave={manualSave}
                />
              </div>
              
              {/* Auto-save indicator - mobile */}
              <div className="md:hidden">
                <CompactAutoSaveIndicator
                  isLoading={autoSaveLoading}
                  unsavedChanges={unsavedChanges}
                  lastSaveTime={lastSaveTime}
                  onManualSave={manualSave}
                />
              </div>
              
              <Button
                variant="destructive"
                onClick={() => setShowSubmitDialog(true)}
                disabled={submitting}
              >
                <Send className="mr-2 h-4 w-4" />
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                    <CardDescription>Marks: {currentQuestion.marks}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFlagQuestion(currentQuestion.id)}
                    className={flaggedQuestions.has(currentQuestion.id) ? 'text-orange-500' : ''}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <QuestionRenderer
                  question={currentQuestion}
                  value={answers[currentQuestion.id]}
                  onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                />

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigator */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Question Navigator</CardTitle>
                <CardDescription>
                  {answeredCount} of {questions.length} answered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={progressPercentage} className="mb-4" />
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, index) => {
                    const status = getQuestionStatus(q.id);
                    return (
                      <Button
                        key={q.id}
                        variant={currentQuestionIndex === index ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleQuestionJump(index)}
                        className={`
                          ${status === 'answered' ? 'bg-green-100 hover:bg-green-200 text-green-800' : ''}
                          ${status === 'flagged' ? 'bg-orange-100 hover:bg-orange-200 text-orange-800' : ''}
                        `}
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </div>
                
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 bg-green-100 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 bg-orange-100 rounded"></div>
                    <span>Flagged for Review</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 border rounded"></div>
                    <span>Not Answered</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this test? You have answered {answeredCount} out of {questions.length} questions.
              {questions.length - answeredCount > 0 && (
                <span className="block mt-2 text-orange-600">
                  Warning: {questions.length - answeredCount} questions are unanswered!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Test'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </ErrorBoundary>
  );
}