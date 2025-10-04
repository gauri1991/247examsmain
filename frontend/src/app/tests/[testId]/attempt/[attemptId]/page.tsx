'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { TestAttemptHeader } from '@/components/test/TestAttemptHeader';
import { QuestionNavigationGrid } from '@/components/test/QuestionNavigationGrid';
import { QuestionDisplay } from '@/components/test/QuestionDisplay';
import { TestSubmissionModal } from '@/components/test/TestSubmissionModal';
import { TestInstructions } from '@/components/test/TestInstructions';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface Question {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'multi_select' | 'true_false' | 'fill_blank' | 'essay';
  marks: number;
  image?: string;
  options?: Array<{
    id: string;
    option_text: string;
    is_correct: boolean;
  }>;
}

interface TestQuestion {
  id: string;
  question: Question;
  order: number;
  marks: number;
}

interface UserAnswer {
  question_id: string;
  selected_options?: string[];
  text_answer?: string;
  boolean_answer?: boolean;
  marked_for_review: boolean;
}

export default function TestAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const testId = params.testId as string;
  const attemptId = params.attemptId as string;
  
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showQuestionNav, setShowQuestionNav] = useState(true);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);

  // Security: Prevent navigation away from test
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!showInstructions && attempt?.status === 'in_progress') {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your test progress will be lost.';
        return 'Are you sure you want to leave? Your test progress will be lost.';
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common shortcuts that could be used to cheat
      if (
        e.key === 'F12' || // Developer tools
        (e.ctrlKey && e.shiftKey && e.key === 'I') || // Developer tools
        (e.ctrlKey && e.shiftKey && e.key === 'C') || // Element inspector
        (e.ctrlKey && e.key === 'u') || // View source
        (e.ctrlKey && e.key === 'r') || // Refresh
        (e.key === 'F5') || // Refresh
        (e.altKey && e.key === 'Tab') || // Alt+Tab
        (e.ctrlKey && e.key === 'Tab') // Ctrl+Tab
      ) {
        e.preventDefault();
        toast.error('This action is not allowed during the test');
      }
    };

    if (!showInstructions) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('keydown', handleKeyDown);
      
      // Disable right-click context menu
      document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', (e) => e.preventDefault());
    };
  }, [showInstructions, attempt?.status]);

  // Fullscreen functionality
  useEffect(() => {
    const enterFullscreen = async () => {
      if (!showInstructions && !document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        } catch (error) {
          console.warn('Could not enter fullscreen mode:', error);
        }
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement && !showInstructions && attempt?.status === 'in_progress') {
        // Show warning temporarily and then auto-submit
        setShowFullscreenWarning(true);
        setTimeout(() => {
          toast.error('Test submitted due to exiting fullscreen mode');
          handleSubmitTest();
        }, 3000); // Give 3 seconds warning before auto-submit
      }
    };

    if (!showInstructions) {
      enterFullscreen();
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [showInstructions]);

  // Fetch attempt details and questions
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }

    fetchAttemptData();
  }, [isAuthenticated, attemptId]);

  const fetchAttemptData = async () => {
    try {
      // Fetch attempt details
      const attemptResponse = await apiService.getTestAttempt(attemptId);
      setAttempt(attemptResponse);

      // Calculate remaining time
      const startTime = new Date(attemptResponse.start_time);
      const durationMs = attemptResponse.test.duration_minutes * 60 * 1000;
      const elapsedMs = Date.now() - startTime.getTime();
      const remainingMs = Math.max(0, durationMs - elapsedMs);
      const remainingSeconds = Math.floor(remainingMs / 1000);
      
      console.log('Timer Debug:', {
        startTime: attemptResponse.start_time,
        durationMinutes: attemptResponse.test.duration_minutes,
        durationMs,
        elapsedMs,
        remainingMs,
        remainingSeconds
      });
      
      setTimeRemaining(remainingSeconds);

      // Fetch test questions
      const questionsResponse = await apiService.getTestAttemptQuestions(attemptId);
      setQuestions(questionsResponse);

      // Fetch existing answers
      const answersResponse = await apiService.getTestAttemptAnswers(attemptId);
      const answersMap: Record<string, UserAnswer> = {};
      answersResponse.forEach((answer: any) => {
        answersMap[answer.question_id] = {
          question_id: answer.question_id,
          selected_options: answer.selected_options || [],
          text_answer: answer.text_answer || '',
          boolean_answer: answer.boolean_answer,
          marked_for_review: answer.marked_for_review || false,
        };
      });
      setAnswers(answersMap);

    } catch (error) {
      console.error('Failed to fetch attempt data:', error);
      toast.error('Failed to load test data');
      router.push('/exams');
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown - runs continuously and syncs with server time
  useEffect(() => {
    if (!attempt || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      // Calculate real-time remaining based on server start time
      const startTime = new Date(attempt.start_time);
      const durationMs = attempt.test.duration_minutes * 60 * 1000;
      const elapsedMs = Date.now() - startTime.getTime();
      const remainingMs = Math.max(0, durationMs - elapsedMs);
      const remainingSeconds = Math.floor(remainingMs / 1000);
      
      setTimeRemaining(remainingSeconds);
      
      // Auto-submit when time expires
      if (remainingSeconds <= 0) {
        clearInterval(timer);
        toast.error('Time expired! Test submitted automatically.');
        handleSubmitTest();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt]); // Only depend on attempt, not timeRemaining to prevent restart loops

  // Save answer to backend
  const saveAnswer = useCallback(async (questionId: string, answerData: Partial<UserAnswer>) => {
    if (saving) return;
    
    setSaving(true);
    try {
      await apiService.autoSaveTestAnswers(attemptId, {
        [questionId]: answerData
      });
    } catch (error) {
      console.error('Failed to save answer:', error);
      toast.error('Failed to save answer');
    } finally {
      setSaving(false);
    }
  }, [attemptId, saving]);

  // Update answer in state and save
  const updateAnswer = (questionId: string, answerData: Partial<UserAnswer>) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        question_id: questionId,
        ...answerData
      }
    }));

    // Debounced save
    saveAnswer(questionId, answerData);
  };

  // Navigation functions
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const saveAndNext = () => {
    nextQuestion();
  };

  // Clear answer for current question
  const clearAnswer = (questionId: string) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });

    // Clear on backend too
    saveAnswer(questionId, {});
  };

  // Mark question for review
  const toggleMarkForReview = (questionId: string) => {
    const currentAnswer = answers[questionId] || { question_id: questionId };
    updateAnswer(questionId, {
      ...currentAnswer,
      marked_for_review: !currentAnswer.marked_for_review
    });
  };

  // Submit test
  const handleSubmitTest = async () => {
    try {
      await apiService.submitTestAttempt(attemptId);
      
      toast.success('Test submitted successfully!');
      router.push(`/tests/${testId}/results/${attemptId}`);
    } catch (error) {
      console.error('Failed to submit test:', error);
      toast.error('Failed to submit test');
    }
  };

  // Handle instructions confirmation
  const handleInstructionsConfirm = () => {
    setShowInstructions(false);
    toast.success('Test started! Good luck!');
  };

  // Handle test exit confirmation
  const handleExitTest = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      router.push('/exams');
    } catch (error) {
      router.push('/exams');
    }
  };

  // Calculate progress
  const answeredCount = Object.keys(answers).length;

  // Get question state for navigation
  const getQuestionState = (index: number): 'current' | 'answered' | 'marked' | 'answered-marked' | 'unanswered' => {
    const question = questions[index];
    if (!question) return 'unanswered';

    const answer = answers[question.question.id];
    const isAnswered = answer && (
      (answer.selected_options && answer.selected_options.length > 0) ||
      (answer.text_answer && answer.text_answer.trim() !== '') ||
      (answer.boolean_answer !== undefined)
    );
    const isMarked = answer?.marked_for_review || false;

    if (index === currentQuestionIndex) return 'current';
    if (isAnswered && isMarked) return 'answered-marked';
    if (isAnswered) return 'answered';
    if (isMarked) return 'marked';
    return 'unanswered';
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

  if (!attempt || !questions.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Test not found</h2>
          <button 
            onClick={() => router.push('/exams')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  // Show instructions first
  if (showInstructions) {
    return (
      <TestInstructions
        testTitle={attempt.test.title}
        duration={attempt.test.duration_minutes}
        totalQuestions={attempt.total_questions}
        totalMarks={attempt.test.total_marks}
        negativeMarking={false} // You can add this field to your test model if needed
        onConfirm={handleInstructionsConfirm}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Security Warning for Fullscreen */}
      {showFullscreenWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3 flex items-center justify-center animate-pulse">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">
            ⚠️ WARNING: Test will be submitted in 3 seconds due to exiting fullscreen mode
          </span>
        </div>
      )}

      {/* Secure Test Header with Timer Only */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-semibold text-gray-900">
              {attempt?.test.title}
            </h1>
            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Timer Display */}
            <div className="flex items-center space-x-2">
              <div className="text-lg font-mono font-bold text-red-600">
                {loading ? (
                  "--:--:--"
                ) : timeRemaining >= 0 ? (
                  <>
                    {Math.floor(timeRemaining / 3600).toString().padStart(2, '0')}:
                    {Math.floor((timeRemaining % 3600) / 60).toString().padStart(2, '0')}:
                    {(timeRemaining % 60).toString().padStart(2, '0')}
                  </>
                ) : (
                  "00:00:00"
                )}
              </div>
              <span className="text-sm text-gray-500">Time Left</span>
            </div>
            
            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>

      {/* Main Test Interface - Fullscreen Layout */}
      <div className="h-[calc(100vh-160px)] flex relative">
        {/* Main Content Area - Split into Question and Answer Panels */}
        <div className="flex-1 flex overflow-hidden">
          {/* Question Panel - Left Side */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto bg-white">
            <div className="p-6">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-semibold text-gray-900">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {currentQuestion?.marks} mark{currentQuestion?.marks !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Question Content */}
              <div className="prose max-w-none">
                <div className="text-gray-900 text-base leading-relaxed mb-4">
                  {currentQuestion?.question.question_text}
                </div>
                
                {/* Question Image if exists */}
                {currentQuestion?.question.image && (
                  <div className="mt-4 mb-6">
                    <img 
                      src={currentQuestion.question.image} 
                      alt="Question illustration"
                      className="max-w-full h-auto rounded-lg border shadow-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Answer Panel - Right Side */}
          <div className="w-1/2 overflow-y-auto bg-gray-50">
            <div className="p-6">
              {/* Answer Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Answer</h3>
                <div className="flex items-center space-x-2">
                  {saving && (
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                      Saving...
                    </div>
                  )}
                </div>
              </div>

              {/* Question Actions */}
              <div className="flex items-center space-x-2 mb-6">
                <button
                  onClick={() => toggleMarkForReview(currentQuestion.question.id)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    answers[currentQuestion.question.id]?.marked_for_review
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
                  }`}
                >
                  {answers[currentQuestion.question.id]?.marked_for_review ? 'Marked' : 'Mark for Review'}
                </button>
                <button
                  onClick={() => clearAnswer(currentQuestion.question.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  Clear Answer
                </button>
              </div>

              {/* Answer Options/Input based on question type */}
              <div className="space-y-4">
                {currentQuestion?.question.question_type === 'mcq' && (
                  <div className="space-y-3">
                    {currentQuestion.question.options?.map((option, index) => (
                      <label
                        key={option.id}
                        className="flex items-center p-3 border rounded-lg hover:bg-white cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.question.id}`}
                          value={option.id}
                          checked={answers[currentQuestion.question.id]?.selected_options?.includes(option.id)}
                          onChange={(e) => updateAnswer(currentQuestion.question.id, {
                            selected_options: [e.target.value]
                          })}
                          className="w-4 h-4 text-blue-600 mr-3"
                        />
                        <span className="text-gray-900">{option.option_text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion?.question.question_type === 'multi_select' && (
                  <div className="space-y-3">
                    {currentQuestion.question.options?.map((option, index) => (
                      <label
                        key={option.id}
                        className="flex items-center p-3 border rounded-lg hover:bg-white cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          value={option.id}
                          checked={answers[currentQuestion.question.id]?.selected_options?.includes(option.id)}
                          onChange={(e) => {
                            const currentAnswers = answers[currentQuestion.question.id]?.selected_options || [];
                            const newAnswers = e.target.checked
                              ? [...currentAnswers, option.id]
                              : currentAnswers.filter(id => id !== option.id);
                            updateAnswer(currentQuestion.question.id, {
                              selected_options: newAnswers
                            });
                          }}
                          className="w-4 h-4 text-blue-600 mr-3"
                        />
                        <span className="text-gray-900">{option.option_text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion?.question.question_type === 'true_false' && (
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border rounded-lg hover:bg-white cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name={`question-${currentQuestion.question.id}`}
                        value="true"
                        checked={answers[currentQuestion.question.id]?.boolean_answer === true}
                        onChange={() => updateAnswer(currentQuestion.question.id, { boolean_answer: true })}
                        className="w-4 h-4 text-blue-600 mr-3"
                      />
                      <span className="text-gray-900">True</span>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg hover:bg-white cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name={`question-${currentQuestion.question.id}`}
                        value="false"
                        checked={answers[currentQuestion.question.id]?.boolean_answer === false}
                        onChange={() => updateAnswer(currentQuestion.question.id, { boolean_answer: false })}
                        className="w-4 h-4 text-blue-600 mr-3"
                      />
                      <span className="text-gray-900">False</span>
                    </label>
                  </div>
                )}

                {(currentQuestion?.question.question_type === 'fill_blank' || currentQuestion?.question.question_type === 'essay') && (
                  <div>
                    <textarea
                      value={answers[currentQuestion.question.id]?.text_answer || ''}
                      onChange={(e) => updateAnswer(currentQuestion.question.id, { text_answer: e.target.value })}
                      placeholder="Type your answer here..."
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-none"
                    />
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setShowQuestionNav(!showQuestionNav)}
          className={`absolute top-4 z-10 bg-white border border-gray-300 rounded-l-lg p-2 
                     hover:bg-gray-50 transition-all duration-300 shadow-sm ${
            showQuestionNav ? 'right-80' : 'right-0'
          }`}
          title={showQuestionNav ? 'Hide question navigation' : 'Show question navigation'}
        >
          {showQuestionNav ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Question Navigation Sidebar - Right Side */}
        <div className={`bg-gray-50 border-l border-gray-200 overflow-y-auto transition-all duration-300 ${
          showQuestionNav ? 'w-80' : 'w-0'
        }`}>
          {showQuestionNav && (
            <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">Question Navigation</h3>
            
            {/* Question Progress Summary */}
            <div className="mb-4 p-3 bg-white rounded-lg border">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span>Answered: {Object.keys(answers).length}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                  <span>Marked: {Object.values(answers).filter(a => a?.marked_for_review).length}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span>Current: {currentQuestionIndex + 1}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
                  <span>Not Visited: {questions.length - Object.keys(answers).length}</span>
                </div>
              </div>
            </div>

            {/* Question Grid - 5 columns responsive */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((question, index) => {
                const state = getQuestionState(index);
                const isAnswered = answers[question.question.id];
                const isMarked = isAnswered?.marked_for_review;
                
                let bgColor = 'bg-gray-200 text-gray-700'; // Not visited
                let borderColor = 'border-gray-300';
                
                if (state === 'current') {
                  bgColor = 'bg-blue-500 text-white';
                  borderColor = 'border-blue-600';
                } else if (state === 'answered-marked') {
                  bgColor = 'bg-orange-500 text-white';
                  borderColor = 'border-orange-600';
                } else if (state === 'answered') {
                  bgColor = 'bg-green-500 text-white';
                  borderColor = 'border-green-600';
                } else if (state === 'marked') {
                  bgColor = 'bg-yellow-500 text-white';
                  borderColor = 'border-yellow-600';
                }
                
                return (
                  <button
                    key={question.id}
                    onClick={() => goToQuestion(index)}
                    className={`aspect-square w-full rounded-lg border-2 ${bgColor} ${borderColor} 
                               hover:opacity-80 transition-all duration-200 flex items-center justify-center
                               font-semibold text-sm relative`}
                    title={`Question ${index + 1} - ${question.marks} mark${question.marks !== 1 ? 's' : ''} 
                            ${isAnswered ? '(Answered)' : ''} ${isMarked ? '(Marked)' : ''}`}
                  >
                    <span>{index + 1}</span>
                    {/* Small indicators for status */}
                    {isMarked && (
                      <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full transform translate-x-1 -translate-y-1"></div>
                    )}
                  </button>
                );
              })}
            </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Controls */}
      <div className="h-20 bg-white border-t border-gray-200 px-6 flex items-center justify-between">
        <button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </button>

        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className="text-sm text-gray-500">
            {saving ? 'Saving...' : 'Auto-saved'}
          </div>
        </div>

        <button
          onClick={saveAndNext}
          disabled={currentQuestionIndex === questions.length - 1}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Save & Next'}
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>

      {/* Submit Confirmation Modal */}
      <TestSubmissionModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleSubmitTest}
        answeredCount={answeredCount}
        totalQuestions={attempt.total_questions}
      />
    </div>
  );
}