import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { showErrorToast } from '@/lib/error-handler';

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

interface UseTestResumptionOptions {
  userId?: string;
  refreshInterval?: number;
  includeExpired?: boolean;
}

export function useTestResumption(options: UseTestResumptionOptions = {}) {
  const {
    userId,
    refreshInterval = 30000, // 30 seconds
    includeExpired = false
  } = options;

  const [sessions, setSessions] = useState<TestAttemptSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch resumable sessions
  const fetchResumableSessions = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // In production, this would be an API call
      // const response = await apiRequest(`/exams/attempts/resumable/?user_id=${userId}&include_expired=${includeExpired}`);
      
      // Mock data for demonstration
      const mockSessions: TestAttemptSession[] = [
        {
          id: 'attempt_001',
          testId: 'test_123',
          testName: 'SSC CGL Mock Test 1',
          examName: 'SSC Combined Graduate Level',
          status: 'in_progress',
          currentQuestionIndex: 15,
          answers: {
            'q1': 'b',
            'q2': 'true',
            'q3': 'Jupiter',
            // ... more answers
          },
          flaggedQuestions: ['q5', 'q12', 'q18'],
          timeRemaining: 2400, // 40 minutes in seconds
          lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
          totalQuestions: 100,
          progressPercentage: 15,
          startedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 minutes ago
          canResume: true
        },
        {
          id: 'attempt_002',
          testId: 'test_456',
          testName: 'UPSC Prelims Practice Test',
          examName: 'UPSC Civil Services Preliminary',
          status: 'paused',
          currentQuestionIndex: 45,
          answers: {
            'q1': 'a',
            'q2': 'false',
            // ... more answers
          },
          flaggedQuestions: ['q10', 'q25', 'q30', 'q42'],
          timeRemaining: 5400, // 90 minutes in seconds
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          totalQuestions: 100,
          progressPercentage: 45,
          startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
          canResume: true
        },
        {
          id: 'attempt_003',
          testId: 'test_789',
          testName: 'Banking Awareness Test',
          examName: 'IBPS PO',
          status: 'expired',
          currentQuestionIndex: 8,
          answers: {
            'q1': 'c',
            'q2': 'true',
          },
          flaggedQuestions: ['q5'],
          timeRemaining: 0,
          lastActivity: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
          totalQuestions: 50,
          progressPercentage: 16,
          startedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 26 hours ago
          canResume: false
        }
      ];

      // Filter sessions based on options
      let filteredSessions = mockSessions.filter(session => {
        if (!includeExpired && session.status === 'expired') {
          return false;
        }
        return session.canResume || includeExpired;
      });

      setSessions(filteredSessions);
    } catch (err: any) {
      console.error('Failed to fetch resumable sessions:', err);
      setError(err);
      showErrorToast(err);
    } finally {
      setLoading(false);
    }
  }, [userId, includeExpired]);

  // Resume a test attempt
  const resumeTestAttempt = useCallback(async (attemptId: string) => {
    try {
      // In production, this would validate and prepare the session for resumption
      // await apiRequest(`/exams/attempts/${attemptId}/resume/`, { method: 'POST' });
      
      // For now, just return the resume URL
      const session = sessions.find(s => s.id === attemptId);
      if (session) {
        return `/tests/${session.testId}/attempt/${attemptId}`;
      }
      
      throw new Error('Test attempt not found');
    } catch (err: any) {
      console.error('Failed to resume test attempt:', err);
      showErrorToast(err);
      throw err;
    }
  }, [sessions]);

  // Pause a test attempt
  const pauseTestAttempt = useCallback(async (attemptId: string) => {
    try {
      // In production, this would pause the test and save current state
      // await apiRequest(`/exams/attempts/${attemptId}/pause/`, { method: 'POST' });
      
      // Update local state
      setSessions(prev => prev.map(session => 
        session.id === attemptId 
          ? { ...session, status: 'paused', lastActivity: new Date().toISOString() }
          : session
      ));
      
      return true;
    } catch (err: any) {
      console.error('Failed to pause test attempt:', err);
      showErrorToast(err);
      throw err;
    }
  }, []);

  // Delete/abandon a test attempt
  const abandonTestAttempt = useCallback(async (attemptId: string) => {
    try {
      // In production, this would mark the attempt as abandoned
      // await apiRequest(`/exams/attempts/${attemptId}/abandon/`, { method: 'POST' });
      
      // Remove from local state
      setSessions(prev => prev.filter(session => session.id !== attemptId));
      
      return true;
    } catch (err: any) {
      console.error('Failed to abandon test attempt:', err);
      showErrorToast(err);
      throw err;
    }
  }, []);

  // Get session details
  const getSessionDetails = useCallback((attemptId: string) => {
    return sessions.find(session => session.id === attemptId);
  }, [sessions]);

  // Check if any sessions can be resumed
  const hasResumableSessions = sessions.filter(s => s.canResume && s.status !== 'expired').length > 0;

  // Get sessions by status
  const getSessionsByStatus = useCallback((status: TestAttemptSession['status']) => {
    return sessions.filter(session => session.status === status);
  }, [sessions]);

  // Get recently active sessions (within last hour)
  const getRecentSessions = useCallback(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return sessions.filter(session => 
      new Date(session.lastActivity) > oneHourAgo && session.canResume
    );
  }, [sessions]);

  // Format time remaining
  const formatTimeRemaining = useCallback((seconds: number) => {
    if (seconds <= 0) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Format relative time for last activity
  const formatLastActivity = useCallback((timestamp: string) => {
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
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchResumableSessions();
  }, [fetchResumableSessions]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchResumableSessions, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchResumableSessions, refreshInterval]);

  return {
    sessions,
    loading,
    error,
    hasResumableSessions,
    resumeTestAttempt,
    pauseTestAttempt,
    abandonTestAttempt,
    getSessionDetails,
    getSessionsByStatus,
    getRecentSessions,
    formatTimeRemaining,
    formatLastActivity,
    refresh: fetchResumableSessions
  };
}

// Hook for managing single test session state
export function useTestSession(attemptId: string) {
  const [sessionData, setSessionData] = useState<{
    answers: Record<string, any>;
    flaggedQuestions: Set<string>;
    currentQuestionIndex: number;
    timeRemaining: number;
    lastSaved: Date | null;
  }>({
    answers: {},
    flaggedQuestions: new Set(),
    currentQuestionIndex: 0,
    timeRemaining: 0,
    lastSaved: null
  });

  // Load session data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(`test_session_${attemptId}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setSessionData({
          ...parsed,
          flaggedQuestions: new Set(parsed.flaggedQuestions || []),
          lastSaved: parsed.lastSaved ? new Date(parsed.lastSaved) : null
        });
      } catch (error) {
        console.error('Failed to load session data:', error);
      }
    }
  }, [attemptId]);

  // Save session data to localStorage
  const saveSessionData = useCallback((data: Partial<typeof sessionData>) => {
    const newData = { ...sessionData, ...data, lastSaved: new Date() };
    setSessionData(newData);
    
    // Save to localStorage
    const dataToSave = {
      ...newData,
      flaggedQuestions: Array.from(newData.flaggedQuestions)
    };
    localStorage.setItem(`test_session_${attemptId}`, JSON.stringify(dataToSave));
  }, [attemptId, sessionData]);

  // Clear session data
  const clearSessionData = useCallback(() => {
    localStorage.removeItem(`test_session_${attemptId}`);
    setSessionData({
      answers: {},
      flaggedQuestions: new Set(),
      currentQuestionIndex: 0,
      timeRemaining: 0,
      lastSaved: null
    });
  }, [attemptId]);

  return {
    sessionData,
    saveSessionData,
    clearSessionData
  };
}