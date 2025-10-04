'use client';

import { useParams, usePathname } from 'next/navigation';
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

export default function TestsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  
  // Hide sidebar for test attempt pages (secure test mode)
  const isTestAttemptPage = pathname.includes('/attempt/');
  
  if (isTestAttemptPage) {
    return <>{children}</>;
  }
  
  return (
    <DashboardSidebar>
      {children}
    </DashboardSidebar>
  )
}