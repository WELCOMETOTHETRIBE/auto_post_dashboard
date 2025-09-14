import React from 'react'

function EmptyState({ onUpload }) {
  return (
    <div className="text-center py-20">
      <div className="w-32 h-32 glass-card rounded-full flex items-center justify-center mx-auto mb-8 floating-animation">
        <i className="fas fa-image text-4xl gradient-text"></i>
      </div>
      <h3 className="text-3xl font-bold gradient-text mb-4">No posts yet</h3>
      <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
        Start your social media journey by uploading your first post. Create amazing content and watch it come to life!
      </p>
      <button 
        onClick={onUpload}
        className="btn-primary text-lg px-8 py-4"
      >
        <i className="fas fa-plus mr-3"></i>
        Upload Your First Post
      </button>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
        <div className="glass-card p-6 rounded-xl">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-upload text-white"></i>
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Upload</h4>
          <p className="text-sm text-gray-600">Add your images and content</p>
        </div>
        
        <div className="glass-card p-6 rounded-xl">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-edit text-white"></i>
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Customize</h4>
          <p className="text-sm text-gray-600">Edit captions and hashtags</p>
        </div>
        
        <div className="glass-card p-6 rounded-xl">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-rocket text-white"></i>
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Publish</h4>
          <p className="text-sm text-gray-600">Schedule and post to social media</p>
        </div>
      </div>
    </div>
  )
}

export default EmptyState
