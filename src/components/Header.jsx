import React from 'react'

function Header({ activeCount, postedCount, onUpload }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-rocket text-white"></i>
            </div>
            <h1 className="ml-3 text-xl font-bold text-gray-900">Tribe SPA</h1>
          </div>
          
          {/* Stats */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{postedCount}</div>
              <div className="text-sm text-gray-500">Posted</div>
            </div>
          </div>
          
          {/* Upload Button */}
          <button 
            onClick={onUpload}
            className="btn-primary flex items-center"
          >
            <i className="fas fa-plus mr-2"></i>
            Upload
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
