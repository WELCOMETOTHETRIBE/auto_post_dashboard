// === Modal Module ===
// Handles post editing and image upload modals with proper scroll management

class PostModal {
  constructor() {
    this.isOpen = false;
    this.currentPost = null;
    // Don't auto-initialize - wait for first use
    console.log('🎭 Post modal constructor called');
  }

  init() {
    // Only create modal HTML when actually needed
    if (!document.getElementById('post-modal')) {
      this.createModalHTML();
    }
    
    // Bind event listeners
    this.bindEvents();
    
    console.log('🎭 Post modal initialized');
  }

  createModalHTML() {
    // Check if modal already exists
    if (document.getElementById('post-modal')) {
      console.log('🎭 Modal HTML already exists');
      return;
    }

    console.log('🎭 Creating modal HTML...');
    const modalHTML = `
      <div id="post-modal" class="fixed inset-0 z-50 hidden">
        <!-- Premium Backdrop -->
        <div class="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-purple-900/40 to-pink-900/60 backdrop-blur-xl transition-all duration-500" onclick="window.postModal.close()"></div>
        
        <!-- Modal Container -->
        <div class="relative flex items-center justify-center min-h-screen p-4">
          <div class="relative w-full max-w-4xl bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-500 scale-95 opacity-0" id="modal-container" style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);">
            
            <!-- Premium Header -->
            <div class="relative p-8 border-b border-gradient-to-r from-transparent via-gray-200/50 to-transparent">
              <div class="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/50 rounded-t-3xl"></div>
              <div class="relative flex items-center justify-between">
                <div>
                  <h2 class="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent tracking-tight">Edit Post</h2>
                  <p class="text-gray-600 mt-2 font-medium">Craft the perfect social media content</p>
                </div>
                <button class="group w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 hover:from-red-100 hover:to-red-200 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105" onclick="window.postModal.close()">
                  <svg class="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Premium Image Preview -->
            <div class="p-8">
              <div class="relative group">
                <div class="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div class="relative">
                  <img id="modal-image" src="" alt="Post image" class="w-full h-64 object-cover rounded-2xl shadow-2xl border-4 border-white/50" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl"></div>
                  <div class="absolute bottom-4 left-4 right-4">
                    <div class="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                      <p class="text-sm font-medium text-gray-800">Preview your content</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Premium Tab Navigation -->
            <div class="px-8 pb-6">
              <div class="relative">
                <div class="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/50 rounded-2xl"></div>
                <div class="relative flex space-x-2 bg-white/60 backdrop-blur-sm p-2 rounded-2xl border border-white/40 shadow-lg">
                  <button class="tab-btn flex-1 px-6 py-4 text-sm font-semibold rounded-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform hover:scale-105" data-tab="content">
                    <div class="flex items-center justify-center space-x-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                      <span>Content</span>
                    </div>
                  </button>
                  <button class="tab-btn flex-1 px-6 py-4 text-sm font-semibold rounded-xl transition-all duration-300 text-gray-600 hover:text-gray-900 hover:bg-white/80" data-tab="settings">
                    <div class="flex items-center justify-center space-x-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span>Settings</span>
                    </div>
                  </button>
                  <button class="tab-btn flex-1 px-6 py-4 text-sm font-semibold rounded-xl transition-all duration-300 text-gray-600 hover:text-gray-900 hover:bg-white/80" data-tab="publish">
                    <div class="flex items-center justify-center space-x-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                      <span>Publish</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Premium Content -->
            <div class="px-8 pb-8 max-h-96 overflow-y-auto">
              <!-- Content Tab -->
              <div id="tab-content" class="tab-content space-y-8">
                <div class="group">
                  <label for="modal-description" class="block text-sm font-bold text-gray-800 mb-4 flex items-center">
                    <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
                    Image Description
                  </label>
                  <div class="relative">
                    <textarea id="modal-description" class="w-full px-6 py-4 bg-gradient-to-br from-gray-50 to-gray-100/50 border-0 rounded-2xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 resize-none shadow-inner" placeholder="Describe what you see in the image..." rows="3"></textarea>
                    <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  <p class="text-xs text-gray-500 mt-3 flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Help AI generate better captions by describing the image
                  </p>
                </div>
                
                <div class="group">
                  <label for="modal-caption" class="block text-sm font-bold text-gray-800 mb-4 flex items-center">
                    <div class="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
                    Caption
                  </label>
                  <div class="space-y-4">
                    <div class="relative">
                      <textarea id="modal-caption" class="w-full px-6 py-4 bg-gradient-to-br from-gray-50 to-gray-100/50 border-0 rounded-2xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 resize-none shadow-inner" placeholder="Write an engaging caption..." rows="4"></textarea>
                      <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    <button type="button" class="group relative w-full px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white rounded-2xl font-bold hover:from-purple-700 hover:via-pink-700 hover:to-red-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105" onclick="window.postModal.generateCaption()">
                      <div class="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                      <div class="relative flex items-center justify-center space-x-3">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        <span>Generate with AI</span>
                        <div class="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                      </div>
                    </button>
                  </div>
                </div>
                
                <div class="group">
                  <label for="modal-hashtags" class="block text-sm font-bold text-gray-800 mb-4 flex items-center">
                    <div class="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mr-3"></div>
                    Hashtags
                  </label>
                  <div class="space-y-4">
                    <div class="relative">
                      <input type="text" id="modal-hashtags" class="w-full px-6 py-4 bg-gradient-to-br from-gray-50 to-gray-100/50 border-0 rounded-2xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/20 focus:outline-none transition-all duration-300 shadow-inner" placeholder="#hashtag1 #hashtag2" />
                      <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    <button type="button" class="group relative w-full px-6 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white rounded-2xl font-bold hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105" onclick="window.postModal.generateHashtags()">
                      <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                      <div class="relative flex items-center justify-center space-x-3">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                        </svg>
                        <span>Generate Hashtags</span>
                        <div class="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Settings Tab -->
              <div id="tab-settings" class="tab-content hidden space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="modal-brand" class="block text-sm font-semibold text-gray-900 mb-3">Brand</label>
                    <select id="modal-brand" class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200">
                      <option value="wttt">WTTT</option>
                      <option value="denlys">Denly</option>
                      <option value="jabronis">Jabroni</option>
                    </select>
                  </div>
                  
                  <div>
                    <label for="modal-product-type" class="block text-sm font-semibold text-gray-900 mb-3">Product Type</label>
                    <select id="modal-product-type" class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200">
                      <option value="">Select product type</option>
                      <option value="supplement">Supplement</option>
                      <option value="apparel">Apparel</option>
                      <option value="accessory">Accessory</option>
                      <option value="digital">Digital</option>
                      <option value="service">Service</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label for="modal-product" class="block text-sm font-semibold text-gray-900 mb-3">Product Name</label>
                  <input type="text" id="modal-product" class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200" placeholder="Specific product name or category" />
                </div>
                
                <div>
                  <label for="modal-website" class="block text-sm font-semibold text-gray-900 mb-3">Website URL</label>
                  <input type="url" id="modal-website" class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200" placeholder="https://example.com/product" />
                </div>
              </div>
              
              <!-- Publish Tab -->
              <div id="tab-publish" class="tab-content hidden space-y-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-4">Posting Platforms</label>
                  <div class="grid grid-cols-2 gap-3">
                    <label class="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors duration-200">
                      <input type="checkbox" id="platform-instagram" class="w-4 h-4 text-pink-500 rounded focus:ring-pink-500 mr-3" />
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-900">Instagram</span>
                      </div>
                    </label>
                    
                    <label class="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors duration-200">
                      <input type="checkbox" id="platform-facebook" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-3" />
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-900">Facebook</span>
                      </div>
                    </label>
                    
                    <label class="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors duration-200">
                      <input type="checkbox" id="platform-twitter" class="w-4 h-4 text-blue-400 rounded focus:ring-blue-400 mr-3" />
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center mr-3">
                          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-900">Twitter</span>
                      </div>
                    </label>
                    
                    <label class="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors duration-200">
                      <input type="checkbox" id="platform-linkedin" class="w-4 h-4 text-blue-700 rounded focus:ring-blue-700 mr-3" />
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center mr-3">
                          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-900">LinkedIn</span>
                      </div>
                    </label>
                    
                    <label class="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors duration-200 col-span-2">
                      <input type="checkbox" id="platform-tiktok" class="w-4 h-4 text-black rounded focus:ring-gray-500 mr-3" />
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
                          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                          </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-900">TikTok</span>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label for="modal-delay" class="block text-sm font-semibold text-gray-900 mb-3">Posting Delay</label>
                  <div class="flex items-center space-x-4">
                    <input type="number" id="modal-delay" class="w-20 px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 text-center" min="0" max="168" value="0" />
                    <span class="text-sm text-gray-600">hours (0 = post immediately)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Premium Footer -->
            <div class="relative p-8 border-t border-gradient-to-r from-transparent via-gray-200/50 to-transparent">
              <div class="absolute inset-0 bg-gradient-to-r from-gray-50/50 via-white/30 to-gray-50/50 rounded-b-3xl"></div>
              <div class="relative flex items-center justify-end space-x-4">
                <button class="px-8 py-3 text-gray-600 hover:text-gray-900 font-semibold transition-all duration-300 hover:bg-gray-100 rounded-xl" onclick="window.postModal.close()">
                  Cancel
                </button>
                <button class="group relative px-8 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-bold hover:from-gray-900 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105" onclick="window.postModal.save()">
                  <div class="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                  <span class="relative">Save Changes</span>
                </button>
                <button class="group relative px-8 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105" onclick="window.postModal.submitToZapier()">
                  <div class="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                  <div class="relative flex items-center space-x-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    <span>Submit to Zapier</span>
                    <div class="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('✅ Modal HTML created and inserted');
    
    // Debug: Check if modal is visible
    const createdModal = document.getElementById('post-modal');
    if (createdModal) {
      console.log('🎭 Modal element details:', {
        display: window.getComputedStyle(createdModal).display,
        visibility: window.getComputedStyle(createdModal).visibility,
        opacity: window.getComputedStyle(createdModal).opacity,
        zIndex: window.getComputedStyle(createdModal).zIndex,
        position: window.getComputedStyle(createdModal).position,
        top: window.getComputedStyle(createdModal).top,
        left: window.getComputedStyle(createdModal).left
      });
      
      // Check parent elements
      let parent = createdModal.parentElement;
      let depth = 0;
      while (parent && depth < 5) {
        console.log(`🎭 Parent ${depth}:`, {
          tagName: parent.tagName,
          id: parent.id,
          className: parent.className,
          display: window.getComputedStyle(parent).display
        });
        parent = parent.parentElement;
        depth++;
      }
    }
  }

  bindEvents() {
    // Close modal on overlay click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.close();
      }
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Handle edit button clicks
    document.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.edit-btn');
      if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        
        const postId = editBtn.dataset.postId;
        const post = this.findPostById(postId);
        
        if (post) {
          this.open(post);
        }
      }
    });

    // Handle tab switching
    document.addEventListener('click', (e) => {
      if (e.target.closest('.tab-btn')) {
        e.preventDefault();
        const tabBtn = e.target.closest('.tab-btn');
        const tabName = tabBtn.dataset.tab;
        this.switchTab(tabName);
      }
    });
  }

  findPostById(postId) {
    // This should be implemented based on how posts are stored
    // For now, we'll use a global posts array
    if (window.allPosts) {
      return window.allPosts.find(post => post.token_id === postId);
    }
    return null;
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('bg-gradient-to-r', 'from-blue-500', 'to-purple-600', 'text-white', 'shadow-lg', 'transform', 'hover:scale-105');
      btn.classList.add('text-gray-600', 'hover:text-gray-900', 'hover:bg-white/80');
    });
    
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
      activeBtn.classList.add('bg-gradient-to-r', 'from-blue-500', 'to-purple-600', 'text-white', 'shadow-lg', 'transform', 'hover:scale-105');
      activeBtn.classList.remove('text-gray-600', 'hover:text-gray-900', 'hover:bg-white/80');
    }
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.add('hidden');
    });
    
    const activeContent = document.getElementById(`tab-${tabName}`);
    if (activeContent) {
      activeContent.classList.remove('hidden');
    }
  }

  open(post) {
    console.log('🎭 Modal.open() called with post:', post);
    
    if (!post) {
      console.error('❌ No post provided to modal');
      return;
    }

    // Initialize modal if this is the first time
    if (!document.getElementById('post-modal')) {
      this.init();
    }

    // Ensure modal HTML exists
    if (!document.getElementById('post-modal')) {
      console.log('🎭 Modal HTML not found, creating it...');
      this.createModalHTML();
    }

    this.currentPost = post;
    this.isOpen = true;

    // Populate modal with post data
    this.populateModal(post);

    // Switch to Content tab by default
    this.switchTab('content');

    // Show modal with animation
    const modal = document.getElementById('post-modal');
    const modalContainer = document.getElementById('modal-container');
    console.log('🎭 Found modal element:', !!modal);
    
    if (modal && modalContainer) {
      modal.classList.remove('hidden');
      
      // Trigger animation
      setTimeout(() => {
        modalContainer.classList.remove('scale-95', 'opacity-0');
        modalContainer.classList.add('scale-100', 'opacity-100');
      }, 10);
      
      console.log('✅ Modal shown with animation');
    } else {
      console.error('❌ Modal element not found!');
    }

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    console.log('🎭 Modal opened for post:', post.token_id);
  }

  close() {
    this.isOpen = false;
    this.currentPost = null;

    // Hide modal with animation
    const modal = document.getElementById('post-modal');
    const modalContainer = document.getElementById('modal-container');
    
    if (modal && modalContainer) {
      // Start close animation
      modalContainer.classList.remove('scale-100', 'opacity-100');
      modalContainer.classList.add('scale-95', 'opacity-0');
      
      // Hide modal after animation
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    // Restore body scroll
    document.body.style.overflow = '';

    console.log('🎭 Modal closed');
  }

  populateModal(post) {
    // Set image
    const imageEl = document.getElementById('modal-image');
    if (imageEl) {
      imageEl.src = post.image_url;
      imageEl.alt = `Post ${post.token_id}`;
    }

    // Set description
    const descriptionEl = document.getElementById('modal-description');
    if (descriptionEl) {
      descriptionEl.value = post.description || '';
    }

    // Set caption
    const captionEl = document.getElementById('modal-caption');
    if (captionEl) {
      captionEl.value = post.caption || '';
    }

    // Set hashtags
    const hashtagsEl = document.getElementById('modal-hashtags');
    if (hashtagsEl) {
      hashtagsEl.value = post.hashtags || '';
    }

    // Set platforms
    const platforms = (post.platform || '').split(',').map(p => p.trim());
    document.getElementById('platform-instagram').checked = platforms.includes('instagram');
    document.getElementById('platform-facebook').checked = platforms.includes('facebook');
    document.getElementById('platform-twitter').checked = platforms.includes('twitter');
    document.getElementById('platform-linkedin').checked = platforms.includes('linkedin');
    document.getElementById('platform-tiktok').checked = platforms.includes('tiktok');

    // Set brand
    const brandEl = document.getElementById('modal-brand');
    if (brandEl) {
      brandEl.value = post.brand || 'wttt'; // Default to WTTT if not set
    }

    // Set product type (new field)
    const productTypeEl = document.getElementById('modal-product-type');
    if (productTypeEl) {
      productTypeEl.value = post.productType || '';
    }

    // Set product name (maintains backward compatibility with old 'product' field)
    const productNameEl = document.getElementById('modal-product');
    if (productNameEl) {
      productNameEl.value = post.productName || post.product || '';
    }

    // Set website URL (new field)
    const websiteEl = document.getElementById('modal-website');
    if (websiteEl) {
      websiteEl.value = post.websiteUrl || '';
    }

    // Set delay
    const delayEl = document.getElementById('modal-delay');
    if (delayEl) {
      delayEl.value = post.hourDelay || '0';
    }
  }

  async generateCaption() {
    const description = document.getElementById('modal-description').value;
    if (!description) {
      this.showToast('Please describe the image first', 'warning');
      return;
    }

    try {
      this.showToast('🤖 Generating caption...', 'info');
      
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Generate an engaging, viral caption for this image: ${description}. Make it authentic, relatable, and optimized for social media engagement.` 
        })
      });

      if (!response.ok) {
        throw new Error(`Caption generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      document.getElementById('modal-caption').value = result.caption;
      this.showToast('✅ Caption generated!', 'success');
      
    } catch (error) {
      console.error('Caption generation error:', error);
      this.showToast('❌ Failed to generate caption: ' + error.message, 'error');
    }
  }

  async generateHashtags() {
    try {
      const caption = document.getElementById('modal-caption').value;
      if (!caption.trim()) {
        window.showToast('⚠️ Please write a caption first', 'warning');
        return;
      }
      
      const response = await fetch('/api/generate-hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption })
      });
      
      if (!response.ok) {
        throw new Error(`AI generation failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      document.getElementById('modal-hashtags').value = data.hashtags;
      
      window.showToast('✨ AI hashtags generated successfully!', 'success');
    } catch (error) {
      console.error('Hashtag generation error:', error);
      window.showToast('❌ Failed to generate hashtags: ' + error.message, 'error');
    }
  }

  async submitToZapier() {
    if (!this.currentPost) {
      this.showToast('No post to submit', 'error');
      return;
    }

    // Collect current form data
    const description = document.getElementById('modal-description').value;
    const caption = document.getElementById('modal-caption').value;
    const hashtags = document.getElementById('modal-hashtags').value;
    const brand = document.getElementById('modal-brand').value;
    const productType = document.getElementById('modal-product-type').value;
    const productName = document.getElementById('modal-product').value;
    const websiteUrl = document.getElementById('modal-website').value;
    const hourDelay = document.getElementById('modal-delay').value;
    const platforms = [];
    
    if (document.getElementById('platform-instagram').checked) platforms.push('instagram');
    if (document.getElementById('platform-facebook').checked) platforms.push('facebook');
    if (document.getElementById('platform-twitter').checked) platforms.push('twitter');
    if (document.getElementById('platform-linkedin').checked) platforms.push('linkedin');
    if (document.getElementById('platform-tiktok').checked) platforms.push('tiktok');

    // Validate required fields
    if (!caption.trim()) {
      this.showToast('Please add a caption before submitting', 'warning');
      return;
    }

    if (platforms.length === 0) {
      this.showToast('Please select at least one platform', 'warning');
      return;
    }

    // Prepare submission data
    const submitData = {
      image_url: this.currentPost.image_url,
      description: description,
      caption: caption,
      hashtags: hashtags,
      brand: brand,
      product_type: productType,
      product_name: productName,
      website_url: websiteUrl,
      hour_delay: parseInt(hourDelay) || 0,
      platforms: platforms.join(', '),
      token_id: this.currentPost.token_id,
      submitted_at: new Date().toISOString()
    };

    try {
      this.showToast('📤 Submitting to Zapier...', 'info');

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        throw new Error(`Submission failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'ok') {
        this.showToast('✅ Successfully submitted to Zapier!', 'success');
        this.close();
      } else {
        throw new Error(result.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Zapier submission error:', error);
      this.showToast('❌ Failed to submit: ' + error.message, 'error');
    }
  }

  save() {
    if (!this.currentPost) {
      console.error('No post to save');
      return;
    }

    // Collect form data
    const description = document.getElementById('modal-description').value;
    const caption = document.getElementById('modal-caption').value;
    const hashtags = document.getElementById('modal-hashtags').value;
    const brand = document.getElementById('modal-brand').value;
    const productType = document.getElementById('modal-product-type').value;
    const productName = document.getElementById('modal-product').value;
    const websiteUrl = document.getElementById('modal-website').value;
    const hourDelay = document.getElementById('modal-delay').value;
    const platforms = [];
    
    if (document.getElementById('platform-instagram').checked) platforms.push('instagram');
    if (document.getElementById('platform-facebook').checked) platforms.push('facebook');
    if (document.getElementById('platform-twitter').checked) platforms.push('twitter');
    if (document.getElementById('platform-linkedin').checked) platforms.push('linkedin');
    if (document.getElementById('platform-tiktok').checked) platforms.push('tiktok');

    // Update post data
    this.currentPost.description = description;
    this.currentPost.caption = caption;
    this.currentPost.hashtags = hashtags;
    this.currentPost.brand = brand;
    this.currentPost.productType = productType;
    this.currentPost.productName = productName;
    this.currentPost.websiteUrl = websiteUrl;
    this.currentPost.hourDelay = parseInt(hourDelay) || 0;
    this.currentPost.platform = platforms.join(', ');
    this.currentPost.scheduled_for = hourDelay > 0 ? new Date(Date.now() + (parseInt(hourDelay) * 60 * 60 * 1000)).toISOString() : null;

    // Save to localStorage for persistence
    this.saveToLocalStorage();

    // Close modal
    this.close();

    // Show success message
    this.showToast('Post updated successfully!', 'success');

    console.log('💾 Post saved:', this.currentPost);
  }

  saveToLocalStorage() {
    try {
      if (window.allPosts) {
        localStorage.setItem('tribe_posts', JSON.stringify(window.allPosts));
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  showToast(message, type = 'info') {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide and remove toast
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Global toast function for compatibility
  static showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide and remove toast
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

class UploadModal {
  constructor() {
    this.isOpen = false;
    // Don't auto-initialize - wait for first use
    console.log('📤 Upload modal constructor called');
  }

  init() {
    // Only create modal HTML when actually needed
    if (!document.getElementById('upload-modal')) {
      this.createModalHTML();
    }
    this.bindEvents();
    console.log('📤 Upload modal initialized');
  }

  createModalHTML() {
    if (document.getElementById('upload-modal')) {
      return;
    }

    const modalHTML = `
      <div id="upload-modal" class="modal-overlay hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="text-xl font-semibold text-secondary-900">Upload New Image</h3>
            <button class="modal-close text-secondary-400 hover:text-secondary-600 transition-colors duration-200" onclick="window.uploadModal.close()">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          <div class="modal-body">
            <form id="upload-form" enctype="multipart/form-data" class="space-y-6">
              <div>
                <label for="upload-image" class="form-label">Select Image</label>
                <input type="file" id="upload-image" name="image" accept="image/*" required class="form-input" />
                <div class="image-preview mt-3" id="image-preview" style="display: none;">
                  <img id="preview-img" src="" alt="Preview" class="max-w-full max-h-48 rounded-lg shadow-md mx-auto" />
                </div>
              </div>
              
              <div>
                <label for="upload-description" class="form-label">Image Description</label>
                <textarea id="upload-description" name="description" placeholder="Describe what you see in the image..." rows="3" class="form-textarea"></textarea>
                <p class="form-help">This description will be used by AI to generate better captions</p>
              </div>
              
              <div>
                <label for="upload-caption" class="form-label">Caption (Optional)</label>
                <div class="flex gap-3">
                  <textarea id="upload-caption" name="caption" placeholder="Write a caption or let AI generate one..." class="form-textarea flex-1"></textarea>
                  <button type="button" class="btn btn-secondary btn-sm whitespace-nowrap flex-shrink-0" onclick="window.uploadModal.generateCaption()">
                    <i class="fas fa-magic mr-2"></i>
                    <span>AI Generate</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label for="upload-hashtags" class="form-label">Hashtags (Optional)</label>
                <div class="flex gap-3">
                  <input type="text" id="upload-hashtags" name="hashtags" placeholder="#hashtag1 #hashtag2" class="form-input" />
                  <button type="button" class="btn btn-secondary btn-sm whitespace-nowrap flex-shrink-0" onclick="window.uploadModal.generateHashtags()">
                    <i class="fas fa-hashtag mr-2"></i>
                    <span>AI Generate</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label class="form-label">Posting Platforms</label>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <label class="platform-toggle">
                    <input type="checkbox" name="platforms" value="instagram" />
                    <span class="text-sm font-medium">Instagram</span>
                  </label>
                  <label class="platform-toggle">
                    <input type="checkbox" name="platforms" value="facebook" />
                    <span class="text-sm font-medium">Facebook</span>
                  </label>
                  <label class="platform-toggle">
                    <input type="checkbox" name="platforms" value="twitter" />
                    <span class="text-sm font-medium">Twitter</span>
                  </label>
                  <label class="platform-toggle">
                    <input type="checkbox" name="platforms" value="linkedin" />
                    <span class="text-sm font-medium">LinkedIn</span>
                  </label>
                  <label class="platform-toggle">
                    <input type="checkbox" name="platforms" value="tiktok" />
                    <span class="text-sm font-medium">TikTok</span>
                  </label>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="upload-delay" class="form-label">Posting Delay (Hours)</label>
                  <input type="number" id="upload-delay" name="hourDelay" min="0" max="168" value="0" class="form-input" />
                  <p class="form-help">0 = post immediately, 24 = post in 24 hours</p>
                </div>
                
                <div>
                  <label for="upload-brand" class="form-label">Brand</label>
                  <select id="upload-brand" name="brand" class="form-select">
                    <option value="wttt">WTTT</option>
                    <option value="denlys">Denly</option>
                    <option value="jabronis">Jabroni</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label for="upload-product" class="form-label">Product (Optional)</label>
                <input type="text" id="upload-product" name="product" placeholder="Product name or category" class="form-input" />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="window.uploadModal.close()">Cancel</button>
            <button class="btn btn-primary" onclick="window.uploadModal.upload()">
              <i class="fas fa-upload mr-2"></i>
              <span>Upload & Create Post</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  bindEvents() {
    // Image preview
    const imageInput = document.getElementById('upload-image');
    if (imageInput) {
      imageInput.addEventListener('change', (e) => this.handleImagePreview(e));
    }

    // Close modal on overlay click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.close();
      }
    });
  }

  handleImagePreview(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  }

  async generateCaption() {
    const description = document.getElementById('upload-description').value;
    if (!description) {
      window.showToast('Please describe the image first', 'warning');
      return;
    }

    try {
      window.showToast('🤖 Generating caption...', 'info');
      
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Generate an engaging, viral caption for this image: ${description}. Make it authentic, relatable, and optimized for social media engagement.` 
        })
      });

      if (!response.ok) {
        throw new Error(`Caption generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      document.getElementById('upload-caption').value = result.caption;
      window.showToast('✅ Caption generated!', 'success');
      
    } catch (error) {
      console.error('Caption generation error:', error);
      window.showToast('❌ Failed to generate caption: ' + error.message, 'error');
    }
  }

  async generateHashtags() {
    const caption = document.getElementById('upload-caption').value;
    if (!caption) {
      window.showToast('Please write a caption first', 'warning');
      return;
    }

    try {
      window.showToast('🤖 Generating hashtags...', 'info');
      
      const response = await fetch('/api/generate-hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption })
      });

      if (!response.ok) {
        throw new Error(`Hashtag generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      document.getElementById('upload-hashtags').value = result.hashtags;
      window.showToast('✅ Hashtags generated!', 'success');
      
    } catch (error) {
      console.error('Hashtag generation error:', error);
      window.showToast('❌ Failed to generate hashtags: ' + error.message, 'error');
    }
  }

  async upload() {
    const form = document.getElementById('upload-form');
    const formData = new FormData(form);
    
    // Get selected platforms
    const selectedPlatforms = Array.from(form.querySelectorAll('input[name="platforms"]:checked'))
      .map(cb => cb.value);
    formData.set('platforms', selectedPlatforms.join(','));
    
    // Get additional fields
    const product = document.getElementById('upload-product').value;
    const brand = document.getElementById('upload-brand').value;
    formData.set('product', product);
    formData.set('brand', brand);
    
    // Validate required fields
    if (!formData.get('image').size) {
      window.showToast('Please select an image', 'warning');
      return;
    }

    try {
      window.showToast('📤 Uploading image...', 'info');
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        window.showToast('✅ Image uploaded successfully!', 'success');
        this.close();
        
        // Refresh posts if available
        if (window.loadPosts) {
          window.loadPosts();
        }
      } else {
        throw new Error(result.message || 'Upload failed');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      window.showToast('❌ Upload failed: ' + error.message, 'error');
    }
  }

  open() {
    // Initialize modal if this is the first time
    if (!document.getElementById('upload-modal')) {
      this.init();
    }
    
    this.isOpen = true;
    const modal = document.getElementById('upload-modal');
    if (modal) {
      modal.classList.remove('hidden');
    }
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    const modal = document.getElementById('upload-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
    document.body.style.overflow = '';
    
    // Reset form
    const form = document.getElementById('upload-form');
    if (form) form.reset();
    
    // Hide preview
    const preview = document.getElementById('image-preview');
    if (preview) preview.style.display = 'none';
  }
}

// Create global instances
const postModal = new PostModal();
window.postModal = postModal;

const uploadModal = new UploadModal();
window.uploadModal = uploadModal;

// Export functions for global use
window.openPostModal = (postId) => {
  const post = postModal.findPostById(postId);
  if (post) {
    postModal.open(post);
  }
};

window.closePostModal = () => postModal.close();

// Global toast function
window.showToast = (message, type = 'info') => {
  PostModal.showToast(message, type);
};

// Debug logging
console.log('🎭 Modal system initialized:', {
  postModal: !!window.postModal,
  uploadModal: !!window.uploadModal,
  postModalOpen: !!window.postModal?.open,
  postModalClose: !!window.postModal?.close
});

// Test function for debugging
window.testModal = () => {
  console.log('🧪 Testing modal...');
  if (window.postModal) {
    const testPost = {
      token_id: 'test',
      image_url: 'https://via.placeholder.com/300x200',
      description: 'Test description',
      caption: 'Test caption',
      hashtags: '#test #debug',
      platform: 'instagram',
      product: 'Test product',
      brand: 'wttt',
      hourDelay: 0
    };
    window.postModal.open(testPost);
  } else {
    console.error('❌ Modal not available');
  }
};

// Check modal status
window.checkModalStatus = () => {
  const modal = document.getElementById('post-modal');
  console.log('🔍 Modal status check:', {
    exists: !!modal,
    display: modal ? window.getComputedStyle(modal).display : 'N/A',
    visibility: modal ? window.getComputedStyle(modal).visibility : 'N/A',
    opacity: modal ? window.getComputedStyle(modal).opacity : 'N/A',
    zIndex: modal ? window.getComputedStyle(modal).zIndex : 'N/A',
    position: modal ? window.getComputedStyle(modal).position : 'N/A',
    top: modal ? window.getComputedStyle(modal).top : 'N/A',
    left: modal ? window.getComputedStyle(modal).left : 'N/A'
  });
  
  if (modal) {
    console.log('🎭 Modal HTML:', modal.outerHTML.substring(0, 200) + '...');
  }
  
  return !!modal;
};

// Ensure modal is ready after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎭 DOM loaded, ensuring modal is ready...');
  // Don't auto-initialize modals - they will be created when needed
  console.log('✅ Modal system ready - modals will be created on demand');
}); 