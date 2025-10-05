'use client'

import { useState, useEffect } from 'react'
import { 
  FolderIcon, 
  DocumentTextIcon, 
  AcademicCapIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CloudArrowUpIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { apiService } from '@/lib/api'
import ViewContentModal from './ViewContentModal'
import EditContentModal from './EditContentModal'
import { useConfirmation } from '@/components/ui/confirmation-dialog'
import { toast } from '@/components/ui/toast'

interface ContentData {
  questionBanks: any[]
  exams: any[]
  tests: any[]
  summary: {
    totalQuestionBanks: number
    totalExams: number
    totalTests: number
    totalQuestions: number
  }
}

interface RequirementsData {
  is_ready: boolean
  total_questions: number
  missing_questions: number
  ready_tests: number
  total_tests: number
  question_banks: Array<{
    bank_name: string
    requested: number
    available: number
    missing: number
  }>
}

interface UploadItem {
  id: string
  fileName: string
  contentType: string
  status: string
  itemsImported: number
  uploadedAt: string
  uploadedBy: string
}

interface LoadingState {
  loading: boolean
  error: string | null
}

export default function ContentManagementSection() {
  const [contentData, setContentData] = useState<ContentData | null>(null)
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({ loading: true, error: null })
  const [activeTab, setActiveTab] = useState<'overview' | 'question_banks' | 'exams' | 'tests' | 'uploads'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; content: any; contentType: 'question_bank' | 'exam' | 'test' | 'upload' | null }>({ isOpen: false, content: null, contentType: null })
  const [editModal, setEditModal] = useState<{ isOpen: boolean; content: any; contentType: 'question_bank' | 'exam' | 'test' | 'upload' | null }>({ isOpen: false, content: null, contentType: null })
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [bulkActionMode, setBulkActionMode] = useState(false)
  const [requirementsCache, setRequirementsCache] = useState<Map<string, RequirementsData>>(new Map())
  const [loadingRequirements, setLoadingRequirements] = useState<Set<string>>(new Set())
  // Removed deletedItems state since we're eliminating auto-deletion logic
  const { ConfirmationDialog, confirm } = useConfirmation()

  // Handle status change (activation/deactivation)
  const handleStatusChange = async (item: any, newStatus: string, type: 'exam' | 'test') => {
    try {
      const endpoint = type === 'exam' ? `/exams/exams/${item.id}/update_status/` : `/exams/tests/${item.id}/update_status/`
      const response = await apiService.request(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.success) {
        // Update local state
        setContentData(prev => {
          if (!prev) return prev
          const updatedData = { ...prev }
          if (type === 'exam') {
            updatedData.exams = updatedData.exams.map(exam => 
              exam.id === item.id ? { ...exam, status: newStatus } : exam
            )
          } else {
            updatedData.tests = updatedData.tests.map(test => 
              test.id === item.id ? { ...test, status: newStatus } : test
            )
          }
          return updatedData
        })
        
        // Clear requirements cache for this item
        setRequirementsCache(prev => {
          const newCache = new Map(prev)
          newCache.delete(item.id)
          return newCache
        })
        
        toast.success(`${type === 'exam' ? 'Exam' : 'Test'} ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
      } else {
        throw new Error(response.message || 'Failed to update status')
      }
    } catch (error: any) {
      toast.error(`Failed to update status: ${error.message}`)
    }
  }

  // Requirements Display Component
  const RequirementsDisplay = ({ item, type }: { item: any; type: 'exam' | 'test' }) => {
    const [requirements, setRequirements] = useState<RequirementsData | null>(null)
    const [showDetails, setShowDetails] = useState(false)
    const isLoading = loadingRequirements.has(item.id)
    
    const statusBadge = getStatusBadge(item.status || 'draft')

    const loadRequirements = async () => {
      const req = await fetchRequirements(item.id, type)
      setRequirements(req)
    }

    // Removed auto-loading useEffect to prevent infinite loops
    // Users can click on status badges to manually load requirements

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span 
            className={`px-2 py-1 text-xs rounded-full cursor-pointer ${statusBadge.className}`}
            title={statusBadge.description}
            onClick={() => {
              if (!requirements && !isLoading) {
                loadRequirements()
              }
              setShowDetails(!showDetails)
            }}
          >
            {statusBadge.text}
          </span>
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
        </div>
        
        {showDetails && requirements && !requirements.is_ready && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
            <div className="font-medium text-yellow-800 mb-2">⚠️ Requirements Not Met</div>
            <div className="space-y-1 text-yellow-700">
              <div>Missing {requirements.missing_questions} questions</div>
              {type === 'exam' && (
                <div>Ready tests: {requirements.ready_tests}/{requirements.total_tests}</div>
              )}
              {requirements.question_banks.filter(bank => bank.missing > 0).length > 0 && (
                <div className="mt-2">
                  <div className="font-medium">Question Banks:</div>
                  {requirements.question_banks.filter(bank => bank.missing > 0).map((bank, idx) => (
                    <div key={idx} className="ml-2">
                      • {bank.bank_name}: needs {bank.missing} more ({bank.available}/{bank.requested})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {showDetails && requirements && requirements.is_ready && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
            <div className="font-medium text-green-800">✅ All Requirements Met</div>
            <div className="text-green-700">
              Total questions: {requirements.total_questions}
              {type === 'exam' && ` • Ready tests: ${requirements.ready_tests}/${requirements.total_tests}`}
            </div>
          </div>
        )}

        {/* Activation Controls */}
        <div className="flex items-center space-x-2 mt-2">
          {item.status === 'ready' && (
            <button
              onClick={async () => {
                const confirmed = await confirm({
                  title: `Activate ${type === 'exam' ? 'Exam' : 'Test'}`,
                  message: `Are you sure you want to activate "${item.name}"? It will be available to students.`,
                  confirmText: 'Activate',
                  cancelText: 'Cancel'
                })
                if (confirmed) {
                  handleStatusChange(item, 'active', type)
                }
              }}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🔵 Activate
            </button>
          )}
          
          {item.status === 'active' && (
            <button
              onClick={async () => {
                const confirmed = await confirm({
                  title: `Deactivate ${type === 'exam' ? 'Exam' : 'Test'}`,
                  message: `Are you sure you want to deactivate "${item.name}"? It will no longer be available to students.`,
                  confirmText: 'Deactivate',
                  cancelText: 'Cancel'
                })
                if (confirmed) {
                  handleStatusChange(item, 'inactive', type)
                }
              }}
              className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              🔴 Deactivate
            </button>
          )}
          
          {item.status === 'inactive' && (
            <button
              onClick={async () => {
                // First check requirements before allowing reactivation
                const req = await fetchRequirements(item.id, type)
                if (req && req.is_ready) {
                  const confirmed = await confirm({
                    title: `Reactivate ${type === 'exam' ? 'Exam' : 'Test'}`,
                    message: `Are you sure you want to reactivate "${item.name}"? It will be available to students again.`,
                    confirmText: 'Reactivate',
                    cancelText: 'Cancel'
                  })
                  if (confirmed) {
                    handleStatusChange(item, 'active', type)
                  }
                } else {
                  toast.error('Cannot reactivate: Requirements are no longer met. Please check question banks.')
                }
              }}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🔵 Reactivate
            </button>
          )}
          
          {item.status === 'draft' && (
            <div className="text-xs text-gray-500">
              Complete requirements to enable activation
            </div>
          )}
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'question_banks', name: 'Question Banks', icon: FolderIcon },
    { id: 'exams', name: 'Exams', icon: AcademicCapIcon },
    { id: 'tests', name: 'Tests', icon: DocumentTextIcon },
    { id: 'uploads', name: 'Upload History', icon: CloudArrowUpIcon }
  ]

  useEffect(() => {
    fetchAllContent()
    fetchUploadItems()
  }, [])

  const fetchAllContent = async () => {
    setLoadingState({ loading: true, error: null })
    try {
      const response = await apiService.request('/questions/admin/all-content/')
      if (response.success) {
        setContentData(response.data)
      } else {
        throw new Error(response.message || 'Failed to fetch content')
      }
    } catch (error: any) {
      setLoadingState({ loading: false, error: error.message || 'Failed to fetch content' })
    } finally {
      setLoadingState({ loading: false, error: null })
    }
  }

  const fetchUploadItems = async () => {
    try {
      const response = await apiService.request('/questions/admin/content-list/')
      if (response.success) {
        setUploadItems(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch upload items:', error)
    }
  }

  // Fetch requirements for exam or test
  const fetchRequirements = async (id: string, type: 'exam' | 'test') => {
    if (requirementsCache.has(id)) {
      return requirementsCache.get(id)
    }

    setLoadingRequirements(prev => new Set(prev).add(id))
    try {
      const endpoint = type === 'exam' ? `/exams/exams/${id}/requirements/` : `/exams/tests/${id}/requirements/`
      console.log(`Fetching requirements for ${type} with ID: ${id}`)
      const response = await apiService.request(endpoint)
      
      if (response && (response.success !== false)) {
        // The response is the requirements data directly from the ViewSet action
        const requirements = response
        setRequirementsCache(prev => new Map(prev).set(id, requirements))
        return requirements
      }
    } catch (error: any) {
      console.error('Failed to fetch requirements:', error)
      // Just log the error and return null - NO AUTO-DELETION LOGIC
      const errorMessage = error?.message || error?.detail || JSON.stringify(error)
      console.warn(`Could not fetch requirements for ${type} ${id}: ${errorMessage}`)
      // Don't mark as deleted automatically - this was causing unwanted auto-deletions
      return null
    } finally {
      setLoadingRequirements(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
    return null
  }

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return { className: 'bg-yellow-100 text-yellow-800', text: '🟡 Draft', description: 'Missing question requirements' }
      case 'ready':
        return { className: 'bg-green-100 text-green-800', text: '🟢 Ready', description: 'All requirements met, can be activated' }
      case 'active':
        return { className: 'bg-blue-100 text-blue-800', text: '🔵 Active', description: 'Live and available to students' }
      case 'inactive':
        return { className: 'bg-gray-100 text-gray-800', text: '🔴 Inactive', description: 'Manually deactivated' }
      default:
        return { className: 'bg-gray-100 text-gray-800', text: status, description: '' }
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-orange-100 text-orange-800'
      case 'expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filterContent = (items: any[]) => {
    return items.filter(item => {
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = !filterCategory || item.category === filterCategory
      
      return matchesSearch && matchesCategory
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleView = (content: any, contentType: 'question_bank' | 'exam' | 'test' | 'upload') => {
    setViewModal({ isOpen: true, content, contentType })
  }

  const handleEdit = (content: any, contentType: 'question_bank' | 'exam' | 'test' | 'upload') => {
    setEditModal({ isOpen: true, content, contentType })
  }

  const handleSave = async (updatedContent: any) => {
    try {
      const { contentType } = editModal
      let response
      
      switch (contentType) {
        case 'question_bank':
          response = await apiService.updateQuestionBank(editModal.content.id, updatedContent)
          break
        case 'exam':
          response = await apiService.updateExam(editModal.content.id, updatedContent)
          break
        case 'test':
          response = await apiService.updateTest(editModal.content.id, updatedContent)
          break
        default:
          throw new Error('Update not supported for this content type')
      }

      if (response.success) {
        toast.success(response.message || `${contentType.replace('_', ' ')} updated successfully`)
        setEditModal({ isOpen: false, content: null, contentType: null })
        await fetchAllContent() // Refresh the data
      } else {
        toast.error(response.message || 'Failed to update content')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update content')
    }
  }

  const handleDelete = async (content: any, contentType: 'question_bank' | 'exam' | 'test' | 'upload') => {
    // Prevent deletion of draft items - they should be completed instead
    if ((contentType === 'exam' || contentType === 'test') && content.status === 'draft') {
      toast.error(
        `Cannot delete ${contentType} "${content.name}" because it's in draft status. ` +
        `Please complete the requirements or change the status before deleting.`
      )
      return
    }

    // Prevent deletion of active items - they should be deactivated first
    if ((contentType === 'exam' || contentType === 'test') && content.status === 'active') {
      toast.error(
        `Cannot delete ${contentType} "${content.name}" because it's currently active. ` +
        `Please deactivate it first before deleting.`
      )
      return
    }

    const getDeleteDetails = () => {
      switch (contentType) {
        case 'question_bank':
          return {
            title: 'Delete Question Bank',
            message: `Are you sure you want to delete the question bank "${content.name}"? This action cannot be undone and will remove all associated questions.`,
            endpoint: `/questions/admin/delete-question-bank/${content.id}/`
          }
        case 'exam':
          return {
            title: 'Delete Exam',
            message: `Are you sure you want to delete the exam "${content.name}"? This action cannot be undone and will remove all associated tests. Only inactive or ready exams can be deleted.`,
            endpoint: `/questions/admin/delete-exam/${content.id}/`
          }
        case 'test':
          return {
            title: 'Delete Test',
            message: `Are you sure you want to delete the test "${content.name}"? This action cannot be undone. Only inactive or ready tests can be deleted.`,
            endpoint: `/questions/admin/delete-test/${content.id}/`
          }
        case 'upload':
          return {
            title: 'Delete Upload',
            message: `Are you sure you want to delete the upload "${content.fileName}"? This action cannot be undone.`,
            endpoint: `/questions/admin/content-delete/${content.id}/`
          }
        default:
          return null
      }
    }

    const deleteDetails = getDeleteDetails()
    if (!deleteDetails) return

    confirm({
      title: deleteDetails.title,
      message: deleteDetails.message,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          let response
          
          switch (contentType) {
            case 'question_bank':
              response = await apiService.deleteQuestionBank(content.id)
              break
            case 'exam':
              response = await apiService.deleteExam(content.id)
              break
            case 'test':
              response = await apiService.deleteTest(content.id)
              break
            case 'upload':
              response = await apiService.deleteContent(content.id)
              break
            default:
              throw new Error('Delete not supported for this content type')
          }
          
          if (response.success) {
            toast.success(response.message || 'Content deleted successfully')
            // Refresh the content data
            await fetchAllContent()
            if (contentType === 'upload') {
              await fetchUploadItems()
            }
          } else {
            throw new Error(response.message || 'Failed to delete content')
          }
        } catch (error: any) {
          toast.error(error.message || 'Failed to delete content')
          throw error // Re-throw to keep the confirmation dialog open on error
        }
      }
    })
  }

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleSelectAll = (items: any[]) => {
    const itemIds = items.map(item => item.id)
    if (itemIds.every(id => selectedItems.has(id))) {
      // Deselect all
      setSelectedItems(new Set())
    } else {
      // Select all
      setSelectedItems(new Set(itemIds))
    }
  }

  const handleRelinkTests = async () => {
    try {
      const response = await apiService.request('/questions/admin/relink-tests/', {
        method: 'POST',
        body: JSON.stringify({
          test_ids: selectedItems.size > 0 ? Array.from(selectedItems) : [],
          clear_existing: false
        })
      })
      
      if (response.success) {
        const { stats, warnings } = response
        
        let message = `Re-linking completed: ${stats.links_created} links created`
        if (stats.links_skipped > 0) {
          message += `, ${stats.links_skipped} links already existed`
        }
        
        toast.success(message)
        
        if (warnings && warnings.length > 0) {
          warnings.forEach((warning: string) => {
            toast.warning(warning)
          })
        }
        
        // Refresh the content to show updated question counts
        fetchAllContent()
      } else {
        toast.error('Failed to re-link tests')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to re-link tests')
    }
  }

  const handleBulkDelete = (contentType: 'question_bank' | 'exam' | 'test' | 'upload') => {
    if (selectedItems.size === 0) return

    confirm({
      title: `Delete ${selectedItems.size} items`,
      message: `Are you sure you want to delete ${selectedItems.size} selected ${contentType.replace('_', ' ')}${selectedItems.size > 1 ? 's' : ''}? This action cannot be undone.`,
      confirmText: 'Delete All',
      type: 'danger',
      onConfirm: async () => {
        let successCount = 0
        let errorCount = 0

        for (const itemId of selectedItems) {
          try {
            const endpoint = getDeleteEndpoint(contentType, itemId)
            const response = await apiService.request(endpoint, { method: 'DELETE' })
            
            if (response.success) {
              successCount++
            } else {
              errorCount++
            }
          } catch (error) {
            errorCount++
          }
        }

        if (successCount > 0) {
          toast.success(`Successfully deleted ${successCount} item${successCount > 1 ? 's' : ''}`)
          await fetchAllContent()
          if (contentType === 'upload') {
            await fetchUploadItems()
          }
        }

        if (errorCount > 0) {
          toast.error(`Failed to delete ${errorCount} item${errorCount > 1 ? 's' : ''}`)
        }

        setSelectedItems(new Set())
      }
    })
  }

  const getDeleteEndpoint = (contentType: 'question_bank' | 'exam' | 'test' | 'upload', itemId: string) => {
    switch (contentType) {
      case 'question_bank':
        return `/questions/admin/delete-question-bank/${itemId}/`
      case 'exam':
        return `/questions/admin/delete-exam/${itemId}/`
      case 'test':
        return `/questions/admin/delete-test/${itemId}/`
      case 'upload':
        return `/questions/admin/content-delete/${itemId}/`
      default:
        return ''
    }
  }

  const clearSelection = () => {
    setSelectedItems(new Set())
    setBulkActionMode(false)
  }

  if (loadingState.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading content...</span>
      </div>
    )
  }

  if (loadingState.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading content</h3>
            <div className="mt-2 text-sm text-red-700">{loadingState.error}</div>
            <div className="mt-4">
              <button
                onClick={fetchAllContent}
                className="bg-red-100 px-3 py-2 rounded text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!contentData) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FolderIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
              <p className="text-gray-600">View and manage all your exams, tests, question banks, and uploads</p>
            </div>
          </div>
          <button
            onClick={() => {
              fetchAllContent()
              fetchUploadItems()
              setRequirementsCache(new Map()) // Clear requirements cache
              toast.success('Content refreshed successfully')
            }}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FolderIcon className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Question Banks</p>
                <p className="text-2xl font-bold text-blue-900">{contentData.summary.totalQuestionBanks}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <AcademicCapIcon className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Exams</p>
                <p className="text-2xl font-bold text-green-900">{contentData.summary.totalExams}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Tests</p>
                <p className="text-2xl font-bold text-yellow-900">{contentData.summary.totalTests}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Total Questions</p>
                <p className="text-2xl font-bold text-purple-900">{contentData.summary.totalQuestions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Search and Filter */}
        {activeTab !== 'overview' && activeTab !== 'uploads' && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="biology">Biology</option>
                  <option value="general_knowledge">General Knowledge</option>
                  <option value="reasoning">Reasoning</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[...contentData.questionBanks, ...contentData.exams, ...contentData.tests]
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={`${item.id}-${index}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {contentData.questionBanks.includes(item) && <FolderIcon className="h-5 w-5 text-blue-600" />}
                          {contentData.exams.includes(item) && <AcademicCapIcon className="h-5 w-5 text-green-600" />}
                          {contentData.tests.includes(item) && <DocumentTextIcon className="h-5 w-5 text-yellow-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-sm text-gray-500">Updated {formatDate(item.updatedAt)} by {item.createdBy}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              if (contentData.questionBanks.includes(item)) {
                                handleView(item, 'question_bank')
                              } else if (contentData.exams.includes(item)) {
                                handleView(item, 'exam')
                              } else if (contentData.tests.includes(item)) {
                                handleView(item, 'test')
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600" 
                            title="View"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (contentData.questionBanks.includes(item)) {
                                handleEdit(item, 'question_bank')
                              } else if (contentData.exams.includes(item)) {
                                handleEdit(item, 'exam')
                              } else if (contentData.tests.includes(item)) {
                                handleEdit(item, 'test')
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-green-600" 
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (contentData.questionBanks.includes(item)) {
                                handleDelete(item, 'question_bank')
                              } else if (contentData.exams.includes(item)) {
                                handleDelete(item, 'exam')
                              } else if (contentData.tests.includes(item)) {
                                handleDelete(item, 'test')
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-600" 
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'question_banks' && (
            <div className="space-y-4">
              {/* Bulk Actions Header */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={filterContent(contentData.questionBanks).length > 0 && filterContent(contentData.questionBanks).every(bank => selectedItems.has(bank.id))}
                    onChange={() => handleSelectAll(filterContent(contentData.questionBanks))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Select all'}
                  </span>
                </div>
                {selectedItems.size > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBulkDelete('question_bank')}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete Selected ({selectedItems.size})
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {filterContent(contentData.questionBanks).map((bank) => (
                <div key={bank.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(bank.id)}
                        onChange={() => handleSelectItem(bank.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">{bank.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(bank.difficulty)}`}>
                            {bank.difficulty}
                          </span>
                          {bank.importedFromJson && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              JSON Import
                            </span>
                          )}
                          {bank.isPublic && (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Public
                            </span>
                          )}
                          {bank.isFeatured && (
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{bank.description}</p>
                        <div className="flex items-center space-x-6 mt-2 text-sm text-gray-500">
                          <span>📚 {bank.questionCount} questions</span>
                          <span>📂 {bank.category}</span>
                          <span>📖 {bank.subject}</span>
                          <span>👤 {bank.createdBy}</span>
                          <span>📅 {formatDate(bank.createdAt)}</span>
                          <span>🔄 {bank.usageCount} uses</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleView(bank, 'question_bank')}
                        className="p-2 text-gray-400 hover:text-blue-600" 
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(bank, 'question_bank')}
                        className="p-2 text-gray-400 hover:text-green-600" 
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(bank, 'question_bank')}
                        className="p-2 text-gray-400 hover:text-red-600" 
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filterContent(contentData.questionBanks).length === 0 && (
                <div className="text-center py-12">
                  <FolderIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No question banks found</h3>
                  <p className="text-gray-500">
                    {searchTerm || filterCategory
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Create your first question bank to get started.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'exams' && (
            <div className="space-y-4">
              {/* Bulk Actions Header */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={filterContent(contentData.exams).length > 0 && filterContent(contentData.exams).every(exam => selectedItems.has(exam.id))}
                    onChange={() => handleSelectAll(filterContent(contentData.exams))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Select all'}
                  </span>
                </div>
                {selectedItems.size > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBulkDelete('exam')}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete Selected ({selectedItems.size})
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {filterContent(contentData.exams).map((exam) => (
                <div key={exam.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(exam.id)}
                        onChange={() => handleSelectItem(exam.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">{exam.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(exam.difficulty)}`}>
                            {exam.difficulty}
                          </span>
                          <RequirementsDisplay item={exam} type="exam" />
                          {exam.isPublic && (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Public
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{exam.description}</p>
                        <div className="flex items-center space-x-6 mt-2 text-sm text-gray-500">
                          <span>🎯 {exam.testsCount} tests</span>
                          <span>📂 {exam.category}</span>
                          <span>🏢 {exam.organization}</span>
                          <span>⏱️ {exam.duration} min</span>
                          <span>📊 {exam.totalMarks} marks</span>
                          <span>👤 {exam.createdBy}</span>
                          <span>📅 {formatDate(exam.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleView(exam, 'exam')}
                        className="p-2 text-gray-400 hover:text-blue-600" 
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(exam, 'exam')}
                        className="p-2 text-gray-400 hover:text-green-600" 
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(exam, 'exam')}
                        className={`p-2 ${(exam.status === 'draft' || exam.status === 'active') 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-400 hover:text-red-600'}`} 
                        title={
                          exam.status === 'draft' 
                            ? 'Cannot delete draft items - complete requirements first'
                            : exam.status === 'active'
                            ? 'Cannot delete active items - deactivate first'
                            : 'Delete'
                        }
                        disabled={exam.status === 'draft' || exam.status === 'active'}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filterContent(contentData.exams).length === 0 && (
                <div className="text-center py-12">
                  <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
                  <p className="text-gray-500">
                    {searchTerm || filterCategory
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Create your first exam to get started.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-4">
              {/* Bulk Actions Header */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={filterContent(contentData.tests).length > 0 && filterContent(contentData.tests).every(test => selectedItems.has(test.id))}
                    onChange={() => handleSelectAll(filterContent(contentData.tests))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Select all'}
                  </span>
                  <button
                    onClick={handleRelinkTests}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1"
                    title="Re-link tests to question banks based on their JSON references"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    <span>Re-link Question Banks</span>
                  </button>
                </div>
                {selectedItems.size > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBulkDelete('test')}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete Selected ({selectedItems.size})
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {filterContent(contentData.tests).map((test) => (
                <div key={test.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(test.id)}
                        onChange={() => handleSelectItem(test.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">{test.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(test.difficulty)}`}>
                            {test.difficulty}
                          </span>
                          <RequirementsDisplay item={test} type="test" />
                          {test.isPublic && (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Public
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                        <div className="flex items-center space-x-6 mt-2 text-sm text-gray-500">
                          <span>❓ {test.questionsCount} questions</span>
                          <span>📂 {test.category}</span>
                          <span>📖 {test.subject}</span>
                          <span>⏱️ {test.duration} min</span>
                          <span>📊 {test.totalMarks} marks</span>
                          <span>👤 {test.createdBy}</span>
                          <span>📅 {formatDate(test.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleView(test, 'test')}
                        className="p-2 text-gray-400 hover:text-blue-600" 
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(test, 'test')}
                        className="p-2 text-gray-400 hover:text-green-600" 
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(test, 'test')}
                        className={`p-2 ${(test.status === 'draft' || test.status === 'active') 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-400 hover:text-red-600'}`} 
                        title={
                          test.status === 'draft' 
                            ? 'Cannot delete draft items - complete requirements first'
                            : test.status === 'active'
                            ? 'Cannot delete active items - deactivate first'
                            : 'Delete'
                        }
                        disabled={test.status === 'draft' || test.status === 'active'}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filterContent(contentData.tests).length === 0 && (
                <div className="text-center py-12">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
                  <p className="text-gray-500">
                    {searchTerm || filterCategory
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Create your first test to get started.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'uploads' && (
            <div className="space-y-4">
              {/* Bulk Actions Header */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={uploadItems.length > 0 && uploadItems.every(upload => selectedItems.has(upload.id))}
                    onChange={() => handleSelectAll(uploadItems)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Select all'}
                  </span>
                </div>
                {selectedItems.size > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBulkDelete('upload')}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete Selected ({selectedItems.size})
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {uploadItems.map((upload) => (
                <div key={upload.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(upload.id)}
                        onChange={() => handleSelectItem(upload.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">{upload.fileName}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(upload.status)}`}>
                            {upload.status}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {upload.contentType}
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 mt-2 text-sm text-gray-500">
                          <span>📈 {upload.itemsImported} items imported</span>
                          <span>👤 {upload.uploadedBy}</span>
                          <span>📅 {formatDate(upload.uploadedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleView(upload, 'upload')}
                        className="p-2 text-gray-400 hover:text-blue-600" 
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(upload, 'upload')}
                        className="p-2 text-gray-400 hover:text-red-600" 
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {uploadItems.length === 0 && (
                <div className="text-center py-12">
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No uploads found</h3>
                  <p className="text-gray-500">Upload your first JSON file to get started.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ViewContentModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, content: null, contentType: null })}
        content={viewModal.content}
        contentType={viewModal.contentType!}
      />

      <EditContentModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, content: null, contentType: null })}
        content={editModal.content}
        contentType={editModal.contentType!}
        onSave={handleSave}
      />
      
      <ConfirmationDialog />
    </div>
  )
}