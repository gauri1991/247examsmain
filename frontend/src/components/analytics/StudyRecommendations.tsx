'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, Clock, Target, TrendingUp, AlertTriangle, 
  CheckCircle2, Star, Calendar, Users, Brain, Zap,
  Award, Trophy, Heart, Lightbulb
} from 'lucide-react';

interface StudyRecommendationsProps {
  recommendations: any[];
  weaknessAnalysis?: any;
  strengthAnalysis?: any;
  className?: string;
}

export function StudyRecommendations({ 
  recommendations, 
  weaknessAnalysis, 
  strengthAnalysis, 
  className 
}: StudyRecommendationsProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weakness':
        return <AlertTriangle className="w-4 h-4" />;
      case 'time_management':
        return <Clock className="w-4 h-4" />;
      case 'consistency':
        return <Calendar className="w-4 h-4" />;
      case 'strength':
        return <Star className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI-Powered Study Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Study Recommendations
          </CardTitle>
          <CardDescription>
            Personalized study plan based on your performance analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <Card key={index} className="p-4 border-l-4 border-l-blue-500">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(rec.type)}
                      <h4 className="font-semibold">{rec.topic}</h4>
                    </div>
                    <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                      {rec.priority} priority
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{rec.action}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>{rec.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-green-600" />
                      <span>{rec.subject}</span>
                    </div>
                  </div>
                  
                  {rec.resources && rec.resources.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium mb-2">Recommended Resources:</div>
                      <div className="flex flex-wrap gap-2">
                        {rec.resources.map((resource: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-green-700 mb-2">
                  Excellent Performance!
                </h3>
                <p className="text-green-600">
                  You're performing well across all areas. Keep up the great work!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weakness Analysis */}
      {weaknessAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-red-600" />
              Areas for Improvement
            </CardTitle>
            <CardDescription>
              Focus areas to boost your overall performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weaknessAnalysis.criticalWeaknesses.map((weakness: any, index: number) => (
                <Card key={index} className="p-4 bg-red-50 border-red-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{weakness.topic}</h4>
                      <p className="text-sm text-muted-foreground">{weakness.subject}</p>
                    </div>
                    <Badge variant="outline" className={getSeverityColor(weakness.severity)}>
                      {weakness.severity} severity
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Current Accuracy</span>
                        <span className="font-medium">{weakness.accuracy}%</span>
                      </div>
                      <Progress value={weakness.accuracy} className="h-2" />
                    </div>
                    
                    <div className="p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium">Recommended Action</span>
                      </div>
                      <p className="text-sm">{weakness.recommendedAction}</p>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Study Resources:</div>
                      <div className="flex flex-wrap gap-2">
                        {weakness.studyResources.map((resource: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Study Time Estimation</h4>
                </div>
                <div className="text-blue-800">
                  <div className="text-2xl font-bold mb-1">
                    {weaknessAnalysis.estimatedStudyTime} hours
                  </div>
                  <p className="text-sm">
                    Estimated time to significantly improve in weak areas
                  </p>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strength Analysis */}
      {strengthAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Your Strengths
            </CardTitle>
            <CardDescription>
              Leverage your strong areas for better overall performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4">
                {strengthAnalysis.topStrengths.map((strength: any, index: number) => (
                  <Card key={index} className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{strength.topic}</h4>
                        <p className="text-sm text-muted-foreground">{strength.subject}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Strong</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Accuracy</div>
                        <div className="font-semibold text-green-700">{strength.accuracy}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Consistency</div>
                        <div className="font-semibold text-green-700">{strength.consistency}%</div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Progress value={strength.accuracy} className="h-2" />
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Advancement Opportunities</h4>
                  </div>
                  <div className="space-y-2">
                    {strengthAnalysis.recommendedAdvancement.map((item: string, idx: number) => (
                      <div key={idx} className="text-sm text-blue-800 flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        {item}
                      </div>
                    ))}
                  </div>
                </Card>
                
                <Card className="p-4 bg-purple-50 border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-900">Mentorship Opportunities</h4>
                  </div>
                  <div className="space-y-2">
                    {strengthAnalysis.mentorshipOpportunities.map((item: string, idx: number) => (
                      <div key={idx} className="text-sm text-purple-800 flex items-center gap-2">
                        <Heart className="w-3 h-3" />
                        {item}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Personalized Action Plan
          </CardTitle>
          <CardDescription>
            Step-by-step plan to achieve your goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <div className="font-medium">Address Critical Weaknesses</div>
                  <div className="text-sm text-muted-foreground">
                    Focus on high-severity areas first (2-3 hours daily)
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <div className="font-medium">Maintain Your Strengths</div>
                  <div className="text-sm text-muted-foreground">
                    Regular practice to keep strong areas sharp (1 hour daily)
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <div className="font-medium">Practice Time Management</div>
                  <div className="text-sm text-muted-foreground">
                    Take timed tests to improve speed and accuracy
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <div className="font-medium">Track Progress Weekly</div>
                  <div className="text-sm text-muted-foreground">
                    Review analytics and adjust study plan accordingly
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold">Success Prediction</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Following this plan consistently for 2-3 weeks should improve your overall score by 
                <span className="font-bold text-green-600"> 10-15%</span> and boost your ranking significantly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}