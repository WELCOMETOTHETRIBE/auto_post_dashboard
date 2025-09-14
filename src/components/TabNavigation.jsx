import React from 'react'

function TabNavigation({ currentTab, onTabChange }) {
  return (
    <div className="mb-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button 
            onClick={() => onTabChange('active')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              currentTab === 'active' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i className="fas fa-clock mr-2"></i>
            Active Posts
          </button>
          <button 
            onClick={() => onTabChange('posted')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              currentTab === 'posted' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i className="fas fa-check-circle mr-2"></i>
            Posted
          </button>
        </nav>
      </div>
    </div>
  )
}

export default TabNavigation
