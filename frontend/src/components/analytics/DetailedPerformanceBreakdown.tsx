'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, Minus, Clock, Target, 
  Brain, BookOpen, Award, AlertTriangle, CheckCircle2,
  Timer, Zap, ThumbsUp, ThumbsDown
} from 'lucide-react';

interface DetailedPerformanceBreakdownProps {
  metrics: any; // Will be properly typed from useAdvancedAnalytics
  className?: string;
}

export function DetailedPerformanceBreakdown({ metrics, className }: DetailedPerformanceBreakdownProps) {
  if (!metrics) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50';
      case 'declining':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Detailed Performance Analysis
        </CardTitle>
        <CardDescription>
          Deep dive into your performance patterns and areas for improvement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="subjects" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="difficulty">Difficulty</TabsTrigger>
            <TabsTrigger value="time">Time Analysis</TabsTrigger>
            <TabsTrigger value="comparative">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {metrics.subjectWisePerformance.map((subject: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{subject.subject}</h4>
                      <p className="text-sm text-muted-foreground">{subject.topic}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getDifficultyColor(subject.difficulty)}>
                        {subject.difficulty}
                      </Badge>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${getTrendColor(subject.improvementTrend)}`}>
                        {getTrendIcon(subject.improvementTrend)}
                        <span className="text-xs font-medium">{subject.improvementTrend}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Accuracy</span>
                        <span className="font-medium">{subject.accuracyPercentage}%</span>
                      </div>
                      <Progress value={subject.accuracyPercentage} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{subject.correctAnswers}/{subject.totalQuestions}</div>
                        <div className="text-muted-foreground">Correct</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{subject.averageTime}s</div>
                        <div className="text-muted-foreground">Avg Time</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{subject.lastAttempted}</div>
                        <div className="text-muted-foreground">Last Test</div>
                      </div>
                    </div>
                    
                    {subject.recommendedFocus && (
                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-orange-800">Recommended for focused study</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="difficulty" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {Object.entries(metrics.difficultyAnalysis).filter(([key]) => key !== 'adaptiveRecommendation').map(([difficulty, data]: [string, any]) => (
                <Card key={difficulty} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold capitalize">{difficulty} Questions</h4>
                    <Badge className={getDifficultyColor(difficulty)}>
                      {data.accuracy.toFixed(1)}% Accuracy
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <Progress value={data.accuracy} className="h-2" />
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{data.correct}/{data.attempted}</div>
                        <div className="text-muted-foreground">Correct/Total</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{data.averageTime}s</div>
                        <div className="text-muted-foreground">Avg Time</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">
                          {data.accuracy > 80 ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-orange-600 mx-auto" />
                          )}
                        </div>
                        <div className="text-muted-foreground">Status</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Adaptive Recommendation</h4>
                </div>
                <p className="text-blue-800">
                  {metrics.difficultyAnalysis.adaptiveRecommendation === 'practice_medium' && 
                    'Focus on medium difficulty questions to build confidence and improve accuracy.'}
                  {metrics.difficultyAnalysis.adaptiveRecommendation === 'focus_on_easy' && 
                    'Strengthen your foundation with easy questions before tackling harder ones.'}
                  {metrics.difficultyAnalysis.adaptiveRecommendation === 'challenge_hard' && 
                    'You\'re ready for more challenging questions to push your limits.'}
                </p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="time" className="space-y-4 mt-6">
            <div className="grid gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold">Time Efficiency Analysis</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Time Efficiency Score</span>
                      <span className="font-medium">{metrics.timeAnalysis.timeEfficiencyScore}%</span>
                    </div>
                    <Progress value={metrics.timeAnalysis.timeEfficiencyScore} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Fastest Correct</span>
                      </div>
                      <div className="text-lg font-semibold">{metrics.timeAnalysis.fastestCorrectTime}s</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="text-sm">Slowest Correct</span>
                      </div>
                      <div className="text-lg font-semibold">{metrics.timeAnalysis.slowestCorrectTime}s</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Optimal Time Range</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{metrics.timeAnalysis.optimalTimeRange.min}s - {metrics.timeAnalysis.optimalTimeRange.max}s</span>
                      <span>per question</span>
                    </div>
                  </div>
                </div>
              </Card>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className={`p-4 ${metrics.timeAnalysis.rushingTendency ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className={`w-5 h-5 ${metrics.timeAnalysis.rushingTendency ? 'text-red-600' : 'text-gray-400'}`} />
                    <h4 className="font-semibold">Rushing Tendency</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {metrics.timeAnalysis.rushingTendency ? (
                      <>
                        <ThumbsDown className="w-4 h-4 text-red-600" />
                        <span className="text-red-800">Detected - Slow down</span>
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="w-4 h-4 text-green-600" />
                        <span className="text-green-800">Good pace</span>
                      </>
                    )}
                  </div>
                </Card>
                
                <Card className={`p-4 ${metrics.timeAnalysis.overthinkingTendency ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className={`w-5 h-5 ${metrics.timeAnalysis.overthinkingTendency ? 'text-orange-600' : 'text-gray-400'}`} />
                    <h4 className="font-semibold">Overthinking</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {metrics.timeAnalysis.overthinkingTendency ? (
                      <>
                        <ThumbsDown className="w-4 h-4 text-orange-600" />
                        <span className="text-orange-800">Detected - Be decisive</span>
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="w-4 h-4 text-green-600" />
                        <span className="text-green-800">Good timing</span>
                      </>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparative" className="space-y-4 mt-6">
            <div className="grid gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold">Performance Comparison</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Rank Improvement</div>
                      <div className="text-2xl font-bold text-green-600">
                        +{metrics.comparativeAnalysis.rankImprovement}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Score Improvement</div>
                      <div className="text-2xl font-bold text-blue-600">
                        +{metrics.comparativeAnalysis.scoreImprovement}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="font-medium">Peer Comparison</h5>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          {metrics.comparativeAnalysis.peerComparison.betterThan}
                        </div>
                        <div className="text-xs text-green-700">Better than</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {metrics.comparativeAnalysis.peerComparison.similarTo}
                        </div>
                        <div className="text-xs text-blue-700">Similar to</div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-lg font-bold text-orange-600">
                          {metrics.comparativeAnalysis.peerComparison.needsCatchUp}
                        </div>
                        <div className="text-xs text-orange-700">Need to catch up</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h5 className="font-medium">Organization Rankings</h5>
                    <div className="space-y-2">
                      {Object.entries(metrics.comparativeAnalysis.organizationRanking).map(([org, data]: [string, any]) => (
                        <div key={org} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">{org}</span>
                          <div className="text-sm text-muted-foreground">
                            Rank {data.rank} of {data.totalStudents} ({data.percentile}%)
                          </div>
                        </div>
                      ))}
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