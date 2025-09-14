import React from 'react'

function EmptyState({ onUpload }) {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i className="fas fa-image text-gray-400 text-3xl"></i>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
      <p className="text-gray-600 mb-6">Upload your first post to get started</p>
      <button 
        onClick={onUpload}
        className="btn-primary"
      >
        <i className="fas fa-plus mr-2"></i>
        Upload Post
      </button>
    </div>
  )
}

export default EmptyState
