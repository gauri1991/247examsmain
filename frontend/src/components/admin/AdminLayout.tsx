'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { 
  HomeIcon, 
  CloudArrowUpIcon, 
  DocumentTextIcon, 
  UsersIcon, 
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

interface AdminLayoutProps {
  children: ReactNode
  activeSection: string
  onSectionChange: (section: string) => void
}

const navigationItems = [
  { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
  { id: 'content-upload', name: 'Content Upload', icon: CloudArrowUpIcon },
  { id: 'content-management', name: 'Content Management', icon: DocumentTextIcon },
  { id: 'users', name: 'User Management', icon: UsersIcon },
  { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
]

export default function AdminLayout({ children, activeSection, onSectionChange }: AdminLayoutProps) {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col h-full fixed left-0 top-0 z-30">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-800">247Exams Admin</h1>
          <p className="text-sm text-gray-600">Content Management System</p>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto mt-6">
          <div className="px-3 pb-6">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium mb-1 transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                  {item.name}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Bottom section - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
          <div className="flex items-center mb-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.first_name?.charAt(0) || user?.phone?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {user?.first_name || user?.phone || 'Admin'}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content - With left margin to account for fixed sidebar */}
      <div className="flex-1 flex flex-col h-full ml-64">
        {/* Fixed Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 left-64 z-20">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 capitalize">
                {activeSection.replace('-', ' ')}
              </h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Welcome back, {user?.first_name || 'Admin'}
                </div>
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 pt-16">
          {children}
        </main>
      </div>
    </div>
  )
}