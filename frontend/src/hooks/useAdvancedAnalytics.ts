import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiRequest } from '@/lib/api';
import { showErrorToast } from '@/lib/error-handler';

// Advanced analytics data structures
interface DetailedPerformanceMetrics {
  userId: string;
  overallStats: {
    totalTests: number;
    averageScore: number;
    totalTime: number;
    rank: number;
    percentile: number;
    improvementRate: number;
  };
  subjectWisePerformance: SubjectPerformance[];
  difficultyAnalysis: DifficultyAnalysis;
  timeAnalysis: TimeAnalysis;
  comparativeAnalysis: ComparativeAnalysis;
  streakAnalysis: StreakAnalysis;
  weaknessAnalysis: WeaknessAnalysis;
  strengthAnalysis: StrengthAnalysis;
}

interface SubjectPerformance {
  subject: string;
  topic: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracyPercentage: number;
  averageTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  lastAttempted: string;
  improvementTrend: 'improving' | 'declining' | 'stable';
  recommendedFocus: boolean;
}

interface DifficultyAnalysis {
  easy: { attempted: number; correct: number; accuracy: number; averageTime: number };
  medium: { attempted: number; correct: number; accuracy: number; averageTime: number };
  hard: { attempted: number; correct: number; accuracy: number; averageTime: number };
  adaptiveRecommendation: 'focus_on_easy' | 'practice_medium' | 'challenge_hard';
}

interface TimeAnalysis {
  averageTimePerQuestion: number;
  fastestCorrectTime: number;
  slowestCorrectTime: number;
  timeEfficiencyScore: number;
  rushingTendency: boolean;
  overthinkingTendency: boolean;
  optimalTimeRange: { min: number; max: number };
}

interface ComparativeAnalysis {
  rankImprovement: number;
  scoreImprovement: number;
  peerComparison: {
    betterThan: number;
    similarTo: number;
    needsCatchUp: number;
  };
  organizationRanking: {
    [org: string]: {
      rank: number;
      totalStudents: number;
      percentile: number;
    };
  };
}

interface StreakAnalysis {
  currentStreak: number;
  longestStreak: number;
  streakType: 'daily' | 'weekly' | 'test_based';
  streakData: {
    date: string;
    value: number;
    type: 'active' | 'missed' | 'completed';
  }[];
  motivation: {
    daysToMilestone: number;
    milestoneTarget: number;
    encouragementMessage: string;
  };
}

interface WeaknessAnalysis {
  criticalWeaknesses: {
    topic: string;
    subject: string;
    severity: 'high' | 'medium' | 'low';
    accuracy: number;
    recommendedAction: string;
    studyResources: string[];
  }[];
  improvementPriority: string[];
  estimatedStudyTime: number;
}

interface StrengthAnalysis {
  topStrengths: {
    topic: string;
    subject: string;
    accuracy: number;
    consistency: number;
    confidence: 'high' | 'medium' | 'low';
  }[];
  recommendedAdvancement: string[];
  mentorshipOpportunities: string[];
}

interface TrendData {
  dates: string[];
  scores: number[];
  times: number[];
  accuracies: number[];
  rankings: number[];
}

interface UseAdvancedAnalyticsOptions {
  userId?: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
  subjects?: string[];
  organizations?: string[];
  refreshInterval?: number;
}

export function useAdvancedAnalytics(options: UseAdvancedAnalyticsOptions = {}) {
  const {
    userId,
    timeRange = 'month',
    subjects = [],
    organizations = [],
    refreshInterval = 300000 // 5 minutes
  } = options;

  const [metrics, setMetrics] = useState<DetailedPerformanceMetrics | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch detailed analytics data
  const fetchAdvancedAnalytics = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // In production, these would be real API calls
      // const metricsResponse = await apiRequest(`/analytics/detailed/${userId}/?range=${timeRange}`);
      // const trendsResponse = await apiRequest(`/analytics/trends/${userId}/?range=${timeRange}`);

      // Mock detailed analytics data
      const mockMetrics: DetailedPerformanceMetrics = {
        userId,
        overallStats: {
          totalTests: 47,
          averageScore: 76.8,
          totalTime: 142800, // in seconds
          rank: 23,
          percentile: 85.2,
          improvementRate: 12.5
        },
        subjectWisePerformance: [
          {
            subject: 'Mathematics',
            topic: 'Algebra',
            totalQuestions: 120,
            correctAnswers: 95,
            accuracyPercentage: 79.2,
            averageTime: 78,
            difficulty: 'medium',
            lastAttempted: '2025-09-26',
            improvementTrend: 'improving',
            recommendedFocus: false
          },
          {
            subject: 'General Knowledge',
            topic: 'History',
            totalQuestions: 85,
            correctAnswers: 52,
            accuracyPercentage: 61.2,
            averageTime: 45,
            difficulty: 'hard',
            lastAttempted: '2025-09-25',
            improvementTrend: 'declining',
            recommendedFocus: true
          },
          {
            subject: 'English',
            topic: 'Comprehension',
            totalQuestions: 95,
            correctAnswers: 82,
            accuracyPercentage: 86.3,
            averageTime: 92,
            difficulty: 'medium',
            lastAttempted: '2025-09-27',
            improvementTrend: 'stable',
            recommendedFocus: false
          },
          {
            subject: 'Reasoning',
            topic: 'Logical Reasoning',
            totalQuestions: 110,
            correctAnswers: 88,
            accuracyPercentage: 80.0,
            averageTime: 65,
            difficulty: 'easy',
            lastAttempted: '2025-09-27',
            improvementTrend: 'improving',
            recommendedFocus: false
          }
        ],
        difficultyAnalysis: {
          easy: { attempted: 145, correct: 128, accuracy: 88.3, averageTime: 45 },
          medium: { attempted: 180, correct: 138, accuracy: 76.7, averageTime: 72 },
          hard: { attempted: 85, correct: 51, accuracy: 60.0, averageTime: 98 },
          adaptiveRecommendation: 'practice_medium'
        },
        timeAnalysis: {
          averageTimePerQuestion: 68,
          fastestCorrectTime: 12,
          slowestCorrectTime: 180,
          timeEfficiencyScore: 78.5,
          rushingTendency: false,
          overthinkingTendency: true,
          optimalTimeRange: { min: 45, max: 90 }
        },
        comparativeAnalysis: {
          rankImprovement: 15,
          scoreImprovement: 8.3,
          peerComparison: {
            betterThan: 342,
            similarTo: 28,
            needsCatchUp: 15
          },
          organizationRanking: {
            'UPSC': { rank: 23, totalStudents: 1250, percentile: 85.2 },
            'SSC': { rank: 45, totalStudents: 2100, percentile: 78.9 },
            'Banking': { rank: 12, totalStudents: 800, percentile: 92.1 }
          }
        },
        streakAnalysis: {
          currentStreak: 12,
          longestStreak: 28,
          streakType: 'daily',
          streakData: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: Math.random() > 0.2 ? 1 : 0,
            type: Math.random() > 0.2 ? 'completed' : 'missed' as 'completed' | 'missed'
          })),
          motivation: {
            daysToMilestone: 3,
            milestoneTarget: 15,
            encouragementMessage: 'You\'re just 3 days away from your 15-day milestone! Keep it up!'
          }
        },
        weaknessAnalysis: {
          criticalWeaknesses: [
            {
              topic: 'History',
              subject: 'General Knowledge',
              severity: 'high',
              accuracy: 61.2,
              recommendedAction: 'Focus on Indian Independence Movement',
              studyResources: ['NCERT History Book', 'Modern History Videos', 'Practice Tests']
            },
            {
              topic: 'Geometry',
              subject: 'Mathematics',
              severity: 'medium',
              accuracy: 68.5,
              recommendedAction: 'Practice coordinate geometry problems',
              studyResources: ['Geometry Formulas', 'Practice Problems', 'Video Tutorials']
            }
          ],
          improvementPriority: ['History', 'Geometry', 'Data Interpretation'],
          estimatedStudyTime: 45 // hours
        },
        strengthAnalysis: {
          topStrengths: [
            {
              topic: 'Comprehension',
              subject: 'English',
              accuracy: 86.3,
              consistency: 92.1,
              confidence: 'high'
            },
            {
              topic: 'Logical Reasoning',
              subject: 'Reasoning',
              accuracy: 80.0,
              consistency: 88.7,
              confidence: 'high'
            }
          ],
          recommendedAdvancement: ['Advanced English Literature', 'Complex Reasoning Patterns'],
          mentorshipOpportunities: ['Help peers with English', 'Lead study groups for Reasoning']
        }
      };

      const mockTrends: TrendData = {
        dates: Array.from({ length: 30 }, (_, i) => 
          new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        ),
        scores: Array.from({ length: 30 }, () => Math.floor(Math.random() * 40) + 60),
        times: Array.from({ length: 30 }, () => Math.floor(Math.random() * 3600) + 1800),
        accuracies: Array.from({ length: 30 }, () => Math.floor(Math.random() * 30) + 60),
        rankings: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 10)
      };

      setMetrics(mockMetrics);
      setTrends(mockTrends);
    } catch (err: any) {
      console.error('Failed to fetch advanced analytics:', err);
      setError(err);
      showErrorToast(err);
    } finally {
      setLoading(false);
    }
  }, [userId]); // Removed dependencies that cause infinite re-renders

  // Calculate improvement insights
  const getImprovementInsights = useCallback(() => {
    if (!metrics || !trends) return null;

    const recentScores = trends.scores.slice(-7);
    const olderScores = trends.scores.slice(-14, -7);
    
    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
    
    const improvement = recentAvg - olderAvg;
    
    return {
      weeklyImprovement: improvement,
      trend: improvement > 2 ? 'improving' : improvement < -2 ? 'declining' : 'stable',
      projectedScore: recentAvg + (improvement * 2),
      confidenceLevel: Math.abs(improvement) > 1 ? 'high' : 'medium'
    };
  }, [metrics, trends]);

  // Get study recommendations
  const getStudyRecommendations = useCallback(() => {
    if (!metrics) return [];

    const recommendations = [];
    
    // Based on weaknesses
    metrics.weaknessAnalysis.criticalWeaknesses.forEach(weakness => {
      if (weakness.severity === 'high') {
        recommendations.push({
          type: 'weakness',
          priority: 'high',
          subject: weakness.subject,
          topic: weakness.topic,
          action: weakness.recommendedAction,
          estimatedTime: '2-3 hours daily',
          resources: weakness.studyResources
        });
      }
    });

    // Based on time analysis
    if (metrics.timeAnalysis.overthinkingTendency) {
      recommendations.push({
        type: 'time_management',
        priority: 'medium',
        subject: 'General',
        topic: 'Time Management',
        action: 'Practice timed mock tests to improve speed',
        estimatedTime: '1 hour daily',
        resources: ['Timed Practice Tests', 'Speed Reading Techniques']
      });
    }

    // Based on streaks
    if (metrics.streakAnalysis.currentStreak < 7) {
      recommendations.push({
        type: 'consistency',
        priority: 'medium',
        subject: 'General',
        topic: 'Study Consistency',
        action: 'Build a daily study habit',
        estimatedTime: '30 minutes daily',
        resources: ['Study Schedule Templates', 'Habit Tracking Apps']
      });
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
  }, [metrics]);

  // Initial fetch
  useEffect(() => {
    fetchAdvancedAnalytics();
  }, [userId]); // Removed fetchAdvancedAnalytics dependency to prevent infinite loop

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchAdvancedAnalytics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]); // Removed fetchAdvancedAnalytics dependency to prevent infinite loop

  return {
    metrics,
    trends,
    loading,
    error,
    improvementInsights: getImprovementInsights(),
    studyRecommendations: getStudyRecommendations(),
    refresh: fetchAdvancedAnalytics
  };
}

// Hook for comparative analysis
export function useComparativeAnalytics(userId?: string, compareWith?: string[]) {
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Memoize compareWith to prevent dependency array changes
  const stableCompareWith = useMemo(() => compareWith, [compareWith?.join(',')]);

  const fetchComparison = useCallback(async () => {
    if (!userId || !stableCompareWith?.length) return;

    setLoading(true);
    try {
      // Mock comparative data
      const mockComparison = {
        users: stableCompareWith.map(id => ({
          id,
          name: `User ${id}`,
          averageScore: Math.floor(Math.random() * 40) + 60,
          rank: Math.floor(Math.random() * 100) + 1,
          totalTests: Math.floor(Math.random() * 50) + 10,
          strengths: ['Math', 'Reasoning'],
          improvement: Math.floor(Math.random() * 20) - 10
        })),
        insights: [
          'You perform 15% better in Math compared to your peers',
          'Your consistency is above average',
          'Consider focusing more on General Knowledge'
        ]
      };
      
      setComparison(mockComparison);
    } catch (error) {
      console.error('Comparison fetch failed:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, stableCompareWith]);

  useEffect(() => {
    fetchComparison();
  }, [userId, stableCompareWith]); // Removed fetchComparison dependency to prevent infinite loop

  return { comparison, loading, refresh: fetchComparison };
}