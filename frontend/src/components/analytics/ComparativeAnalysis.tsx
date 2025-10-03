'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Trophy, TrendingUp, TrendingDown, 
  Award, Target, Star, Zap, Crown, Medal,
  BarChart3, PieChart, Activity
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, PieChart as RechartsPieChart
} from 'recharts';
import { useComparativeAnalytics } from '@/hooks/useAdvancedAnalytics';
import { useAuth } from '@/contexts/auth-context';

interface ComparativeAnalysisProps {
  metrics: any;
  className?: string;
}

export function ComparativeAnalysis({ metrics, className }: ComparativeAnalysisProps) {
  const { user } = useAuth();
  const [compareWith, setCompareWith] = useState<string[]>([]);
  const [newUserId, setNewUserId] = useState('');
  
  const { comparison, loading: comparisonLoading } = useComparativeAnalytics(
    user?.id, 
    compareWith.length > 0 ? compareWith : ['user123', 'user456', 'user789'] // Default comparison users
  );

  if (!metrics) {
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

  // Prepare radar chart data for skill comparison
  const radarData = [
    { subject: 'Math', userScore: 85, avgScore: 72, maxScore: 95 },
    { subject: 'English', userScore: 92, avgScore: 78, maxScore: 98 },
    { subject: 'Reasoning', userScore: 78, avgScore: 75, maxScore: 90 },
    { subject: 'GK', userScore: 65, avgScore: 70, maxScore: 88 },
    { subject: 'Science', userScore: 88, avgScore: 73, maxScore: 94 }
  ];

  // Organization comparison data
  const orgData = Object.entries(metrics.comparativeAnalysis.organizationRanking).map(([org, data]: [string, any]) => ({
    organization: org,
    rank: data.rank,
    percentile: data.percentile,
    totalStudents: data.totalStudents
  }));

  // Peer comparison pie chart data
  const peerData = [
    { name: 'Better Than', value: metrics.comparativeAnalysis.peerComparison.betterThan, color: '#10b981' },
    { name: 'Similar To', value: metrics.comparativeAnalysis.peerComparison.similarTo, color: '#3b82f6' },
    { name: 'Need Catch Up', value: metrics.comparativeAnalysis.peerComparison.needsCatchUp, color: '#f59e0b' }
  ];

  const addUserComparison = () => {
    if (newUserId && !compareWith.includes(newUserId)) {
      setCompareWith([...compareWith, newUserId]);
      setNewUserId('');
    }
  };

  const removeUserComparison = (userId: string) => {
    setCompareWith(compareWith.filter(id => id !== userId));
  };

  const getRankColor = (rank: number, total: number) => {
    const percentile = ((total - rank) / total) * 100;
    if (percentile >= 90) return 'text-green-600 bg-green-50';
    if (percentile >= 75) return 'text-blue-600 bg-blue-50';
    if (percentile >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Comparative Performance Analysis
        </CardTitle>
        <CardDescription>
          See how you stack up against peers and in different organizations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills Radar</TabsTrigger>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="peers">Peer Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Performance Improvement */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Rank Improvement</p>
                    <p className="text-2xl font-bold text-green-800">
                      +{metrics.comparativeAnalysis.rankImprovement}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-xs text-green-600 mt-2">Positions gained this month</p>
              </Card>

              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700">Score Improvement</p>
                    <p className="text-2xl font-bold text-blue-800">
                      +{metrics.comparativeAnalysis.scoreImprovement}%
                    </p>
                  </div>
                  <Trophy className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-xs text-blue-600 mt-2">Average score increase</p>
              </Card>

              <Card className="p-4 bg-purple-50 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700">Overall Percentile</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {metrics.overallStats.percentile}%
                    </p>
                  </div>
                  <Crown className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-xs text-purple-600 mt-2">Better than most peers</p>
              </Card>
            </div>

            {/* Peer Comparison Pie Chart */}
            <Card className="p-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Peer Performance Distribution
              </h4>
              <div className="grid gap-6 md:grid-cols-2">
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Tooltip 
                      formatter={(value, name) => [`${value} students`, name]}
                    />
                    <RechartsPieChart data={peerData} cx="50%" cy="50%" outerRadius={80}>
                      {peerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
                
                <div className="space-y-3">
                  <h5 className="font-medium">Performance Summary</h5>
                  {peerData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      You perform better than <span className="font-bold text-green-600">
                        {((peerData[0].value / (peerData[0].value + peerData[1].value + peerData[2].value)) * 100).toFixed(0)}%
                      </span> of your peers
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6 mt-6">
            <Card className="p-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Subject-wise Performance Comparison
              </h4>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={18} domain={[0, 100]} />
                  <Radar
                    name="Your Score"
                    dataKey="userScore"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Average Score"
                    dataKey="avgScore"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Top Score"
                    dataKey="maxScore"
                    stroke="#10b981"
                    fill="transparent"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
              
              <div className="grid gap-4 md:grid-cols-3 mt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">Your Performance</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Your current scores</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">Peer Average</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Average of all students</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-3 h-3 border-2 border-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Top Performer</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Highest scores achieved</p>
                </div>
              </div>
            </Card>

            {/* Subject Analysis */}
            <div className="grid gap-4">
              {radarData.map((subject, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium">{subject.subject}</h5>
                    <div className="flex items-center gap-2">
                      {subject.userScore > subject.avgScore ? (
                        <Badge className="bg-green-100 text-green-800">Above Average</Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800">Below Average</Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Your Score: {subject.userScore}%</span>
                      <span>Average: {subject.avgScore}%</span>
                      <span>Top: {subject.maxScore}%</span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full relative"
                          style={{ width: `${subject.userScore}%` }}
                        >
                          <div 
                            className="absolute top-0 w-1 h-2 bg-red-500"
                            style={{ left: `${(subject.avgScore / subject.userScore) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="organizations" className="space-y-6 mt-6">
            <Card className="p-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Organization Rankings
              </h4>
              <div className="space-y-4">
                {orgData.map((org, index) => (
                  <Card key={index} className="p-4 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-bold text-blue-600">#{org.rank}</span>
                        </div>
                        <div>
                          <h5 className="font-semibold">{org.organization}</h5>
                          <p className="text-sm text-muted-foreground">
                            {org.totalStudents} total students
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getRankColor(org.rank, org.totalStudents)}>
                          {org.percentile}th percentile
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Rank {org.rank} of {org.totalStudents}
                        </p>
                      </div>
                    </div>
                    
                    {/* Performance indicator */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full relative"
                        style={{ width: '100%' }}
                      >
                        <div 
                          className="absolute top-0 w-2 h-2 bg-white border-2 border-blue-600 rounded-full transform -translate-y-0"
                          style={{ left: `${org.percentile}%` }}
                        ></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Organization Performance Chart */}
            <Card className="p-4">
              <h4 className="font-semibold mb-4">Percentile Comparison Across Organizations</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orgData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="organization" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}th percentile`, 'Percentile']}
                  />
                  <Bar dataKey="percentile" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="peers" className="space-y-6 mt-6">
            {/* Add Peer Comparison */}
            <Card className="p-4">
              <h4 className="font-semibold mb-4">Add Peer for Comparison</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter user ID to compare"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={addUserComparison}>Add</Button>
              </div>
              
              {compareWith.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Comparing with:</p>
                  <div className="flex flex-wrap gap-2">
                    {compareWith.map((userId) => (
                      <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                        {userId}
                        <button
                          onClick={() => removeUserComparison(userId)}
                          className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Peer Comparison Results */}
            {comparison && !comparisonLoading && (
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Peer Comparison Results</h4>
                <div className="space-y-4">
                  {comparison.users.map((peer: any, index: number) => (
                    <Card key={index} className="p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-purple-600">
                              {peer.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h5 className="font-medium">{peer.name}</h5>
                            <p className="text-sm text-muted-foreground">
                              {peer.totalTests} tests taken
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{peer.averageScore}%</div>
                          <div className="text-sm text-muted-foreground">Avg Score</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium">#{peer.rank}</div>
                          <div className="text-muted-foreground">Rank</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-medium ${peer.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {peer.improvement >= 0 ? '+' : ''}{peer.improvement}%
                          </div>
                          <div className="text-muted-foreground">Improvement</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{peer.strengths.join(', ')}</div>
                          <div className="text-muted-foreground">Strengths</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                {comparison.insights && (
                  <Card className="p-4 mt-4 bg-blue-50 border-blue-200">
                    <h5 className="font-medium text-blue-900 mb-3">Comparison Insights</h5>
                    <div className="space-y-2">
                      {comparison.insights.map((insight: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-blue-800 text-sm">
                          <Star className="w-4 h-4" />
                          {insight}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </Card>
            )}

            {comparisonLoading && (
              <Card className="p-4">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}