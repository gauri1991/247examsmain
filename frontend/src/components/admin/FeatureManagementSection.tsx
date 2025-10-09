'use client'

import React, { useState, useEffect } from 'react'
import { 
  CubeTransparentIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { apiService } from '@/lib/api'

interface Feature {
  id: number
  key: string
  name: string
  description: string
  category: number
  category_name: string
  is_enabled: boolean
  is_beta: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  feature_type: string
  dependencies: Feature[]
  conflicts: Feature[]
  dependent_features: Feature[]
  requires_restart: boolean
  affects_performance: boolean
  can_be_disabled: boolean
  dependencies_satisfied: boolean
  user_roles: string[]
  config_options: any
  role_permissions: {
    STUDENT: boolean
    TEACHER: boolean
    ADMIN: boolean
  }
}

interface FeatureCategory {
  id: number
  name: string
  display_name: string
  description: string
  icon: string
  order: number
  features_count: number
}

export default function FeatureManagementSection() {
  const [categories, setCategories] = useState<FeatureCategory[]>([])
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEnabled, setFilterEnabled] = useState<string>('all')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [processingFeatures, setProcessingFeatures] = useState<Set<string>>(new Set())
  const [processingRolePermissions, setProcessingRolePermissions] = useState<Set<string>>(new Set())
  
  const roles = [
    { key: 'STUDENT', label: 'Student' },
    { key: 'TEACHER', label: 'Teacher' },
    { key: 'ADMIN', label: 'Admin' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('Loading feature management data...')
      console.log('API Service Base URL:', process.env.NEXT_PUBLIC_API_URL)
      
      // Load categories and features in parallel using apiService
      // Add pagination parameters to ensure we get all features
      const [categoriesData, featuresData] = await Promise.all([
        apiService.request('/core/api/feature-categories/?page_size=100'),
        apiService.request('/core/api/features/?page_size=100')
      ])
      
      console.log('Categories data:', categoriesData)
      console.log('Features data:', featuresData)
      
      // Handle both paginated and non-paginated responses
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : (categoriesData.results || [])
      const featuresArray = Array.isArray(featuresData) ? featuresData : (featuresData.results || [])
      
      console.log('Processed categories:', categoriesArray.length, categoriesArray)
      console.log('Processed features:', featuresArray.length, featuresArray)
      
      // Debug: Show first few features with their category_name
      if (featuresArray.length > 0) {
        console.log('Sample features with category_name:')
        featuresArray.slice(0, 5).forEach(f => 
          console.log(`  - ${f.name} -> category_name: "${f.category_name}"`)
        )
      }
      
      setCategories(categoriesArray)
      setFeatures(featuresArray)
      
      // Expand first category by default
      if (categoriesArray.length > 0) {
        const firstCategory = categoriesArray[0]
        setExpandedCategories(new Set([firstCategory.display_name]))
      }
    } catch (error) {
      console.error('Failed to load feature data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFeature = async (feature: Feature, reason: string = '') => {
    const featureKey = feature.key
    setProcessingFeatures(prev => new Set(prev).add(featureKey))
    
    try {
      const result = await apiService.request(`/core/api/features/${featureKey}/toggle/`, {
        method: 'POST',
        body: JSON.stringify({
          is_enabled: !feature.is_enabled,
          reason
        })
      })
      
      // Update the feature in our local state
      setFeatures(prev => 
        prev.map(f => 
          f.key === featureKey 
            ? { ...f, ...result.feature }
            : f
        )
      )
    } catch (error) {
      console.error('Failed to toggle feature:', error)
      alert('Failed to toggle feature')
    } finally {
      setProcessingFeatures(prev => {
        const next = new Set(prev)
        next.delete(featureKey)
        return next
      })
    }
  }

  const toggleRolePermission = async (featureKey: string, role: string, currentValue: boolean) => {
    const permissionKey = `${featureKey}-${role}`
    setProcessingRolePermissions(prev => new Set(prev).add(permissionKey))
    
    try {
      await apiService.request('/core/api/features/toggle_role_permission/', {
        method: 'POST',
        body: JSON.stringify({
          feature_key: featureKey,
          role: role,
          is_enabled: !currentValue
        })
      })
      
      // Update the feature's role permission in local state
      setFeatures(prev => 
        prev.map(f => 
          f.key === featureKey 
            ? { 
                ...f, 
                role_permissions: { 
                  ...f.role_permissions, 
                  [role]: !currentValue 
                } 
              }
            : f
        )
      )
    } catch (error) {
      console.error('Failed to toggle role permission:', error)
      alert('Failed to toggle role permission')
    } finally {
      setProcessingRolePermissions(prev => {
        const next = new Set(prev)
        next.delete(permissionKey)
        return next
      })
    }
  }

  const filteredFeatures = features.filter(feature => {
    // Category filter
    if (selectedCategory !== 'all' && feature.category_name !== selectedCategory) {
      return false
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!feature.name.toLowerCase().includes(query) && 
          !feature.description.toLowerCase().includes(query) &&
          !feature.key.toLowerCase().includes(query)) {
        return false
      }
    }
    
    // Enabled filter
    if (filterEnabled === 'enabled' && !feature.is_enabled) {
      return false
    }
    if (filterEnabled === 'disabled' && feature.is_enabled) {
      return false
    }
    
    return true
  })

  const groupedFeatures = categories.reduce((acc, category) => {
    const categoryFeatures = filteredFeatures.filter(
      feature => {
        const matches = feature.category_name === category.display_name
        if (!matches) {
          console.log(`Feature "${feature.name}" category_name="${feature.category_name}" does not match category="${category.display_name}"`)
        }
        return matches
      }
    )
    acc[category.display_name] = categoryFeatures
    console.log(`Category "${category.display_name}" has ${categoryFeatures.length} features:`, categoryFeatures.map(f => f.name))
    return acc
  }, {} as Record<string, Feature[]>)

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryName)) {
        next.delete(categoryName)
      } else {
        next.add(categoryName)
      }
      return next
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-100'
      case 'HIGH': return 'text-orange-600 bg-orange-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'LOW': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Control and configure platform features with dependency management
          </p>
          {/* Debug info */}
          <p className="mt-1 text-xs text-gray-400">
            Debug: {categories.length} categories, {features.length} features loaded
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
            <span>{features.filter(f => f.is_enabled).length} enabled</span>
            <XCircleIcon className="h-4 w-4 text-red-500" />
            <span>{features.filter(f => !f.is_enabled).length} disabled</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.display_name}>
                  {category.display_name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Status Filter */}
          <div>
            <select
              value={filterEnabled}
              onChange={(e) => setFilterEnabled(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="enabled">Enabled Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
          </div>
          
          {/* Refresh Button */}
          <div>
            <button
              onClick={loadData}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Feature-Role Permission Matrix */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {/* Matrix Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Feature Permission Matrix</h2>
          <p className="text-sm text-gray-600">Configure which features are available for each user role</p>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="sticky left-0 bg-gray-50 px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider border-r border-gray-200 min-w-[300px]">
                  Feature
                </th>
                {roles.map(role => (
                  <th key={role.key} className="px-4 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[120px]">
                    <div className="flex flex-col items-center space-y-1">
                      <span>{role.label}</span>
                      <span className="text-xs text-gray-500 normal-case">
                        {features.filter(f => f.role_permissions?.[role.key as keyof typeof f.role_permissions]).length} enabled
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body - Grouped by Categories */}
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map(category => {
                const categoryFeatures = groupedFeatures[category.display_name] || []
                const isExpanded = expandedCategories.has(category.display_name)
                
                if (selectedCategory !== 'all' && selectedCategory !== category.display_name) {
                  return null
                }
                
                if (categoryFeatures.length === 0 && searchQuery) {
                  return null
                }

                return (
                  <React.Fragment key={category.id}>
                    {/* Category Header Row */}
                    <tr className="bg-blue-50 hover:bg-blue-100 cursor-pointer" onClick={() => toggleCategory(category.display_name)}>
                      <td className="sticky left-0 bg-blue-50 hover:bg-blue-100 px-6 py-4 border-r border-gray-200">
                        <div className="flex items-center space-x-3">
                          {isExpanded ? (
                            <ChevronDownIcon className="h-4 w-4 text-blue-600" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4 text-blue-600" />
                          )}
                          <CubeTransparentIcon className="h-5 w-5 text-blue-600" />
                          <div>
                            <h3 className="text-sm font-bold text-blue-900">
                              {category.display_name}
                            </h3>
                            <p className="text-xs text-blue-700">
                              {categoryFeatures.length} features
                            </p>
                          </div>
                        </div>
                      </td>
                      {roles.map(role => (
                        <td key={role.key} className="px-4 py-4 text-center">
                          <span className="text-xs text-blue-700 font-medium">
                            {categoryFeatures.filter(f => f.role_permissions?.[role.key as keyof typeof f.role_permissions]).length}/{categoryFeatures.length}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Feature Rows */}
                    {isExpanded && categoryFeatures.map((feature, featureIndex) => (
                      <tr 
                        key={feature.id} 
                        className={`hover:bg-gray-50 ${featureIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                      >
                        {/* Feature Name Column */}
                        <td className="sticky left-0 bg-inherit px-6 py-4 border-r border-gray-200">
                          <div className="flex items-start space-x-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {feature.name}
                                </h4>
                                
                                {/* Status Indicators */}
                                {feature.is_beta && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                                    BETA
                                  </span>
                                )}
                                
                                {feature.priority === 'CRITICAL' && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                    CRITICAL
                                  </span>
                                )}
                                
                                {feature.priority === 'HIGH' && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                                    HIGH
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {feature.description}
                              </p>
                              
                              {/* Warning Indicators */}
                              <div className="mt-2 flex items-center space-x-3 text-xs">
                                {feature.requires_restart && (
                                  <div className="flex items-center text-orange-600">
                                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                    <span>Requires restart</span>
                                  </div>
                                )}
                                
                                {feature.affects_performance && (
                                  <div className="flex items-center text-yellow-600">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    <span>Affects performance</span>
                                  </div>
                                )}
                                
                                {feature.dependencies.length > 0 && (
                                  <div className="flex items-center text-gray-500">
                                    <InformationCircleIcon className="h-3 w-3 mr-1" />
                                    <span>{feature.dependencies.length} dependencies</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role Permission Checkboxes */}
                        {roles.map(role => {
                          const permissionKey = `${feature.key}-${role.key}`
                          const isEnabled = feature.role_permissions?.[role.key as keyof typeof feature.role_permissions] || false
                          const isProcessing = processingRolePermissions.has(permissionKey)
                          
                          return (
                            <td key={role.key} className="px-4 py-4 text-center">
                              <div className="flex items-center justify-center">
                                {isProcessing ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : (
                                  <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    onChange={() => toggleRolePermission(feature.key, role.key, isEnabled)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                  />
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredFeatures.length === 0 && (
          <div className="text-center py-12">
            <CubeTransparentIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No features found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>
      
      {filteredFeatures.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <CubeTransparentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No features found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}
    </div>
  )
}