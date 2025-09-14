import React from 'react'

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center floating-animation pulse-glow">
          <i className="fas fa-rocket text-white text-3xl"></i>
        </div>
        <h1 className="text-4xl font-bold gradient-text mb-3">Tribe SPA</h1>
        <p className="text-gray-600 text-lg mb-6">Loading your dashboard...</p>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
