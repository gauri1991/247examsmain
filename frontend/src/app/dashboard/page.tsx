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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-bold text-blue-700">Tests Taken</CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">📝</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-800 mb-1">{stats?.tests_taken || 0}</div>
          <p className="text-sm text-blue-600 font-medium">Total tests completed</p>
          <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-bold text-green-700">Average Score</CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">📊</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-800 mb-1">{stats?.average_score || 0}%</div>
          <p className="text-sm text-green-600 font-medium">Across all tests</p>
          <div className="mt-3 w-full bg-green-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{width: `${stats?.average_score || 0}%`}}></div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-bold text-orange-700">Study Streak</CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">🔥</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-800 mb-1">{stats?.study_streak || 0}</div>
          <p className="text-sm text-orange-600 font-medium">Days in a row</p>
          <div className="mt-3 w-full bg-orange-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full" style={{width: '60%'}}></div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-bold text-purple-700">Current Rank</CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">🏆</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-800 mb-1">#{stats?.rank || 0}</div>
          <p className="text-sm text-purple-600 font-medium">
            Out of {stats?.total_students || 0} students
          </p>
          <div className="mt-3 w-full bg-purple-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full" style={{width: '85%'}}></div>
          </div>
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
    <Card className="bg-gradient-to-br from-white to-gray-50/50 border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">📈</span>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">Recent Activity</CardTitle>
            <CardDescription className="text-gray-600 font-medium">Your latest test attempts and scores</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities?.length > 0 ? (
            activities.map((activity, index) => (
              <div key={activity.id} className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-lg">{index + 1}</span>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-bold text-gray-900 leading-none">{activity.title}</p>
                  <p className="text-sm text-gray-600 font-medium">{activity.subtitle}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
                <div className={`ml-auto px-3 py-2 rounded-xl font-bold text-sm ${
                  activity.score >= 80 
                    ? 'bg-green-100 text-green-700' 
                    : activity.score >= 60 
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {activity.score}%
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📚</span>
              </div>
              <p className="text-lg font-semibold text-gray-600 mb-2">No recent activity</p>
              <p className="text-sm text-gray-500">Start taking tests to see your activity here</p>
            </div>
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
      <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30">
        <DashboardHeader title="Dashboard" />
        
        <div className="flex-1 overflow-auto">
          {/* Hero Section */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 mb-8 rounded-xl mx-6 shadow-lg">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                    <span className="text-xl">👋</span>
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                      Welcome back, <span className="text-yellow-300">{user?.first_name || 'User'}</span>!
                    </h1>
                    <p className="text-sm md:text-base text-blue-100/90 font-medium">
                      Continue your journey as a <span className="text-yellow-300 font-semibold capitalize">{user?.role}</span>
                    </p>
                  </div>
                </div>
                
                {/* Compact Goal Card */}
                <div className="hidden md:block">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">🎯</span>
                      </div>
                      <div>
                        <p className="text-white/90 font-medium text-sm">Today's Goal</p>
                        <p className="text-lg font-bold text-yellow-300">3/5 Tests</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Subtle Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl"></div>
          </div>

          <div className="px-6 pb-8">
            {/* Performance Optimized Stats */}
            <div className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Performance</h2>
                <p className="text-gray-600">Track your progress and achievements</p>
              </div>
              <Suspense fallback={<DashboardLoading />}>
                <DashboardStats />
              </Suspense>
            </div>

            {/* Resumable Tests Section */}
            <div className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Continue Learning</h2>
                <p className="text-gray-600">Pick up where you left off</p>
              </div>
              <Suspense fallback={<div><Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-lg"><CardContent className="pt-6"><p className="text-sm text-gray-500">Loading resumable tests...</p></CardContent></Card></div>}>
                <ResumableTestsSection variant="dashboard" />
              </Suspense>
            </div>

            {/* Recent Activity */}
            <div className="mb-12">
              <Suspense fallback={<div><Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-lg"><CardContent className="pt-6"><p className="text-sm text-gray-500">Loading activity...</p></CardContent></Card></div>}>
                <RecentActivity />
              </Suspense>
            </div>

          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}