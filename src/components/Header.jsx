import React from 'react'

function Header({ activeCount, postedCount, onUpload }) {
  return (
    <header className="glass-card border-b border-white/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center floating-animation pulse-glow">
              <i className="fas fa-rocket text-white text-xl"></i>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold gradient-text">Tribe SPA</h1>
              <p className="text-sm text-gray-600">Auto Post Dashboard</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="text-center glass-card px-6 py-3 rounded-xl">
              <div className="text-3xl font-bold gradient-text">{activeCount}</div>
              <div className="text-sm text-gray-600 font-medium">Active Posts</div>
            </div>
            <div className="text-center glass-card px-6 py-3 rounded-xl">
              <div className="text-3xl font-bold gradient-text">{postedCount}</div>
              <div className="text-sm text-gray-600 font-medium">Posted</div>
            </div>
          </div>
          
          {/* Upload Button */}
          <button 
            onClick={onUpload}
            className="btn-primary flex items-center group"
          >
            <i className="fas fa-plus mr-2 group-hover:rotate-90 transition-transform duration-300"></i>
            <span className="hidden sm:inline">Upload Post</span>
            <span className="sm:hidden">Upload</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
