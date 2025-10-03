'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, TrendingUp, TrendingDown, Target, Clock, 
  CheckCircle2, Award, BarChart3 
} from 'lucide-react';

interface PerformanceMetricsProps {
  totalTests: number;
  averageScore: number;
  bestScore: number;
  totalTimeTaken: number;
  passRate: number;
  improvementTrend: number;
}

export function PerformanceMetrics({ 
  totalTests, 
  averageScore, 
  bestScore, 
  totalTimeTaken, 
  passRate,
  improvementTrend 
}: PerformanceMetricsProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const metrics = [
    {
      title: 'Total Tests',
      value: totalTests.toString(),
      description: 'Tests completed',
      icon: BarChart3,
      color: 'text-blue-600',
    },
    {
      title: 'Average Score',
      value: `${averageScore.toFixed(1)}%`,
      description: 'Overall performance',
      icon: Target,
      color: getScoreColor(averageScore),
    },
    {
      title: 'Best Score',
      value: `${bestScore.toFixed(1)}%`,
      description: 'Highest achievement',
      icon: Trophy,
      color: 'text-yellow-600',
    },
    {
      title: 'Time Spent',
      value: formatTime(totalTimeTaken),
      description: 'Total study time',
      icon: Clock,
      color: 'text-purple-600',
    },
    {
      title: 'Pass Rate',
      value: `${passRate.toFixed(1)}%`,
      description: 'Tests passed (≥60%)',
      icon: CheckCircle2,
      color: getScoreColor(passRate),
    },
    {
      title: 'Improvement',
      value: `${improvementTrend > 0 ? '+' : ''}${improvementTrend.toFixed(1)}%`,
      description: 'Last 5 tests trend',
      icon: improvementTrend >= 0 ? TrendingUp : TrendingDown,
      color: getTrendColor(improvementTrend),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}