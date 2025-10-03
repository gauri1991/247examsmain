'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { StudyMaterialsLibrary } from '@/components/lms/StudyMaterialsLibrary';

export default function StudyMaterialsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Study Materials" />
      
      <div className="flex-1 overflow-auto px-6 py-8">
        <StudyMaterialsLibrary />
      </div>
    </div>
  );
}