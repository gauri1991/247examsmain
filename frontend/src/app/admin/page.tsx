'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import AdminLayout from '@/components/admin/AdminLayout'
import ContentUploadSection from '@/components/admin/ContentUploadSection'
import ContentManagementSection from '@/components/admin/ContentManagementSection'
import DashboardOverview from '@/components/admin/DashboardOverview'
import UserManagementSection from '@/components/admin/UserManagementSection'
import AnalyticsSection from '@/components/admin/AnalyticsSection'
import FeatureManagementSection from '@/components/admin/FeatureManagementSection'
import { useToast, ToastContainer, setGlobalToast } from '@/components/ui/toast'

type AdminSection = 'dashboard' | 'content-upload' | 'content-management' | 'users' | 'analytics' | 'feature-management'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard')
  const toast = useToast()

  // Set up global toast instance
  useEffect(() => {
    setGlobalToast(toast)
  }, [toast])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/signin')
      return
    }

    // Check if user is admin/staff
    if (user && !user.is_staff && !user.is_superuser) {
      router.push('/admin/signin')
      return
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || (!user.is_staff && !user.is_superuser)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview />
      case 'content-upload':
        return <ContentUploadSection />
      case 'content-management':
        return <ContentManagementSection />
      case 'users':
        return <UserManagementSection />
      case 'analytics':
        return <AnalyticsSection />
      case 'feature-management':
        return <FeatureManagementSection />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <AdminLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      <div className="p-6">
        {renderContent()}
      </div>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </AdminLayout>
  )
}