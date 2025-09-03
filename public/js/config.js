// === Configuration Module ===
// Handles app configuration and environment variables

export const CONFIG = {
  // Auth configuration
  requireAuth: false, // Default to false for mobile-first experience
  
  // API configuration
  apiBase: window.location.origin,
  
  // UI configuration
  mobileBreakpoint: 768,
  
  // Feature flags
  enableGitHubProxy: true,
  enableMockData: true,
  
  // Initialize configuration
  init() {
    // Override with window config if available
    if (window.CONFIG) {
      Object.assign(this, window.CONFIG);
    }
    
    // Detect mobile
    this.isMobile = window.innerWidth <= this.mobileBreakpoint;
    
    console.log('🔧 Config initialized:', {
      requireAuth: this.requireAuth,
      isMobile: this.isMobile,
      apiBase: this.apiBase
    });
  }
};

// Auto-initialize
CONFIG.init();

// Export for use in other modules
window.CONFIG = CONFIG; 