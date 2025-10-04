'use client'

import { useState, useRef } from 'react'
import { CloudArrowUpIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { apiService } from '@/lib/api'

interface UploadStatus {
  status: 'idle' | 'uploading' | 'validating' | 'success' | 'error'
  message: string
  progress: number
  uploadId?: string
}

interface ValidationResult {
  valid: boolean
  itemsCount: number
  summary: string
  errors?: string[]
}

export default function ContentUploadSection() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    message: '',
    progress: 0
  })
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileNameSource, setFileNameSource] = useState<'manual' | 'json' | 'filename'>('manual')
  const [contentType, setContentType] = useState('question_bank')
  const [importMode, setImportMode] = useState('create_new')
  const [selectedBank, setSelectedBank] = useState('')
  const [existingBanks, setExistingBanks] = useState([])
  const [loadingBanks, setLoadingBanks] = useState(false)
  const [showExistingBanks, setShowExistingBanks] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const contentTypes = [
    { value: 'question_bank', label: 'Question Bank' },
    { value: 'exam', label: 'Complete Exam' },
    { value: 'test', label: 'Single Test' },
    { value: 'mixed', label: 'Mixed Content' }
  ]

  const importModes = [
    { value: 'create_new', label: 'Create New', description: 'Create new content entries' },
    { value: 'append_existing', label: 'Append to Existing', description: 'Add to existing question bank' },
    { value: 'merge_update', label: 'Merge & Update', description: 'Merge with duplicate detection' },
    { value: 'replace_existing', label: 'Replace Existing', description: 'Replace existing content completely' }
  ]

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'application/json') {
        setUploadStatus({
          status: 'error',
          message: 'Please select a valid JSON file',
          progress: 0
        })
        return
      }
      
      setSelectedFile(file)
      
      // Try to extract file name from JSON content
      try {
        const text = await file.text()
        const jsonData = JSON.parse(text)
        if (jsonData.name && typeof jsonData.name === 'string' && jsonData.name.trim()) {
          setFileName(jsonData.name.trim())
          setFileNameSource('json')
        } else if (!fileName) {
          setFileName(file.name.replace('.json', ''))
          setFileNameSource('filename')
        }
      } catch (error) {
        // If JSON parsing fails, fall back to file name
        if (!fileName) {
          setFileName(file.name.replace('.json', ''))
          setFileNameSource('filename')
        }
      }
      
      setUploadStatus({ status: 'idle', message: '', progress: 0 })
      setValidationResult(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !fileName.trim()) {
      setUploadStatus({
        status: 'error',
        message: 'Please select a file and enter a file name',
        progress: 0
      })
      return
    }

    setUploadStatus({
      status: 'uploading',
      message: 'Uploading file...',
      progress: 30
    })

    try {
      const formData = new FormData()
      formData.append('json_file', selectedFile)
      formData.append('file_name', fileName.trim())
      formData.append('content_type', contentType)
      formData.append('import_mode', importMode)
      if (selectedBank) {
        formData.append('target_bank_id', selectedBank)
      }

      const response = await apiService.request('/questions/admin/content-upload/', {
        method: 'POST',
        body: formData,
        headers: {}, // Don't set Content-Type for FormData
      })

      setUploadStatus({
        status: 'validating',
        message: 'Validating content structure...',
        progress: 70
      })

      // Simulate validation time
      await new Promise(resolve => setTimeout(resolve, 2000))

      if (response.success) {
        setUploadStatus({
          status: 'success',
          message: 'Upload completed successfully!',
          progress: 100,
          uploadId: response.uploadId
        })

        setValidationResult({
          valid: true,
          itemsCount: response.itemsCount || 0,
          summary: response.summary || 'Content validated successfully'
        })
      } else {
        throw new Error(response.message || 'Upload failed')
      }
    } catch (error: any) {
      setUploadStatus({
        status: 'error',
        message: error.message || 'Upload failed',
        progress: 0
      })
      
      if (error.errors) {
        setValidationResult({
          valid: false,
          itemsCount: 0,
          summary: 'Validation failed',
          errors: error.errors
        })
      }
    }
  }

  const fetchExistingBanks = async (forceLoad = false) => {
    if (importMode === 'create_new' && !forceLoad) return
    
    setLoadingBanks(true)
    try {
      const response = await apiService.request('/questions/admin/existing-banks/')
      if (response.success) {
        setExistingBanks(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch existing banks:', error)
    } finally {
      setLoadingBanks(false)
    }
  }

  const handleImportModeChange = (mode: string) => {
    setImportMode(mode)
    setSelectedBank('')
    if (mode !== 'create_new') {
      fetchExistingBanks()
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setFileName('')
    setFileNameSource('manual')
    setImportMode('create_new')
    setSelectedBank('')
    setUploadStatus({ status: 'idle', message: '', progress: 0 })
    setValidationResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleProcessContent = async () => {
    if (!uploadStatus.uploadId) {
      console.error('No upload ID available')
      return
    }

    console.log('Processing content with upload ID:', uploadStatus.uploadId)
    console.log('Button clicked - handleProcessContent called')
    
    try {
      setUploadStatus({
        status: 'validating',
        message: 'Processing content and creating database entries...',
        progress: 50,
        uploadId: uploadStatus.uploadId
      })

      // Call the API to process the uploaded content
      const response = await apiService.request(`/questions/admin/content-process/${uploadStatus.uploadId}/`, {
        method: 'POST'
      })

      if (response.success) {
        setUploadStatus({
          status: 'success',
          message: `Content processed successfully! Created ${response.created_count || 0} items.`,
          progress: 100,
          uploadId: uploadStatus.uploadId
        })
        
        // Update validation result to show processing complete
        setValidationResult({
          valid: true,
          itemsCount: response.created_count || 0,
          summary: `Successfully processed and created ${response.created_count || 0} items in the database`
        })
      } else {
        throw new Error(response.message || 'Failed to process content')
      }
    } catch (error: any) {
      console.error('Failed to process content:', error)
      setUploadStatus({
        status: 'error',
        message: error.message || 'Failed to process content',
        progress: 0,
        uploadId: uploadStatus.uploadId
      })
    }
  }

  const getStatusIcon = () => {
    switch (uploadStatus.status) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-600" />
      default:
        return <CloudArrowUpIcon className="h-6 w-6 text-blue-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CloudArrowUpIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">JSON Content Upload</h2>
            <p className="text-gray-600">Upload and validate JSON files containing questions, exams, and tests</p>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* File Name Input */}
          <div>
            <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 mb-2">
              File Name
              {fileNameSource === 'json' && (
                <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  📄 Extracted from JSON
                </span>
              )}
              {fileNameSource === 'filename' && (
                <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  📁 From file name
                </span>
              )}
            </label>
            <input
              type="text"
              id="fileName"
              value={fileName}
              onChange={(e) => {
                setFileName(e.target.value)
                setFileNameSource('manual')
              }}
              placeholder="Enter a descriptive name for this upload"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Content Type Selection */}
          <div>
            <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-2">
              Content Type
            </label>
            <select
              id="contentType"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {contentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Import Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Import Mode
            </label>
            <div className="space-y-3">
              {importModes.map((mode) => (
                <label key={mode.value} className="flex items-start">
                  <input
                    type="radio"
                    name="importMode"
                    value={mode.value}
                    checked={importMode === mode.value}
                    onChange={(e) => handleImportModeChange(e.target.value)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{mode.label}</div>
                    <div className="text-xs text-gray-500">{mode.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Existing Question Bank Selection */}
          {importMode !== 'create_new' && contentType === 'question_bank' && (
            <div>
              <label htmlFor="existingBank" className="block text-sm font-medium text-gray-700 mb-2">
                Select Existing Question Bank
              </label>
              {loadingBanks ? (
                <div className="flex items-center py-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Loading question banks...
                </div>
              ) : (
                <select
                  id="existingBank"
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required={importMode !== 'create_new'}
                >
                  <option value="">Choose a question bank...</option>
                  {existingBanks.map((bank: any) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name} ({bank.questionCount} questions) - {bank.category}
                    </option>
                  ))}
                </select>
              )}
              
              {selectedBank && (
                <div className="mt-2 p-3 bg-blue-50 rounded-md">
                  <div className="text-sm">
                    <strong>Selected Bank Details:</strong>
                    {(() => {
                      const bank = existingBanks.find((b: any) => b.id === selectedBank)
                      return bank ? (
                        <div className="mt-1 text-gray-700">
                          <div>Name: {bank.name}</div>
                          <div>Questions: {bank.questionCount}</div>
                          <div>Category: {bank.category}</div>
                          <div>Last Updated: {new Date(bank.updatedAt).toLocaleDateString()}</div>
                        </div>
                      ) : null
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JSON File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".json"
                      className="sr-only"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">JSON files only</p>
                {selectedFile && (
                  <p className="text-sm text-green-600 font-medium">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex space-x-3">
            <button
              onClick={handleUpload}
              disabled={
                !selectedFile || 
                !fileName.trim() || 
                (importMode !== 'create_new' && contentType === 'question_bank' && !selectedBank) ||
                uploadStatus.status === 'uploading' || 
                uploadStatus.status === 'validating'
              }
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploadStatus.status === 'uploading' || uploadStatus.status === 'validating' 
                ? 'Processing...' 
                : importMode === 'create_new' 
                  ? 'Upload Content' 
                  : 'Upload & ' + importModes.find(m => m.value === importMode)?.label
              }
            </button>
            
            <button
              onClick={resetUpload}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Upload Status */}
      {uploadStatus.status !== 'idle' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            {getStatusIcon()}
            <h3 className="text-lg font-medium text-gray-900">Upload Status</h3>
          </div>
          
          {/* Progress Bar */}
          {(uploadStatus.status === 'uploading' || uploadStatus.status === 'validating') && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{uploadStatus.message}</span>
                <span>{uploadStatus.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadStatus.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Status Message */}
          <p className={`text-sm ${
            uploadStatus.status === 'success' ? 'text-green-600' : 
            uploadStatus.status === 'error' ? 'text-red-600' : 
            'text-blue-600'
          }`}>
            {uploadStatus.message}
          </p>

          {/* Validation Results */}
          {validationResult && (
            <div className="mt-4 p-4 rounded-md bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Validation Results</h4>
              
              {validationResult.valid ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">✅ {validationResult.summary}</p>
                  <p className="text-sm text-gray-600">
                    Items found: {validationResult.itemsCount}
                  </p>
                  
                  {uploadStatus.uploadId && (
                    <div className="mt-4">
                      <button 
                        onClick={handleProcessContent}
                        disabled={uploadStatus.status === 'validating'}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadStatus.status === 'validating' ? 'Processing...' : 'Process Content →'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-red-600">❌ {validationResult.summary}</p>
                  {validationResult.errors && (
                    <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                      {validationResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Existing Question Banks */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Existing Question Banks</h3>
          <button
            onClick={() => {
              setShowExistingBanks(!showExistingBanks)
              if (!showExistingBanks && existingBanks.length === 0) {
                fetchExistingBanks(true)
              }
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showExistingBanks ? 'Hide' : 'View Existing Banks'}
          </button>
        </div>
        
        {showExistingBanks && (
          <div>
            {loadingBanks ? (
              <div className="flex items-center py-4 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Loading question banks...
              </div>
            ) : existingBanks.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  These question banks already exist. Make sure your JSON uses a different name or choose an appropriate import mode.
                </p>
                <div className="max-h-60 overflow-y-auto">
                  {existingBanks.map((bank: any) => (
                    <div key={bank.id} className="p-3 border rounded-md bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{bank.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{bank.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>📚 {bank.questionCount} questions</span>
                            <span>📂 {bank.category}</span>
                            <span>👤 {bank.createdBy}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          bank.difficulty === 'basic' ? 'bg-green-100 text-green-800' :
                          bank.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          bank.difficulty === 'advanced' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {bank.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No question banks found.</p>
            )}
          </div>
        )}
      </div>

      {/* JSON Format Guide */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Supported JSON Formats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">Question Bank</h4>
            <p className="text-sm text-gray-600">Collection of questions for a specific topic or category</p>
          </div>
          <div className="p-4 border rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">Complete Exam</h4>
            <p className="text-sm text-gray-600">Full exam structure with multiple tests and questions</p>
          </div>
          <div className="p-4 border rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">Single Test</h4>
            <p className="text-sm text-gray-600">Individual test with questions and configuration</p>
          </div>
          <div className="p-4 border rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">Mixed Content</h4>
            <p className="text-sm text-gray-600">Multiple content types in a single file</p>
          </div>
        </div>
      </div>
    </div>
  )
}