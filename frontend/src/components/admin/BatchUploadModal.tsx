'use client'

import { useState, useRef } from 'react'
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { apiService } from '@/lib/api'
import Modal from '@/components/ui/modal'

interface BatchFile {
  id: string
  file: File
  fileName: string
  contentType: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  message: string
  uploadId?: string
  itemsCount?: number
}

interface BatchUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: (results: BatchFile[]) => void
}

export default function BatchUploadModal({ isOpen, onClose, onComplete }: BatchUploadModalProps) {
  const [files, setFiles] = useState<BatchFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [globalProgress, setGlobalProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const contentTypes = [
    { value: 'question_bank', label: 'Question Bank' },
    { value: 'exam', label: 'Complete Exam' },
    { value: 'test', label: 'Single Test' },
    { value: 'mixed', label: 'Mixed Content' }
  ]

  const handleFilesSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    
    const newFiles: BatchFile[] = []
    
    for (const file of selectedFiles) {
      if (file.type !== 'application/json') {
        continue // Skip non-JSON files
      }

      let fileName = file.name.replace('.json', '')
      let contentType = 'question_bank'
      let detectedType = 'filename'

      // Try to extract metadata from JSON
      try {
        // Create a new FileReader to avoid consuming the file
        const reader = new FileReader()
        const text = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = reject
          reader.readAsText(file)
        })
        
        const jsonData = JSON.parse(text)
        
        if (jsonData.name && typeof jsonData.name === 'string') {
          fileName = jsonData.name.trim()
        }

        // Primary detection: Use the category field if present (most reliable)
        if (jsonData.category && typeof jsonData.category === 'string') {
          const category = jsonData.category.toLowerCase()
          
          if (category === 'test') {
            contentType = 'test'
            detectedType = 'test (from category field)'
          } else if (category === 'exam') {
            contentType = 'exam'
            detectedType = 'exam (from category field)'
          } else if (category === 'question_bank') {
            contentType = 'question_bank'
            detectedType = 'question bank (from category field)'
          } else if (category === 'mixed') {
            contentType = 'mixed'
            detectedType = 'mixed (from category field)'
          } else {
            // If category field exists but has unexpected value, use it anyway
            contentType = 'question_bank' // default fallback
            detectedType = `question bank (unknown category: ${category})`
          }
        } 
        // Fallback detection: Use JSON structure analysis
        else if (jsonData.tests && Array.isArray(jsonData.tests) && jsonData.tests.length > 0) {
          contentType = 'exam'
          detectedType = 'exam (contains tests array)'
        } else if ((jsonData.title || jsonData.name) && 
                   (jsonData.duration_minutes || jsonData.duration || jsonData.test_settings?.duration_minutes) && 
                   !jsonData.tests) {
          contentType = 'test'
          detectedType = 'test (has title/name + duration)'
        } else if (jsonData.content && Array.isArray(jsonData.content) && jsonData.content.length > 0) {
          contentType = 'mixed'
          detectedType = 'mixed (contains content array)'
        } else if (jsonData.questions && Array.isArray(jsonData.questions) && jsonData.questions.length > 0) {
          contentType = 'question_bank'
          detectedType = 'question bank (contains questions array)'
        } else {
          // Additional fallback checks
          const keys = Object.keys(jsonData)
          if (keys.includes('exam_type') || keys.includes('organization')) {
            contentType = 'exam'
            detectedType = 'exam (has exam_type/organization)'
          } else if (keys.includes('pass_percentage') || keys.includes('max_attempts') || keys.includes('test_settings')) {
            contentType = 'test'
            detectedType = 'test (has test-specific fields)'
          } else {
            contentType = 'question_bank'
            detectedType = 'question bank (default fallback)'
          }
        }
      } catch (error) {
        console.log(`Failed to parse JSON for ${file.name}:`, error)
        detectedType = 'default (parse error)'
      }

      const batchFile: BatchFile = {
        id: Math.random().toString(36).substring(2, 15),
        file,
        fileName,
        contentType,
        status: 'pending',
        progress: 0,
        message: `Auto-detected: ${detectedType}`
      }

      newFiles.push(batchFile)
    }

    setFiles(prev => [...prev, ...newFiles])
  }

  const updateFile = (id: string, updates: Partial<BatchFile>) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, ...updates } : file
    ))
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const uploadFile = async (file: BatchFile): Promise<boolean> => {
    updateFile(file.id, { status: 'uploading', progress: 0, message: 'Uploading...' })

    try {
      const formData = new FormData()
      formData.append('json_file', file.file)
      formData.append('file_name', file.fileName)
      formData.append('content_type', file.contentType)
      formData.append('import_mode', 'create_new')

      updateFile(file.id, { progress: 30, message: 'Uploading file...' })

      const response = await apiService.request('/questions/admin/content-upload/', {
        method: 'POST',
        body: formData,
        headers: {},
      })

      updateFile(file.id, { progress: 70, message: 'Processing content...' })

      if (response.success) {
        // Auto-process the content
        const processResponse = await apiService.request(`/questions/admin/content-process/${response.uploadId}/`, {
          method: 'POST'
        })

        if (processResponse.success) {
          updateFile(file.id, {
            status: 'success',
            progress: 100,
            message: `Successfully created ${processResponse.created_count || 0} items`,
            uploadId: response.uploadId,
            itemsCount: processResponse.created_count || 0
          })
          return true
        } else {
          throw new Error(processResponse.message || 'Failed to process content')
        }
      } else {
        throw new Error(response.message || 'Upload failed')
      }
    } catch (error: any) {
      updateFile(file.id, {
        status: 'error',
        progress: 0,
        message: error.message || 'Upload failed'
      })
      return false
    }
  }

  const startBatchUpload = async () => {
    setIsUploading(true)
    setIsPaused(false)
    
    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error')
    let completed = 0
    let successful = 0

    for (const file of pendingFiles) {
      if (isPaused) break

      const success = await uploadFile(file)
      if (success) successful++
      
      completed++
      setGlobalProgress((completed / pendingFiles.length) * 100)
      
      // Small delay between uploads to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsUploading(false)
    
    if (onComplete) {
      onComplete(files)
    }
  }

  const pauseUpload = () => {
    setIsPaused(true)
    setIsUploading(false)
  }

  const resetAll = () => {
    setFiles([])
    setIsUploading(false)
    setIsPaused(false)
    setGlobalProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      case 'uploading':
        return <CloudArrowUpIcon className="h-5 w-5 text-blue-600 animate-pulse" />
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'uploading': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const completedCount = files.filter(f => f.status === 'success').length
  const errorCount = files.filter(f => f.status === 'error').length
  const pendingCount = files.filter(f => f.status === 'pending').length

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Batch Upload JSON Files" size="2xl">
      <div className="space-y-6">
        {/* File Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Multiple JSON Files
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
            <div className="space-y-1 text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="batch-file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                >
                  <span>Select multiple files</span>
                  <input
                    ref={fileInputRef}
                    id="batch-file-upload"
                    name="batch-file-upload"
                    type="file"
                    accept=".json"
                    multiple
                    className="sr-only"
                    onChange={handleFilesSelect}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">JSON files only, multiple selection supported</p>
            </div>
          </div>
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Selected Files ({files.length})
              </h3>
              <div className="flex space-x-2">
                {!isUploading && pendingCount > 0 && (
                  <button
                    onClick={startBatchUpload}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <PlayIcon className="h-4 w-4 mr-1" />
                    Start Upload
                  </button>
                )}
                {isUploading && !isPaused && (
                  <button
                    onClick={pauseUpload}
                    className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                  >
                    <PauseIcon className="h-4 w-4 mr-1" />
                    Pause
                  </button>
                )}
                <button
                  onClick={resetAll}
                  disabled={isUploading && !isPaused}
                  className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Clear All
                </button>
              </div>
            </div>

            {/* Global Progress */}
            {isUploading && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Overall Progress</span>
                  <span>{Math.round(globalProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${globalProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                <div className="text-sm text-green-700">Completed</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{pendingCount}</div>
                <div className="text-sm text-gray-700">Pending</div>
              </div>
            </div>

            {/* Files List */}
            <div className="max-h-96 overflow-y-auto space-y-3">
              {files.map((file) => (
                <div key={file.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(file.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">{file.fileName}</h4>
                        <p className="text-sm text-gray-500">{file.file.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={file.contentType}
                        onChange={(e) => updateFile(file.id, { contentType: e.target.value })}
                        disabled={file.status === 'uploading' || file.status === 'success'}
                        className="text-sm border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                      >
                        {contentTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {file.status === 'pending' && (
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <div className="mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Status Message */}
                  <p className={`text-sm ${getStatusColor(file.status)}`}>
                    {file.message}
                    {file.itemsCount && file.status === 'success' && (
                      <span className="ml-2 text-green-600">
                        ({file.itemsCount} items created)
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}