"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { apiService } from "@/lib/api";
import { useDashboardStats, useRecentActivity } from "@/hooks/useOptimizedData";
import { usePerformanceMonitor, globalPerformanceTracker } from "@/hooks/usePerformanceMonitor";
import { DashboardLoading } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { showErrorToast } from "@/lib/error-handler";
import { ResumableTestsSection } from "@/components/test/ResumableTestsSection";

interface DashboardStats {
  tests_taken: number;
  average_score: number;
  study_streak: number;
  rank: number;
  total_students: number;
}

interface Activity {
  id: number;
  title: string;
  subtitle: string;
  score: number;
  timestamp: string;
}

// Performance optimized dashboard stats component
function DashboardStats() {
  const { user } = useAuth();
  const { data: stats, loading: statsLoading, error: statsError } = useDashboardStats(user?.id);
  const { metrics, trackApiCall } = usePerformanceMonitor('DashboardStats', {
    trackMemory: true,
    onMetricsUpdate: (metrics) => globalPerformanceTracker.updateMetrics('DashboardStats', metrics)
  });

  useEffect(() => {
    if (stats) trackApiCall();
  }, [stats]); // Removed trackApiCall dependency to prevent infinite loop

  if (statsLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
              <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded animate-pulse w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded animate-pulse w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (statsError) {
    showErrorToast(statsError);
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Unable to load stats</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tests Taken</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.tests_taken || 0}</div>
          <p className="text-xs text-muted-foreground">Total tests completed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.average_score || 0}%</div>
          <p className="text-xs text-muted-foreground">Across all tests</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M8 2v4l-2-2-2 2V2h4z"></path>
            <path d="M14 4h2l4-2-4-2h-2v4z"></path>
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.study_streak || 0}</div>
          <p className="text-xs text-muted-foreground">Days in a row</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">#{stats?.rank || 0}</div>
          <p className="text-xs text-muted-foreground">
            Out of {stats?.total_students || 0} students
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Performance optimized recent activity component
function RecentActivity() {
  const { user } = useAuth();
  const { data: activities, loading: activitiesLoading, error: activitiesError } = useRecentActivity(user?.id);
  const { trackApiCall } = usePerformanceMonitor('RecentActivity', {
    onMetricsUpdate: (metrics) => globalPerformanceTracker.updateMetrics('RecentActivity', metrics)
  });

  useEffect(() => {
    if (activities) trackApiCall();
  }, [activities, trackApiCall]);

  if (activitiesLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded animate-pulse w-32"></div>
          <div className="h-4 bg-muted rounded animate-pulse w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-4 bg-muted rounded animate-pulse w-40"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-24"></div>
                </div>
                <div className="h-6 bg-muted rounded animate-pulse w-12"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activitiesError) {
    showErrorToast(activitiesError);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Unable to load recent activity</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest test attempts and scores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities?.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.subtitle}</p>
                </div>
                <div className="ml-auto font-medium">{activity.score}%</div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { metrics } = usePerformanceMonitor('Dashboard', {
    trackMemory: true,
    trackInteractions: true,
    onMetricsUpdate: (metrics) => {
      globalPerformanceTracker.updateMetrics('Dashboard', metrics);
      // Log performance issues
      if (metrics.loadTime > 2000) {
        console.warn('Dashboard slow load time:', metrics.loadTime);
      }
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <ErrorBoundary>
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader title="Dashboard" />
        
        <div className="flex-1 overflow-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-foreground">
              Welcome back, {user?.first_name || 'User'}!
            </h1>
            <p className="text-muted-foreground">
              Continue your exam preparation journey as a {user?.role}
            </p>
          </div>

          {/* Performance Optimized Stats */}
          <div className="mb-8">
            <Suspense fallback={<DashboardLoading />}>
              <DashboardStats />
            </Suspense>
          </div>

          {/* Resumable Tests Section */}
          <div className="mb-8">
            <Suspense fallback={<div><Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Loading resumable tests...</p></CardContent></Card></div>}>
              <ResumableTestsSection variant="dashboard" />
            </Suspense>
          </div>

          {/* Performance Optimized Activity */}
          <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-4">
            <Suspense fallback={<div className="col-span-3"><Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Loading activity...</p></CardContent></Card></div>}>
              <RecentActivity />
            </Suspense>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Continue your preparation</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Button 
                  onClick={() => router.push('/exams')}
                  className="w-full"
                >
                  Browse Exams
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/tests')}
                  className="w-full"
                >
                  View Test History
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/results')}
                  className="w-full"
                >
                  Basic Analytics
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/advanced-analytics')}
                  className="w-full"
                >
                  Advanced Analytics
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/syllabus')}
                  className="w-full"
                >
                  Study Syllabus
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/resume-tests')}
                  className="w-full"
                >
                  Resume Tests
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/study-materials')}
                  className="w-full"
                >
                  Study Materials
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/subscription')}
                  className="w-full"
                >
                  Subscription
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Performance Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Performance Metrics</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Load Time: {metrics.loadTime}ms</p>
                <p>Render Time: {metrics.renderTime}ms</p>
                <p>API Calls: {metrics.apiCallsCount}</p>
                <p>Cache Hit Rate: {metrics.cacheHitRate.toFixed(1)}%</p>
                {metrics.memoryUsage && (
                  <p>Memory Usage: {(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}