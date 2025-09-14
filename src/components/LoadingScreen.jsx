import React from 'react'

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <i className="fas fa-rocket text-white text-2xl"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tribe SPA</h1>
        <p className="text-gray-600">Loading your dashboard...</p>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mt-4"></div>
      </div>
    </div>
  )
}

export default LoadingScreen
