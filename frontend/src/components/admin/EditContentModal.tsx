'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/modal'
import { PencilIcon } from '@heroicons/react/24/outline'

interface EditContentModalProps {
  isOpen: boolean
  onClose: () => void
  content: any
  contentType: 'question_bank' | 'exam' | 'test' | 'upload'
  onSave: (updatedContent: any) => Promise<void>
}

export default function EditContentModal({ isOpen, onClose, content, contentType, onSave }: EditContentModalProps) {
  const [formData, setFormData] = useState(() => {
    // Initialize form data with current content values
    return {
      name: content?.name || '',
      description: content?.description || '',
      category: content?.category || '',
      subject: content?.subject || '',
      ...content
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  // Update form data when content changes
  useEffect(() => {
    if (content) {
      setFormData({
        name: content.name || '',
        description: content.description || '',
        category: content.category || '',
        subject: content.subject || '',
        ...content
      })
    }
  }, [content])

  if (!content) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const renderFormFields = () => {
    switch (contentType) {
      case 'question_bank':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={`Current: ${content.name || 'Not set'}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={`Current: ${content.description || 'Not set'}`}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder={`Current: ${content.category || 'Not set'}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={formData.subject || ''}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder={`Current: ${content.subject || 'Not set'}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <input
                  type="text"
                  value={formData.topic || ''}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  placeholder={`Current: ${content.topic || 'Not set'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <input
                  type="text"
                  value={formData.language || ''}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  placeholder={`Current: ${content.language || 'Not set'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                <input
                  type="text"
                  value={formData.examType || ''}
                  onChange={(e) => handleInputChange('examType', e.target.value)}
                  placeholder={`Current: ${content.examType || 'Not set'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  placeholder={`Current: ${content.year || 'Not set'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <input
                type="text"
                value={formData.organization || ''}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                placeholder={`Current: ${content.organization || 'Not set'}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags || ''}
                onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                placeholder={`Current: ${Array.isArray(content.tags) ? content.tags.join(', ') : content.tags || 'Not set'}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={formData.difficulty || 'basic'}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="basic">Basic</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublic || false}
                  onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                  className="mr-2"
                />
                Public
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFeatured || false}
                  onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                  className="mr-2"
                />
                Featured
              </label>
            </div>
            
            {/* Original JSON Data Editor */}
            {(content.original_json_data || content.jsonData) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Original JSON Data</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Edit the original JSON fields directly. Changes will be saved to the database.
                </p>
                
                <textarea
                  value={formData.originalJsonData ? JSON.stringify(formData.originalJsonData, null, 2) : JSON.stringify(content.original_json_data || content.jsonData, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      handleInputChange('originalJsonData', parsed)
                    } catch (error) {
                      // Keep the text as is if JSON is invalid during editing
                      handleInputChange('originalJsonDataText', e.target.value)
                    }
                  }}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="JSON data..."
                />
                
                <div className="mt-2 text-xs text-gray-500">
                  Tip: This includes all original fields from the uploaded JSON file.
                </div>
              </div>
            )}
          </div>
        )

      case 'exam':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={`Current: ${content.name || 'Not set'}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={`Current: ${content.description || 'Not set'}`}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder={`Current: ${content.category || 'Not set'}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <input
                type="text"
                value={formData.organization || ''}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                placeholder={`Current: ${content.organization || 'Not set'}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={formData.subject || ''}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder={`Current: ${content.subject || 'Not set'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <input
                  type="text"
                  value={formData.topic || ''}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  placeholder={`Current: ${content.topic || 'Not set'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                <input
                  type="text"
                  value={formData.examType || ''}
                  onChange={(e) => handleInputChange('examType', e.target.value)}
                  placeholder={`Current: ${content.examType || 'Not set'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <input
                  type="text"
                  value={formData.language || ''}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  placeholder={`Current: ${content.language || 'Not set'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  placeholder={`Current: ${content.year || 'Not set'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <input
                  type="text"
                  value={formData.targetAudience || ''}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  placeholder={`Current: ${content.targetAudience || 'Not set'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration || ''}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                <input
                  type="number"
                  value={formData.totalMarks || ''}
                  onChange={(e) => handleInputChange('totalMarks', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={formData.difficulty || 'basic'}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="basic">Basic</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive || false}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="mr-2"
                />
                Active
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublic || false}
                  onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                  className="mr-2"
                />
                Public
              </label>
            </div>
            
            {/* Original JSON Data Editor */}
            {(content.original_json_data || content.jsonData) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Original JSON Data</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Edit the original JSON fields directly. Changes will be saved to the database.
                </p>
                
                <textarea
                  value={formData.originalJsonData ? JSON.stringify(formData.originalJsonData, null, 2) : JSON.stringify(content.original_json_data || content.jsonData, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      handleInputChange('originalJsonData', parsed)
                    } catch (error) {
                      // Keep the text as is if JSON is invalid during editing
                      handleInputChange('originalJsonDataText', e.target.value)
                    }
                  }}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="JSON data..."
                />
                
                <div className="mt-2 text-xs text-gray-500">
                  Tip: This includes all original fields from the uploaded JSON file.
                </div>
              </div>
            )}
          </div>
        )

      case 'test':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={`Current: ${content.name || 'Not set'}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={`Current: ${content.description || 'Not set'}`}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder={`Current: ${content.category || 'Not set'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={formData.subject || ''}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder={`Current: ${content.subject || 'Not set'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration || ''}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  placeholder={`Current: ${content.duration || 'Not set'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                <input
                  type="number"
                  value={formData.totalMarks || ''}
                  onChange={(e) => handleInputChange('totalMarks', parseInt(e.target.value))}
                  placeholder={`Current: ${content.totalMarks || 'Not set'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Count</label>
                <input
                  type="number"
                  value={formData.questionCount || ''}
                  onChange={(e) => handleInputChange('questionCount', parseInt(e.target.value))}
                  placeholder={`Current: ${content.questionCount || 'Not set'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pass Percentage</label>
                <input
                  type="number"
                  value={formData.passPercentage || ''}
                  onChange={(e) => handleInputChange('passPercentage', parseFloat(e.target.value))}
                  placeholder={`Current: ${content.passPercentage || 'Not set'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
                <input
                  type="number"
                  value={formData.maxAttempts || ''}
                  onChange={(e) => handleInputChange('maxAttempts', parseInt(e.target.value))}
                  placeholder={`Current: ${content.maxAttempts || 'Not set'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Negative Marks</label>
                <input
                  type="number"
                  step="0.25"
                  value={formData.negativeMarks || ''}
                  onChange={(e) => handleInputChange('negativeMarks', parseFloat(e.target.value))}
                  placeholder={`Current: ${content.negativeMarks || 'Not set'}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
              <textarea
                value={formData.instructions || ''}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder={`Current: ${content.instructions || 'Not set'}`}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={formData.difficulty || 'basic'}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="basic">Basic</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive || false}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="mr-2"
                  />
                  Active
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPublic || false}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    className="mr-2"
                  />
                  Public
                </label>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.randomizeQuestions || false}
                    onChange={(e) => handleInputChange('randomizeQuestions', e.target.checked)}
                    className="mr-2"
                  />
                  Randomize Questions
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.showResultImmediately || false}
                    onChange={(e) => handleInputChange('showResultImmediately', e.target.checked)}
                    className="mr-2"
                  />
                  Show Result Immediately
                </label>
              </div>
            </div>
            
            {/* Original JSON Data Editor */}
            {(content.original_json_data || content.jsonData) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Original JSON Data</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Edit the original JSON fields directly. Changes will be saved to the database.
                </p>
                
                <textarea
                  value={formData.originalJsonData ? JSON.stringify(formData.originalJsonData, null, 2) : JSON.stringify(content.original_json_data || content.jsonData, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      handleInputChange('originalJsonData', parsed)
                    } catch (error) {
                      // Keep the text as is if JSON is invalid during editing
                      handleInputChange('originalJsonDataText', e.target.value)
                    }
                  }}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="JSON data..."
                />
                
                <div className="mt-2 text-xs text-gray-500">
                  Tip: This includes all original fields like bank_name, question_bank_references, etc.
                </div>
              </div>
            )}
          </div>
        )

      default:
        return <div>Edit functionality not available for this content type.</div>
    }
  }

  const getTitle = () => {
    switch (contentType) {
      case 'question_bank': return 'Edit Question Bank'
      case 'exam': return 'Edit Exam'
      case 'test': return 'Edit Test'
      case 'upload': return 'Edit Upload'
      default: return 'Edit Content'
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={getTitle()}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <PencilIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {getTitle()}
            </h3>
            <p className="text-gray-600 mt-1">
              Update the information below to modify this {contentType.replace('_', ' ')}.
            </p>
          </div>
        </div>

        {/* Form Fields */}
        {renderFormFields()}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}