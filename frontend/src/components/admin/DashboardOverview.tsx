'use client'

import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon, 
  CloudArrowUpIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  UsersIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { apiService } from '@/lib/api'

interface DashboardStats {
  totalUploads: number
  successfulUploads: number
  failedUploads: number
  totalQuestions: number
  totalQuestionBanks: number
  totalUsers: number
  recentUploads: Array<{
    id: string
    fileName: string
    status: string
    uploadedAt: string
    itemsImported: number
  }>
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUploads: 0,
    successfulUploads: 0,
    failedUploads: 0,
    totalQuestions: 0,
    totalQuestionBanks: 0,
    totalUsers: 0,
    recentUploads: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await apiService.request('/questions/admin/dashboard-stats/')
      
      if (response.success) {
        setStats(response.data)
      } else {
        console.error('Failed to fetch dashboard stats:', response.message)
        // Fallback to default stats
        setStats({
          totalUploads: 0,
          successfulUploads: 0,
          failedUploads: 0,
          totalQuestions: 0,
          totalQuestionBanks: 0,
          totalUsers: 0,
          recentUploads: []
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      // Fallback to default stats on error
      setStats({
        totalUploads: 0,
        successfulUploads: 0,
        failedUploads: 0,
        totalQuestions: 0,
        totalQuestionBanks: 0,
        totalUsers: 0,
        recentUploads: []
      })
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Uploads',
      value: stats.totalUploads,
      icon: CloudArrowUpIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Successful Uploads',
      value: stats.successfulUploads,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Failed Uploads',
      value: stats.failedUploads,
      icon: XCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Total Questions',
      value: stats.totalQuestions,
      icon: DocumentTextIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Question Banks',
      value: stats.totalQuestionBanks,
      icon: AcademicCapIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: UsersIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>
      case 'failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Failed</span>
      case 'processing':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Processing</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of content management and system statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${card.bgColor} rounded-lg p-3`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Uploads */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Uploads</h2>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items Imported
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentUploads.map((upload) => (
                <tr key={upload.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{upload.fileName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(upload.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {upload.itemsImported}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(upload.uploadedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
            <CloudArrowUpIcon className="h-5 w-5 mr-2" />
            Upload Content
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Manage Content
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <UsersIcon className="h-5 w-5 mr-2" />
            User Management
          </button>
        </div>
      </div>
    </div>
  )
}