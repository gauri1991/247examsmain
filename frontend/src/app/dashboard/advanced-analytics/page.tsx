'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, TrendingUp, Users, Target, Award, 
  RefreshCw, Download, Share2, Settings,
  BarChart3, PieChart, Activity, Zap
} from 'lucide-react';
import { useAuth } from "@/contexts/auth-context";
import { useAdvancedAnalytics } from "@/hooks/useAdvancedAnalytics";
import { DetailedPerformanceBreakdown } from "@/components/analytics/DetailedPerformanceBreakdown";
import { StudyRecommendations } from "@/components/analytics/StudyRecommendations";
import { AdvancedTrendAnalysis } from "@/components/analytics/AdvancedTrendAnalysis";
import { ComparativeAnalysis } from "@/components/analytics/ComparativeAnalysis";

export default function AdvancedAnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const {
    metrics,
    trends,
    loading,
    error,
    improvementInsights,
    studyRecommendations,
    refresh
  } = useAdvancedAnalytics({
    userId: user?.id,
    timeRange,
    refreshInterval: 300000 // 5 minutes
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleExportData = () => {
    // Implementation for exporting analytics data
    const dataToExport = {
      metrics,
      trends,
      improvementInsights,
      studyRecommendations,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${user?.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareAnalytics = () => {
    // Implementation for sharing analytics
    if (navigator.share) {
      navigator.share({
        title: 'My Performance Analytics',
        text: `Check out my performance analytics! Overall score: ${metrics?.overallStats.averageScore}%, Rank: #${metrics?.overallStats.rank}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      const shareText = `My Performance Analytics - Score: ${metrics?.overallStats.averageScore}%, Rank: #${metrics?.overallStats.rank}`;
      navigator.clipboard.writeText(shareText);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader title="Advanced Analytics" />
        <div className="flex-1 overflow-auto px-6 py-8">
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader title="Advanced Analytics" />
        <div className="flex-1 overflow-auto px-6 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-red-600 mb-4">Failed to load analytics data</p>
              <Button onClick={refresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Advanced Analytics" />
      
      <div className="flex-1 overflow-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
                Advanced Analytics Dashboard
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Comprehensive insights into your performance patterns and growth opportunities
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Time Range Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs sm:text-sm"
                    onClick={() => setTimeRange(range)}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={refresh} className="flex-1 sm:flex-initial">
                  <RefreshCw className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>

                <Button variant="outline" size="sm" onClick={handleExportData} className="flex-1 sm:flex-initial">
                  <Download className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>

                <Button variant="outline" size="sm" onClick={handleShareAnalytics} className="flex-1 sm:flex-initial">
                  <Share2 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats Overview */}
          {metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <Card className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Overall Score</p>
                    <p className="text-xl sm:text-2xl font-bold">{metrics.overallStats.averageScore}%</p>
                  </div>
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Current Rank</p>
                    <p className="text-xl sm:text-2xl font-bold">#{metrics.overallStats.rank}</p>
                  </div>
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                </div>
              </Card>

              <Card className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Percentile</p>
                    <p className="text-xl sm:text-2xl font-bold">{metrics.overallStats.percentile}%</p>
                  </div>
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Tests Taken</p>
                    <p className="text-xl sm:text-2xl font-bold">{metrics.overallStats.totalTests}</p>
                  </div>
                  <PieChart className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
              </Card>

              <Card className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Improvement</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">+{metrics.overallStats.improvementRate}%</p>
                  </div>
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Main Analytics Content */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <TabsList className="inline-flex w-max min-w-full sm:grid sm:w-full sm:grid-cols-5 px-3 sm:px-0">
              <TabsTrigger value="overview" className="text-xs sm:text-sm whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs sm:text-sm whitespace-nowrap">Performance</TabsTrigger>
              <TabsTrigger value="trends" className="text-xs sm:text-sm whitespace-nowrap">Trends</TabsTrigger>
              <TabsTrigger value="comparison" className="text-xs sm:text-sm whitespace-nowrap">Comparison</TabsTrigger>
              <TabsTrigger value="recommendations" className="text-xs sm:text-sm whitespace-nowrap">AI Insights</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                    Performance Summary
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Your key performance indicators at a glance</CardDescription>
                </CardHeader>
                <CardContent>
                  {metrics && (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                          <div className="text-xl sm:text-2xl font-bold text-blue-600">
                            {metrics.overallStats.averageScore}%
                          </div>
                          <div className="text-xs sm:text-sm text-blue-700">Average Score</div>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                          <div className="text-xl sm:text-2xl font-bold text-green-600">
                            #{metrics.overallStats.rank}
                          </div>
                          <div className="text-xs sm:text-sm text-green-700">Current Rank</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Percentile Ranking</span>
                          <span className="font-medium">{metrics.overallStats.percentile}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${metrics.overallStats.percentile}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Tests</span>
                          <div className="font-medium">{metrics.overallStats.totalTests}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Improvement Rate</span>
                          <div className="font-medium text-green-600">+{metrics.overallStats.improvementRate}%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                    Quick Insights
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">AI-powered insights about your performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {improvementInsights && (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="p-2 sm:p-3 bg-green-50 border-l-4 border-green-500 rounded">
                        <p className="text-green-800 font-medium text-sm sm:text-base">Weekly Improvement</p>
                        <p className="text-green-700 text-xs sm:text-sm">
                          You've improved by {improvementInsights.weeklyImprovement.toFixed(1)}% this week!
                        </p>
                      </div>

                      <div className={`p-2 sm:p-3 border-l-4 rounded ${
                        improvementInsights.trend === 'improving' ? 'bg-green-50 border-green-500' :
                        improvementInsights.trend === 'declining' ? 'bg-red-50 border-red-500' :
                        'bg-blue-50 border-blue-500'
                      }`}>
                        <p className="font-medium text-sm sm:text-base">Current Trend: {improvementInsights.trend}</p>
                        <p className="text-xs sm:text-sm">
                          Your projected score for next test: {improvementInsights.projectedScore.toFixed(0)}%
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-medium">Top Recommendations</p>
                        {studyRecommendations.slice(0, 3).map((rec: any, index: number) => (
                          <div key={index} className="text-xs sm:text-sm text-muted-foreground">
                            • {rec.action}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <DetailedPerformanceBreakdown metrics={metrics} />
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <AdvancedTrendAnalysis 
              trends={trends} 
              improvementInsights={improvementInsights}
            />
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <ComparativeAnalysis metrics={metrics} />
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <StudyRecommendations 
              recommendations={studyRecommendations}
              weaknessAnalysis={metrics?.weaknessAnalysis}
              strengthAnalysis={metrics?.strengthAnalysis}
            />
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <Card className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-semibold text-sm sm:text-base text-blue-900">Advanced Analytics</h4>
                <p className="text-blue-700 text-xs sm:text-sm">
                  Data updated every 5 minutes • Last refresh: {new Date().toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-white text-xs">
                  <Brain className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
                <Badge variant="outline" className="bg-white text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Real-time
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}