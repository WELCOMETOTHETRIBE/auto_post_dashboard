import React from 'react'

function ToastContainer({ toasts, onRemove }) {
  const getToastColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      default: return 'bg-blue-500'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${getToastColor(toast.type)} text-white px-4 py-3 rounded-lg shadow-lg transform translate-x-0 transition-transform duration-300`}
        >
          <div className="flex items-center">
            <span className="flex-1">{toast.message}</span>
            <button 
              onClick={() => onRemove(toast.id)}
              className="ml-3 text-white hover:text-gray-200"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
