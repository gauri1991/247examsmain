'use client';

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ResumableTestsSection } from "@/components/test/ResumableTestsSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useTestResumption } from "@/hooks/useTestResumption";
import { 
  AlertCircle, BookOpen, Clock, Play, 
  Pause, TrendingUp, BarChart3 
} from "lucide-react";
import { useEffect } from "react";

export default function ResumeTestsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    sessions,
    loading,
    hasResumableSessions,
    getSessionsByStatus,
    formatTimeRemaining
  } = useTestResumption({
    userId: user?.id,
    refreshInterval: 30000, // Refresh every 30 seconds
    includeExpired: true
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const inProgressSessions = getSessionsByStatus('in_progress');
  const pausedSessions = getSessionsByStatus('paused');
  const expiredSessions = getSessionsByStatus('expired');
  
  // Calculate total time remaining across active tests
  const totalTimeRemaining = inProgressSessions.reduce(
    (total, session) => total + session.timeRemaining, 
    0
  );

  // Calculate completion stats
  const totalQuestions = sessions.reduce(
    (total, session) => total + session.totalQuestions, 
    0
  );
  const answeredQuestions = sessions.reduce(
    (total, session) => total + Object.keys(session.answers).length, 
    0
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Resume Tests" />
      
      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Resume Your Tests
          </h1>
          <p className="text-muted-foreground">
            Continue your incomplete test attempts and manage your progress
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessions.length}</div>
              <p className="text-xs text-muted-foreground">
                {hasResumableSessions ? 'Including resumable' : 'All attempts'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
              <Play className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {inProgressSessions.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paused Tests</CardTitle>
              <Pause className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {pausedSessions.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready to resume
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Remaining</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatTimeRemaining(totalTimeRemaining)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across active tests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions for urgent tests */}
        {inProgressSessions.length > 0 && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-800">Urgent Actions Required</CardTitle>
              </div>
              <CardDescription className="text-orange-700">
                You have {inProgressSessions.length} active test{inProgressSessions.length > 1 ? 's' : ''} that require immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inProgressSessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{session.testName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeRemaining(session.timeRemaining)} remaining
                      </p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => router.push(`/tests/${session.testId}/attempt/${session.id}`)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Resume
                    </Button>
                  </div>
                ))}
                {inProgressSessions.length > 3 && (
                  <p className="text-sm text-orange-700 text-center pt-2">
                    And {inProgressSessions.length - 3} more active test{inProgressSessions.length - 3 > 1 ? 's' : ''}...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Overview */}
        {sessions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Progress Overview
                  </CardTitle>
                  <CardDescription>
                    Your overall test completion progress
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {answeredQuestions}/{totalQuestions} Questions
                  </Badge>
                  <Badge variant="secondary">
                    {((answeredQuestions / Math.max(totalQuestions, 1)) * 100).toFixed(1)}% Complete
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{inProgressSessions.length}</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{pausedSessions.length}</div>
                  <div className="text-sm text-muted-foreground">Paused</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{expiredSessions.length}</div>
                  <div className="text-sm text-muted-foreground">Expired</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{answeredQuestions}</div>
                  <div className="text-sm text-muted-foreground">Answered</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Resumable Tests Section */}
        <ResumableTestsSection variant="full" />

        {/* Empty State */}
        {sessions.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Test Attempts Found</h3>
              <p className="text-muted-foreground mb-6">
                You haven't started any tests yet. Browse available exams and start your first test attempt.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => router.push('/exams')}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Exams
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}