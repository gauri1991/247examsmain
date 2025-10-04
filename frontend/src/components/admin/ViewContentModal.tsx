'use client'

import Modal from '@/components/ui/modal'
import { 
  FolderIcon, 
  DocumentTextIcon, 
  AcademicCapIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  BookOpenIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface ViewContentModalProps {
  isOpen: boolean
  onClose: () => void
  content: any
  contentType: 'question_bank' | 'exam' | 'test' | 'upload'
}

export default function ViewContentModal({ isOpen, onClose, content, contentType }: ViewContentModalProps) {
  if (!content) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  const getStatusColor = (status: string, isActive?: boolean) => {
    if (isActive !== undefined) {
      return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderQuestionBankDetails = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <FolderIcon className="h-8 w-8 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{content.name}</h3>
          <p className="text-gray-600 mt-1">{content.description}</p>
          <div className="flex items-center space-x-3 mt-3">
            <span className={`px-3 py-1 text-sm rounded-full ${getDifficultyColor(content.difficulty)}`}>
              {content.difficulty}
            </span>
            {content.importedFromJson && (
              <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                JSON Import
              </span>
            )}
            {content.isPublic && (
              <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                Public
              </span>
            )}
            {content.isFeatured && (
              <span className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-800">
                Featured
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <BookOpenIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Questions</p>
              <p className="font-medium">{content.questionCount} questions</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <TagIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium">{content.category}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Subject</p>
              <p className="font-medium">{content.subject}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Usage Count</p>
              <p className="font-medium">{content.usageCount} times</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <UserIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Created By</p>
              <p className="font-medium">{content.createdBy}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium">{formatDate(content.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium">{formatDate(content.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Topics */}
      {content.topics && content.topics.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">Topics Covered</h4>
          <div className="flex flex-wrap gap-2">
            {content.topics.map((topic: string, index: number) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderExamDetails = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-green-100 rounded-lg">
          <AcademicCapIcon className="h-8 w-8 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{content.name}</h3>
          <p className="text-gray-600 mt-1">{content.description}</p>
          <div className="flex items-center space-x-3 mt-3">
            <span className={`px-3 py-1 text-sm rounded-full ${getDifficultyColor(content.difficulty)}`}>
              {content.difficulty}
            </span>
            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor('', content.isActive)}`}>
              {content.isActive ? 'Active' : 'Inactive'}
            </span>
            {content.isPublic && (
              <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                Public
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Tests</p>
              <p className="font-medium">{content.testsCount} tests</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <TagIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium">{content.category}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium">{content.duration} minutes</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Total Marks</p>
              <p className="font-medium">{content.totalMarks} marks</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <UserIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Organization</p>
              <p className="font-medium">{content.organization}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <UserIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Created By</p>
              <p className="font-medium">{content.createdBy}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium">{formatDate(content.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTestDetails = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-yellow-100 rounded-lg">
          <DocumentTextIcon className="h-8 w-8 text-yellow-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{content.name}</h3>
          <p className="text-gray-600 mt-1">{content.description}</p>
          <div className="flex items-center space-x-3 mt-3">
            <span className={`px-3 py-1 text-sm rounded-full ${getDifficultyColor(content.difficulty)}`}>
              {content.difficulty}
            </span>
            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor('', content.isActive)}`}>
              {content.isActive ? 'Active' : 'Inactive'}
            </span>
            {content.isPublic && (
              <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                Public
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <BookOpenIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Questions</p>
              <p className="font-medium">{content.questionsCount} questions</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <TagIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium">{content.category}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Subject</p>
              <p className="font-medium">{content.subject}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium">{content.duration} minutes</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Total Marks</p>
              <p className="font-medium">{content.totalMarks} marks</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <UserIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Created By</p>
              <p className="font-medium">{content.createdBy}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium">{formatDate(content.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderUploadDetails = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <DocumentTextIcon className="h-8 w-8 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{content.fileName}</h3>
          <div className="flex items-center space-x-3 mt-3">
            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(content.status)}`}>
              {content.status}
            </span>
            <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
              {content.contentType}
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Items Imported</p>
              <p className="font-medium">{content.itemsImported} items</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <UserIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Uploaded By</p>
              <p className="font-medium">{content.uploadedBy}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Uploaded At</p>
              <p className="font-medium">{formatDate(content.uploadedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const getTitle = () => {
    switch (contentType) {
      case 'question_bank': return 'Question Bank Details'
      case 'exam': return 'Exam Details'
      case 'test': return 'Test Details'
      case 'upload': return 'Upload Details'
      default: return 'Content Details'
    }
  }

  const renderContent = () => {
    switch (contentType) {
      case 'question_bank': return renderQuestionBankDetails()
      case 'exam': return renderExamDetails()
      case 'test': return renderTestDetails()
      case 'upload': return renderUploadDetails()
      default: return <div>Content type not supported</div>
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={getTitle()}
      size="xl"
    >
      {renderContent()}
    </Modal>
  )
}