'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { toast } from 'sonner';

interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // seconds
  saveOnNavigation: boolean;
  saveOnFocusLoss: boolean;
}

interface UseAutoSaveOptions {
  testAttemptId: string;
  config: AutoSaveConfig;
  onSaveSuccess?: () => void;
  onSaveError?: (error: any) => void;
}

export function useAutoSave({ 
  testAttemptId, 
  config, 
  onSaveSuccess, 
  onSaveError 
}: UseAutoSaveOptions) {
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isLoading, setSaving] = useState(false);
  const answersRef = useRef<Record<string, any>>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<Record<string, any>>({});

  // Save answers to backend
  const saveAnswers = useCallback(async (answers: Record<string, any>, force = false) => {
    if (!config.enabled && !force) return;
    
    // Don't save if no changes since last save
    const hasChanges = JSON.stringify(answers) !== JSON.stringify(lastSaveRef.current);
    if (!hasChanges && !force) return;

    setSaving(true);
    try {
      await apiRequest(`/exams/attempts/${testAttemptId}/auto_save/`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });

      lastSaveRef.current = { ...answers };
      setLastSaveTime(new Date());
      setUnsavedChanges(false);
      onSaveSuccess?.();
      
      // Show subtle success indicator
      const now = new Date().toLocaleTimeString();
      console.log(`✓ Auto-saved at ${now}`);
      
    } catch (error) {
      console.error('Auto-save failed:', error);
      onSaveError?.(error);
      
      // Show error toast for auto-save failures
      toast.error('Auto-save failed. Your answers may not be saved.', {
        description: 'Please save manually or check your connection.',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  }, [testAttemptId, config.enabled, onSaveSuccess, onSaveError]);

  // Update answers and trigger auto-save
  const updateAnswer = useCallback((questionId: string, answer: any) => {
    answersRef.current[questionId] = answer;
    setUnsavedChanges(true);

    if (!config.enabled) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      saveAnswers(answersRef.current);
    }, config.interval * 1000);
  }, [config.enabled, config.interval, saveAnswers]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    return saveAnswers(answersRef.current, true);
  }, [saveAnswers]);

  // Save on navigation (before leaving question)
  useEffect(() => {
    if (!config.saveOnNavigation) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved answers. Are you sure you want to leave?';
        
        // Attempt to save synchronously (limited time)
        navigator.sendBeacon(
          `/api/v1/exams/attempts/${testAttemptId}/auto_save/`,
          JSON.stringify({ answers: answersRef.current })
        );
      }
    };

    const handleNavigation = () => {
      if (unsavedChanges) {
        saveNow();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleNavigation);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleNavigation);
    };
  }, [config.saveOnNavigation, unsavedChanges, saveNow, testAttemptId]);

  // Save on focus loss
  useEffect(() => {
    if (!config.saveOnFocusLoss) return;

    const handleFocusLoss = () => {
      if (unsavedChanges) {
        saveNow();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && unsavedChanges) {
        saveNow();
      }
    };

    window.addEventListener('blur', handleFocusLoss);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleFocusLoss);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [config.saveOnFocusLoss, unsavedChanges, saveNow]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Final save on unmount
      if (unsavedChanges) {
        navigator.sendBeacon(
          `/api/v1/exams/attempts/${testAttemptId}/auto_save/`,
          JSON.stringify({ answers: answersRef.current })
        );
      }
    };
  }, [testAttemptId, unsavedChanges]);

  return {
    updateAnswer,
    saveNow,
    isLoading,
    unsavedChanges,
    lastSaveTime,
    answers: answersRef.current
  };
}