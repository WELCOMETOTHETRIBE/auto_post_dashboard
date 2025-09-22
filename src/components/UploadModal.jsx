import React, { useState } from 'react'
import { uploadPost } from '../services/api'

function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  // Removed drag and drop functionality for iOS compatibility

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      return
    }

    setIsUploading(true)
    try {
      const uploadData = new FormData()
      uploadData.append('image', selectedFile)
      uploadData.append('caption', '') // Empty - will be filled in edit
      uploadData.append('hashtags', '') // Empty - will be filled in edit
      uploadData.append('product', '') // Empty - will be filled in edit
      uploadData.append('brand', 'wttt')
      uploadData.append('platforms', 'instagram,facebook,twitter')
      uploadData.append('hourDelay', '0')

      const result = await uploadPost(uploadData)
      onUploadSuccess(result.post)
      handleClose()
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload New Post</h2>
            <p className="text-gray-600 mt-1">Add an image to create a new draft</p>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200"
          >
            <i className="fas fa-times text-gray-600"></i>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Zone */}
            <div>
              <label className="form-label">Choose Image</label>
              <div
                className={`upload-zone ${selectedFile ? 'has-file' : ''}`}
                onClick={() => document.getElementById('file-input').click()}
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <i className="fas fa-check text-green-600 text-2xl"></i>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(null)
                      }}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-gentle-bounce">
                      <i className="fas fa-camera text-blue-600 text-2xl"></i>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">Choose an image</p>
                      <p className="text-gray-500">Tap to select from your device</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      Supports JPG, PNG, GIF up to 10MB
                    </div>
                  </div>
                )}
              </div>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="fas fa-info text-white text-xs"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">What happens next?</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Your image will be added to drafts. Click "Edit" on the draft to add captions, hashtags, and schedule your post.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="flex flex-1 flex-col-reverse sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-ghost w-full sm:w-auto"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn btn-primary w-full sm:w-auto"
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i>
                  Add to Drafts
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadModal