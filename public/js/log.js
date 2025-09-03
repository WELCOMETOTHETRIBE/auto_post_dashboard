// === Logging Module ===
// Handles error logging and user feedback

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
  }

  // Log error with code and details
  logError(code, details = {}) {
    const logEntry = {
      type: 'error',
      code,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    console.error(`❌ [${code}]`, details);
    
    // Show user-friendly error message
    this.showUserError(code, details);
  }

  // Log info messages
  logInfo(message, details = {}) {
    const logEntry = {
      type: 'info',
      message,
      details,
      timestamp: new Date().toISOString()
    };

    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    console.log(`ℹ️ ${message}`, details);
  }

  // Show user-friendly error messages
  showUserError(code, details) {
    const errorMessages = {
      'GIT_LOAD_ERROR': 'Failed to load posts from GitHub. Using local data instead.',
      'API_ERROR': 'Server connection failed. Please check your internet connection.',
      'MODAL_ERROR': 'Unable to open editor. Please try again.',
      'SAVE_ERROR': 'Failed to save changes. Please try again.',
      'NETWORK_ERROR': 'Network connection issue. Please check your connection.'
    };

    const message = errorMessages[code] || 'An unexpected error occurred. Please try again.';
    
    // Show toast notification
    this.showToast(message, 'error');
  }

  // Show toast notification
  showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  // Get logs for debugging
  getLogs() {
    return [...this.logs];
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Export logs (for debugging)
  exportLogs() {
    const logData = {
      timestamp: new Date().toISOString(),
      logs: this.logs,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `tribe-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
}

// Create global logger instance
const logger = new Logger();
window.logger = logger;

// Export functions for global use
window.logError = (code, details) => logger.logError(code, details);
window.logInfo = (message, details) => logger.logInfo(message, details);
window.showToast = (message, type) => logger.showToast(message, type); 