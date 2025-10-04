'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  TrophyIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { apiService } from '@/lib/api'

interface AnalyticsData {
  userStats: {
    totalUsers: number
    activeUsers: number
    newUsersThisMonth: number
    userGrowthRate: number
  }
  examStats: {
    totalExams: number
    completedExams: number
    averageScore: number
    passRate: number
  }
  questionStats: {
    totalQuestions: number
    totalQuestionBanks: number
    questionsPerCategory: Array<{
      category: string
      count: number
    }>
  }
  activityStats: {
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
    avgSessionDuration: string
  }
  recentActivity: Array<{
    id: string
    type: string
    user: string
    action: string
    timestamp: string
  }>
  topPerformers: Array<{
    id: string
    name: string
    score: number
    examsCompleted: number
  }>
}

export default function AnalyticsSection() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userStats: {
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0,
      userGrowthRate: 0
    },
    examStats: {
      totalExams: 0,
      completedExams: 0,
      averageScore: 0,
      passRate: 0
    },
    questionStats: {
      totalQuestions: 0,
      totalQuestionBanks: 0,
      questionsPerCategory: []
    },
    activityStats: {
      dailyActiveUsers: 0,
      weeklyActiveUsers: 0,
      monthlyActiveUsers: 0,
      avgSessionDuration: '0m'
    },
    recentActivity: [],
    topPerformers: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30days')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await apiService.request(`/analytics/admin/dashboard/?range=${timeRange}`)
      
      if (response.success) {
        setAnalytics(response.data)
      } else {
        console.error('Failed to fetch analytics:', response.message)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatPercentage = (num: number): string => {
    return num.toFixed(1) + '%'
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return <AcademicCapIcon className="h-4 w-4 text-blue-600" />
      case 'user':
        return <UsersIcon className="h-4 w-4 text-green-600" />
      case 'question':
        return <DocumentTextIcon className="h-4 w-4 text-purple-600" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Overview Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Stats Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Stats Skeleton */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Questions by Category Skeleton */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-40"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-8"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Top Performers Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
              <p className="text-gray-600">Platform performance and user insights</p>
            </div>
          </div>
          
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(analytics.userStats.totalUsers)}
              </p>
              <p className="text-sm text-green-600 mt-1">
                <ArrowTrendingUpIcon className="inline h-4 w-4 mr-1" />
                {formatPercentage(analytics.userStats.userGrowthRate)} growth
              </p>
            </div>
            <UsersIcon className="h-12 w-12 text-blue-600 opacity-30" />
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-3xl font-bold text-green-600">
                {formatNumber(analytics.userStats.activeUsers)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatPercentage((analytics.userStats.activeUsers / analytics.userStats.totalUsers) * 100)} of total
              </p>
            </div>
            <UsersIcon className="h-12 w-12 text-green-600 opacity-30" />
          </div>
        </div>

        {/* Exam Completion Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pass Rate</p>
              <p className="text-3xl font-bold text-purple-600">
                {formatPercentage(analytics.examStats.passRate)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Avg Score: {analytics.examStats.averageScore.toFixed(1)}
              </p>
            </div>
            <TrophyIcon className="h-12 w-12 text-purple-600 opacity-30" />
          </div>
        </div>

        {/* Total Questions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Questions</p>
              <p className="text-3xl font-bold text-orange-600">
                {formatNumber(analytics.questionStats.totalQuestions)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {analytics.questionStats.totalQuestionBanks} banks
              </p>
            </div>
            <DocumentTextIcon className="h-12 w-12 text-orange-600 opacity-30" />
          </div>
        </div>
      </div>

      {/* Activity Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Daily Active Users</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatNumber(analytics.activityStats.dailyActiveUsers)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Weekly Active Users</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatNumber(analytics.activityStats.weeklyActiveUsers)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Monthly Active Users</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatNumber(analytics.activityStats.monthlyActiveUsers)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Avg. Session Duration</span>
              <span className="text-lg font-semibold text-gray-900">
                {analytics.activityStats.avgSessionDuration}
              </span>
            </div>
          </div>
        </div>

        {/* Exam Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Exam Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total Exams</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatNumber(analytics.examStats.totalExams)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Completed Exams</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatNumber(analytics.examStats.completedExams)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Average Score</span>
              <span className="text-lg font-semibold text-gray-900">
                {analytics.examStats.averageScore.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Pass Rate</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatPercentage(analytics.examStats.passRate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions by Category */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Questions by Category</h3>
        <div className="space-y-3">
          {analytics.questionStats.questionsPerCategory.slice(0, 5).map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{category.category}</span>
              <div className="flex items-center space-x-2">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ 
                      width: `${(category.count / analytics.questionStats.totalQuestions) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                  {category.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity and Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analytics.recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-gray-600"> {activity.action}</span>
                  </p>
                  <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                </div>
              </div>
            ))}
            {analytics.recentActivity.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-3">
            {analytics.topPerformers.slice(0, 5).map((performer, index) => (
              <div key={performer.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                    ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{performer.name}</p>
                    <p className="text-xs text-gray-500">{performer.examsCompleted} exams</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{performer.score}%</p>
                  <p className="text-xs text-gray-500">avg score</p>
                </div>
              </div>
            ))}
            {analytics.topPerformers.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}