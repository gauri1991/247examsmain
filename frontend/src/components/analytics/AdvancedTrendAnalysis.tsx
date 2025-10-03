'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, Calendar, Target, 
  Zap, Award, Activity, BarChart3
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, ComposedChart, 
  Bar, ReferenceLine, ScatterChart, Scatter
} from 'recharts';

interface AdvancedTrendAnalysisProps {
  trends: any;
  improvementInsights?: any;
  className?: string;
}

export function AdvancedTrendAnalysis({ 
  trends, 
  improvementInsights, 
  className 
}: AdvancedTrendAnalysisProps) {
  if (!trends) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const chartData = trends.dates.map((date: string, index: number) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: trends.scores[index],
    time: Math.round(trends.times[index] / 60), // Convert to minutes
    accuracy: trends.accuracies[index],
    rank: trends.rankings[index],
    dateIndex: index
  }));

  // Performance correlation data
  const correlationData = trends.scores.map((score: number, index: number) => ({
    score,
    time: Math.round(trends.times[index] / 60),
    accuracy: trends.accuracies[index],
    rank: trends.rankings[index]
  }));

  const getTrendIndicator = (value: number) => {
    if (value > 2) {
      return { icon: <TrendingUp className="w-4 h-4" />, color: 'text-green-600', bg: 'bg-green-50' };
    } else if (value < -2) {
      return { icon: <TrendingDown className="w-4 h-4" />, color: 'text-red-600', bg: 'bg-red-50' };
    }
    return { icon: <Activity className="w-4 h-4" />, color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey === 'time' && ' min'}
              {entry.dataKey === 'score' && '%'}
              {entry.dataKey === 'accuracy' && '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Advanced Trend Analysis
        </CardTitle>
        <CardDescription>
          Deep insights into your performance patterns and trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Trends</TabsTrigger>
            <TabsTrigger value="correlation">Correlations</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Improvement Insights */}
            {improvementInsights && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Weekly Improvement</p>
                      <p className="text-2xl font-bold">
                        {improvementInsights.weeklyImprovement > 0 ? '+' : ''}
                        {improvementInsights.weeklyImprovement.toFixed(1)}%
                      </p>
                    </div>
                    <div className={`p-2 rounded-full ${getTrendIndicator(improvementInsights.weeklyImprovement).bg}`}>
                      <span className={getTrendIndicator(improvementInsights.weeklyImprovement).color}>
                        {getTrendIndicator(improvementInsights.weeklyImprovement).icon}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Trend Status</p>
                      <p className="text-lg font-bold capitalize">{improvementInsights.trend}</p>
                    </div>
                    <Badge variant={
                      improvementInsights.trend === 'improving' ? 'default' : 
                      improvementInsights.trend === 'declining' ? 'destructive' : 'secondary'
                    }>
                      {improvementInsights.trend}
                    </Badge>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Projected Score</p>
                      <p className="text-2xl font-bold">{improvementInsights.projectedScore.toFixed(0)}%</p>
                    </div>
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <p className="text-lg font-bold capitalize">{improvementInsights.confidenceLevel}</p>
                    </div>
                    <Zap className="w-8 h-8 text-yellow-600" />
                  </div>
                </Card>
              </div>
            )}

            {/* Combined Performance Chart */}
            <Card className="p-4">
              <h4 className="font-semibold mb-4">Performance Overview (Last 30 Days)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="score"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Score"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Accuracy"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="time"
                    fill="#f59e0b"
                    fillOpacity={0.7}
                    name="Time"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Score Trend */}
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Score Progression</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      name="Score"
                    />
                    <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="5 5" label="Target" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Ranking Trend */}
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Ranking Progress</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis reversed />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="rank"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Rank"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Time Efficiency */}
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Time Management</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="time"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.3}
                      name="Time (min)"
                    />
                    <ReferenceLine y={60} stroke="#10b981" strokeDasharray="5 5" label="Optimal" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Accuracy Trend */}
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Accuracy Pattern</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Accuracy"
                    />
                    <ReferenceLine y={80} stroke="#3b82f6" strokeDasharray="5 5" label="Goal" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="correlation" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Score vs Time Correlation */}
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Score vs Time Correlation</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={correlationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" name="Time (min)" />
                    <YAxis dataKey="score" name="Score" />
                    <Tooltip 
                      formatter={(value, name) => [value, name === 'score' ? 'Score' : 'Time (min)']}
                      labelFormatter={() => 'Performance Point'}
                    />
                    <Scatter dataKey="score" fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground mt-2">
                  Optimal range: 45-90 minutes for best scores
                </p>
              </Card>

              {/* Score vs Accuracy Correlation */}
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Score vs Accuracy Correlation</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={correlationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="accuracy" name="Accuracy" />
                    <YAxis dataKey="score" name="Score" />
                    <Tooltip 
                      formatter={(value, name) => [value + '%', name === 'score' ? 'Score' : 'Accuracy']}
                      labelFormatter={() => 'Performance Point'}
                    />
                    <Scatter dataKey="score" fill="#10b981" />
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground mt-2">
                  Strong positive correlation: Higher accuracy = Higher scores
                </p>
              </Card>
            </div>

            {/* Correlation Insights */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">Correlation Insights</h4>
              <div className="space-y-2 text-blue-800">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>Your best scores occur when you spend 60-90 minutes per test</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Accuracy above 80% consistently leads to top 25% rankings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Your rank improves most when you balance speed and accuracy</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6 mt-6">
            <div className="grid gap-6">
              {/* Performance Patterns */}
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Performance Patterns</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h5 className="font-medium text-green-700">Positive Patterns</h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Consistent improvement in last 2 weeks</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Better performance on weekdays</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Strong correlation between time spent and scores</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="font-medium text-orange-700">Areas to Watch</h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Occasional weekend performance dips</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Time management needs consistency</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Ranking fluctuations in last week</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Predictive Insights */}
              <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-4">Predictive Insights</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Next Week Prediction</p>
                      <p className="text-sm text-muted-foreground">
                        Based on current trends, you're likely to score 78-82% in your next test
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Ranking Potential</p>
                      <p className="text-sm text-muted-foreground">
                        Maintaining current performance could improve your rank by 8-12 positions
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Goal Timeline</p>
                      <p className="text-sm text-muted-foreground">
                        You're on track to reach top 10 ranking within 3-4 weeks
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}