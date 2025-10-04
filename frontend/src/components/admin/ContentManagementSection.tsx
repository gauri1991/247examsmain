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
  CloudArrowUpIcon
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
  const { ConfirmationDialog, confirm } = useConfirmation()

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
            message: `Are you sure you want to delete the exam "${content.name}"? This action cannot be undone and will remove all associated tests.`,
            endpoint: `/questions/admin/delete-exam/${content.id}/`
          }
        case 'test':
          return {
            title: 'Delete Test',
            message: `Are you sure you want to delete the test "${content.name}"? This action cannot be undone.`,
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
        <div className="flex items-center space-x-3 mb-4">
          <FolderIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
            <p className="text-gray-600">View and manage all your exams, tests, question banks, and uploads</p>
          </div>
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
                          <span className={`px-2 py-1 text-xs rounded-full ${exam.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {exam.isActive ? 'Active' : 'Inactive'}
                          </span>
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
                        className="p-2 text-gray-400 hover:text-red-600" 
                        title="Delete"
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
                          <span className={`px-2 py-1 text-xs rounded-full ${test.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {test.isActive ? 'Active' : 'Inactive'}
                          </span>
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
                        className="p-2 text-gray-400 hover:text-red-600" 
                        title="Delete"
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