'use client';

import { useEffect } from 'react';
import { setupGlobalErrorHandling } from '@/lib/error-handler';

export function GlobalErrorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setupGlobalErrorHandling();
  }, []);

  return <>{children}</>;
}