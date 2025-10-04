'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, RefreshCw, AlertCircle, BookOpen, 
  Play, Pause, CheckCircle2
} from 'lucide-react';
import { useTestResumption } from '@/hooks/useTestResumption';
import { useAuth } from '@/contexts/auth-context';
import { ResumeTestCard } from './ResumeTestCard';

interface ResumableTestsSectionProps {
  showHeader?: boolean;
  maxItems?: number;
  variant?: 'full' | 'compact' | 'dashboard';
}

export function ResumableTestsSection({ 
  showHeader = true, 
  maxItems = 10,
  variant = 'full' 
}: ResumableTestsSectionProps) {
  const { user } = useAuth();
  const {
    sessions,
    loading,
    error,
    hasResumableSessions,
    getSessionsByStatus,
    getRecentSessions,
    resumeTestAttempt,
    pauseTestAttempt,
    abandonTestAttempt,
    formatTimeRemaining,
    formatLastActivity,
    refresh
  } = useTestResumption({
    userId: user?.id,
    refreshInterval: 60000, // Refresh every minute
    includeExpired: variant === 'full'
  });

  const inProgressSessions = getSessionsByStatus('in_progress');
  const pausedSessions = getSessionsByStatus('paused');
  const expiredSessions = getSessionsByStatus('expired');
  const recentSessions = getRecentSessions();

  // Get limited sessions for compact view
  const getDisplaySessions = () => {
    if (variant === 'dashboard') {
      return recentSessions.slice(0, 3);
    }
    return sessions.slice(0, maxItems);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resume Tests</CardTitle>
              <CardDescription>Continue your incomplete test attempts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resume Tests</CardTitle>
              <CardDescription>Continue your incomplete test attempts</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span>Failed to load resumable tests. Please try again.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasResumableSessions && sessions.length === 0) {
    return variant === 'dashboard' ? null : (
      <Card>
        <CardHeader>
          <CardTitle>Resume Tests</CardTitle>
          <CardDescription>Continue your incomplete test attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">No incomplete test attempts found</p>
            <p className="text-sm text-gray-400">
              Start a new test to see resumable attempts here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Dashboard variant - compact display
  if (variant === 'dashboard') {
    const displaySessions = getDisplaySessions();
    
    if (displaySessions.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Resume Tests</CardTitle>
              <CardDescription>Continue where you left off</CardDescription>
            </div>
            {sessions.length > 3 && (
              <Button variant="outline" size="sm">
                View All ({sessions.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {displaySessions.map((session) => (
              <ResumeTestCard
                key={session.id}
                session={session}
                onSessionUpdate={refresh}
                resumeTestAttempt={resumeTestAttempt}
                pauseTestAttempt={pauseTestAttempt}
                abandonTestAttempt={abandonTestAttempt}
                formatTimeRemaining={formatTimeRemaining}
                formatLastActivity={formatLastActivity}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact variant - simple list
  if (variant === 'compact') {
    const displaySessions = getDisplaySessions();
    
    return (
      <div className="space-y-3">
        {showHeader && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Resume Tests</h3>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        )}
        {displaySessions.map((session) => (
          <ResumeTestCard
            key={session.id}
            session={session}
            onSessionUpdate={refresh}
            resumeTestAttempt={resumeTestAttempt}
            pauseTestAttempt={pauseTestAttempt}
            abandonTestAttempt={abandonTestAttempt}
            formatTimeRemaining={formatTimeRemaining}
            formatLastActivity={formatLastActivity}
          />
        ))}
      </div>
    );
  }

  // Full variant - tabbed view
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Resume Tests</CardTitle>
            <CardDescription>
              You have {sessions.filter(s => s.canResume).length} resumable test attempts
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {inProgressSessions.length} Active
            </Badge>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              All ({sessions.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Active ({inProgressSessions.length})
            </TabsTrigger>
            <TabsTrigger value="paused" className="flex items-center gap-2">
              <Pause className="w-4 h-4" />
              Paused ({pausedSessions.length})
            </TabsTrigger>
            <TabsTrigger value="expired" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Expired ({expiredSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {sessions.map((session) => (
                <ResumeTestCard
                  key={session.id}
                  session={session}
                  onSessionUpdate={refresh}
                  resumeTestAttempt={resumeTestAttempt}
                  pauseTestAttempt={pauseTestAttempt}
                  abandonTestAttempt={abandonTestAttempt}
                  formatTimeRemaining={formatTimeRemaining}
                  formatLastActivity={formatLastActivity}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {inProgressSessions.length > 0 ? (
                inProgressSessions.map((session) => (
                  <ResumeTestCard
                    key={session.id}
                    session={session}
                    onSessionUpdate={refresh}
                    resumeTestAttempt={resumeTestAttempt}
                    pauseTestAttempt={pauseTestAttempt}
                    abandonTestAttempt={abandonTestAttempt}
                    formatTimeRemaining={formatTimeRemaining}
                    formatLastActivity={formatLastActivity}
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <Play className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No active test attempts</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="paused" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {pausedSessions.length > 0 ? (
                pausedSessions.map((session) => (
                  <ResumeTestCard
                    key={session.id}
                    session={session}
                    onSessionUpdate={refresh}
                    resumeTestAttempt={resumeTestAttempt}
                    pauseTestAttempt={pauseTestAttempt}
                    abandonTestAttempt={abandonTestAttempt}
                    formatTimeRemaining={formatTimeRemaining}
                    formatLastActivity={formatLastActivity}
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <Pause className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No paused test attempts</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="expired" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {expiredSessions.length > 0 ? (
                expiredSessions.map((session) => (
                  <ResumeTestCard
                    key={session.id}
                    session={session}
                    onSessionUpdate={refresh}
                    resumeTestAttempt={resumeTestAttempt}
                    pauseTestAttempt={pauseTestAttempt}
                    abandonTestAttempt={abandonTestAttempt}
                    formatTimeRemaining={formatTimeRemaining}
                    formatLastActivity={formatLastActivity}
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-400 mb-4" />
                  <p className="text-gray-500">No expired test attempts</p>
                  <p className="text-sm text-gray-400">Great job staying on top of your tests!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}