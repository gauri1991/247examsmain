'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, Clock, Target, CheckCircle2, AlertCircle, 
  TrendingUp, Star, Award, Activity 
} from 'lucide-react';
import { SyllabusStats, ExamSyllabus } from '@/types/syllabus';

interface SyllabusOverviewProps {
  syllabus: ExamSyllabus;
  stats: SyllabusStats;
}

export function SyllabusOverview({ syllabus, stats }: SyllabusOverviewProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const progressCards = [
    {
      title: 'Overall Progress',
      value: `${Math.round(stats.overallProgress)}%`,
      description: `${stats.completedTopics} of ${stats.totalTopics} topics completed`,
      icon: Target,
      color: getProgressColor(stats.overallProgress),
      bgColor: getProgressBgColor(stats.overallProgress),
      progress: stats.overallProgress
    },
    {
      title: 'Time Invested',
      value: formatTime(stats.totalTimeSpent),
      description: `Est. ${formatTime(stats.estimatedTimeRemaining * 60)} remaining`,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      progress: stats.totalTimeSpent > 0 ? Math.min(100, (stats.totalTimeSpent / 60) / syllabus.totalHours * 100) : 0
    },
    {
      title: 'Topics in Progress',
      value: stats.inProgressTopics.toString(),
      description: `${stats.notStartedTopics} not started`,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200',
      progress: stats.totalTopics > 0 ? (stats.inProgressTopics / stats.totalTopics) * 100 : 0
    },
    {
      title: 'Completion Rate',
      value: `${Math.round((stats.completedTopics / stats.totalTopics) * 100)}%`,
      description: `${stats.completedTopics} topics mastered`,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      progress: (stats.completedTopics / stats.totalTopics) * 100
    }
  ];

  return (
    <div className="space-y-6">
      {/* Exam Info Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{syllabus.examName}</CardTitle>
              <CardDescription className="mt-1">
                Version {syllabus.version} • Last updated {syllabus.lastUpdated.toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{syllabus.totalItems}</div>
              <div className="text-sm text-muted-foreground">Total Topics</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{syllabus.totalHours}h</div>
              <div className="text-xs text-muted-foreground">Estimated Study Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{stats.completedTopics}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{stats.inProgressTopics}</div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{stats.notStartedTopics}</div>
              <div className="text-xs text-muted-foreground">Not Started</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {progressCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className={card.bgColor}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${card.color} mb-1`}>
                  {card.value}
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {card.description}
                </p>
                <Progress value={card.progress} className="h-2" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Study Recommendations */}
      {(stats.recommendedNext.length > 0 || stats.weakAreas.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {stats.recommendedNext.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Recommended Next
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.recommendedNext.map((topic, idx) => (
                    <Badge key={idx} variant="outline" className="mr-2">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {stats.weakAreas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.weakAreas.map((area, idx) => (
                    <Badge key={idx} variant="outline" className="mr-2 border-orange-200 text-orange-700">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Overall Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Syllabus Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{Math.round(stats.overallProgress)}% Complete</span>
            </div>
            <Progress value={stats.overallProgress} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-green-600">{stats.completedTopics}</div>
                <div className="text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">{stats.inProgressTopics}</div>
                <div className="text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-600">{stats.notStartedTopics}</div>
                <div className="text-muted-foreground">Not Started</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}