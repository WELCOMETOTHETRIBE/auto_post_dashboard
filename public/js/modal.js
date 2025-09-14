// === Premium Post Modal Class ===
class PostModal {
  constructor() {
    this.isOpen = false;
    this.currentPost = null;
    this.createModalHTML();
    this.bindEvents();
    console.log('🎭 PostModal initialized');
  }

  createModalHTML() {
    // Check if modal already exists
    if (document.getElementById('post-modal')) {
      console.log('🎭 Modal HTML already exists');
      return;
    }

    console.log('🎭 Creating premium modal HTML...');
    const modalHTML = `
      <div id="post-modal" class="fixed inset-0 z-50 hidden">
        <!-- Premium Backdrop -->
        <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-md" onclick="window.postModal.close()"></div>
        
        <!-- Modal Container -->
        <div class="relative flex items-center justify-center min-h-screen p-4">
          <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-95 opacity-0" id="modal-container">
            
            <!-- Premium Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Edit Post</h2>
                <p class="text-sm text-gray-600 mt-1">Craft the perfect social media content</p>
              </div>
              <button class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200" onclick="window.postModal.close()">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <!-- Image Preview -->
            <div class="p-6">
              <div class="relative">
                <img id="modal-image" src="" alt="Post image" class="w-full h-48 object-cover rounded-xl shadow-lg" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
              </div>
            </div>
            
            <!-- Tab Navigation -->
            <div class="px-6 pb-4">
              <div class="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button class="tab-btn flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 bg-white text-gray-900 shadow-sm" data-tab="content">
                  Content
                </button>
                <button class="tab-btn flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 text-gray-600 hover:text-gray-900" data-tab="settings">
                  Settings
                </button>
                <button class="tab-btn flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 text-gray-600 hover:text-gray-900" data-tab="publish">
                  Publish
                </button>
              </div>
            </div>
            
            <!-- Content -->
            <div class="px-6 pb-6 max-h-80 overflow-y-auto">
              <!-- Content Tab -->
              <div id="tab-content" class="tab-content space-y-6">
                <div>
                  <label for="modal-description" class="block text-sm font-semibold text-gray-900 mb-2">Image Description</label>
                  <textarea id="modal-description" class="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 resize-none" placeholder="Describe what you see in the image..." rows="3"></textarea>
                  <p class="text-xs text-gray-500 mt-2">Help AI generate better captions by describing the image</p>
                </div>
                
                <div>
                  <label for="modal-caption" class="block text-sm font-semibold text-gray-900 mb-2">Caption</label>
                  <div class="space-y-3">
                    <textarea id="modal-caption" class="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 resize-none" placeholder="Write an engaging caption..." rows="4"></textarea>
                    <button type="button" class="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg" onclick="window.postModal.generateCaption()">
                      <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                      Generate with AI
                    </button>
                  </div>
                </div>
                
                <div>
                  <label for="modal-hashtags" class="block text-sm font-semibold text-gray-900 mb-2">Hashtags</label>
                  <div class="space-y-3">
                    <input type="text" id="modal-hashtags" class="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200" placeholder="#hashtag1 #hashtag2" />
                    <button type="button" class="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg" onclick="window.postModal.generateHashtags()">
                      <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                      </svg>
                      Generate Hashtags
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Settings Tab -->
              <div id="tab-settings" class="tab-content hidden space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="modal-brand" class="block text-sm font-semibold text-gray-900 mb-2">Brand</label>
                    <select id="modal-brand" class="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200">
                      <option value="wttt">WTTT</option>
                      <option value="denlys">Denly</option>
                      <option value="jabronis">Jabroni</option>
                    </select>
                  </div>
                  
                  <div>
                    <label for="modal-product-type" class="block text-sm font-semibold text-gray-900 mb-2">Product Type</label>
                    <select id="modal-product-type" class="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200">
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
                  <label for="modal-product" class="block text-sm font-semibold text-gray-900 mb-2">Product Name</label>
                  <input type="text" id="modal-product" class="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200" placeholder="Specific product name or category" />
                </div>
                
                <div>
                  <label for="modal-website" class="block text-sm font-semibold text-gray-900 mb-2">Website URL</label>
                  <input type="url" id="modal-website" class="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200" placeholder="https://example.com/product" />
                </div>
              </div>
              
              <!-- Publish Tab -->
              <div id="tab-publish" class="tab-content hidden space-y-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-3">Posting Platforms</label>
                  <div class="grid grid-cols-2 gap-3">
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200">
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
                    
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200">
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
                    
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200">
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
                    
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200">
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
                    
                    <label class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200 col-span-2">
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
                  <label for="modal-delay" class="block text-sm font-semibold text-gray-900 mb-2">Posting Delay</label>
                  <div class="flex items-center space-x-4">
                    <input type="number" id="modal-delay" class="w-20 px-4 py-3 bg-gray-50 border-0 rounded-lg text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 text-center" min="0" max="168" value="0" />
                    <span class="text-sm text-gray-600">hours (0 = post immediately)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button class="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200" onclick="window.postModal.close()">
                Cancel
              </button>
              <button class="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200" onclick="window.postModal.save()">
                Save Changes
              </button>
              <button class="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg" onclick="window.postModal.submitToZapier()">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Submit to Zapier
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('✅ Premium modal HTML created and inserted');
  }

  bindEvents() {
    // Tab switching
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-btn')) {
        const tabName = e.target.getAttribute('data-tab');
        this.switchTab(tabName);
      }
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('bg-white', 'text-gray-900', 'shadow-sm');
      btn.classList.add('text-gray-600', 'hover:text-gray-900');
    });
    
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
      activeBtn.classList.add('bg-white', 'text-gray-900', 'shadow-sm');
      activeBtn.classList.remove('text-gray-600', 'hover:text-gray-900');
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

    this.isOpen = true;
    this.currentPost = post;

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
      imageEl.src = post.image_url || post.imageUrl || '';
    }

    // Set form fields
    const fields = {
      'modal-description': post.description || '',
      'modal-caption': post.caption || '',
      'modal-hashtags': post.hashtags || '',
      'modal-brand': post.brand || 'wttt',
      'modal-product-type': post.product_type || '',
      'modal-product': post.product || '',
      'modal-website': post.website || '',
      'modal-delay': post.delay || 0
    };

    Object.entries(fields).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value;
      }
    });

    // Set platform checkboxes
    const platforms = post.platforms || [];
    ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'].forEach(platform => {
      const checkbox = document.getElementById(`platform-${platform}`);
      if (checkbox) {
        checkbox.checked = platforms.includes(platform);
      }
    });
  }

  save() {
    if (!this.currentPost) {
      console.error('❌ No current post to save');
      return;
    }

    // Collect form data
    const formData = {
      description: document.getElementById('modal-description')?.value || '',
      caption: document.getElementById('modal-caption')?.value || '',
      hashtags: document.getElementById('modal-hashtags')?.value || '',
      brand: document.getElementById('modal-brand')?.value || 'wttt',
      product_type: document.getElementById('modal-product-type')?.value || '',
      product: document.getElementById('modal-product')?.value || '',
      website: document.getElementById('modal-website')?.value || '',
      delay: parseInt(document.getElementById('modal-delay')?.value || '0'),
      platforms: []
    };

    // Collect selected platforms
    ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'].forEach(platform => {
      const checkbox = document.getElementById(`platform-${platform}`);
      if (checkbox && checkbox.checked) {
        formData.platforms.push(platform);
      }
    });

    // Update the post object
    Object.assign(this.currentPost, formData);

    // Update the posts array
    if (window.allPosts) {
      const postIndex = window.allPosts.findIndex(p => p.token_id === this.currentPost.token_id);
      if (postIndex !== -1) {
        window.allPosts[postIndex] = this.currentPost;
      }
    }

    // Show success message
    if (window.showToast) {
      window.showToast('✅ Post updated successfully!', 'success');
    } else {
      alert('Post updated successfully!');
    }

    this.close();
    console.log('✅ Post saved:', this.currentPost);
  }

  generateCaption() {
    const description = document.getElementById('modal-description')?.value || '';
    const captionField = document.getElementById('modal-caption');
    
    if (!captionField) return;

    // Show loading state
    const originalText = captionField.placeholder;
    captionField.placeholder = 'Generating caption with AI...';
    captionField.disabled = true;

    // Simulate AI generation
    setTimeout(() => {
      const aiCaption = `Check out this amazing ${description || 'content'}! 🚀 #amazing #content #viral`;
      captionField.value = aiCaption;
      captionField.placeholder = originalText;
      captionField.disabled = false;
      
      if (window.showToast) {
        window.showToast('✅ Caption generated!', 'success');
      }
    }, 2000);
  }

  generateHashtags() {
    const description = document.getElementById('modal-description')?.value || '';
    const hashtagsField = document.getElementById('modal-hashtags');
    
    if (!hashtagsField) return;

    // Show loading state
    const originalText = hashtagsField.placeholder;
    hashtagsField.placeholder = 'Generating hashtags with AI...';
    hashtagsField.disabled = true;

    // Simulate AI generation
    setTimeout(() => {
      const aiHashtags = `#viral #trending #amazing #content #socialmedia #instagram #facebook #twitter #linkedin #tiktok`;
      hashtagsField.value = aiHashtags;
      hashtagsField.placeholder = originalText;
      hashtagsField.disabled = false;
      
      if (window.showToast) {
        window.showToast('✅ Hashtags generated!', 'success');
      }
    }, 2000);
  }

  submitToZapier() {
    if (!this.currentPost) {
      console.error('❌ No current post to submit');
      return;
    }

    // Collect form data
    const formData = {
      description: document.getElementById('modal-description')?.value || '',
      caption: document.getElementById('modal-caption')?.value || '',
      hashtags: document.getElementById('modal-hashtags')?.value || '',
      brand: document.getElementById('modal-brand')?.value || 'wttt',
      product_type: document.getElementById('modal-product-type')?.value || '',
      product: document.getElementById('modal-product')?.value || '',
      website: document.getElementById('modal-website')?.value || '',
      delay: parseInt(document.getElementById('modal-delay')?.value || '0'),
      platforms: []
    };

    // Collect selected platforms
    ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'].forEach(platform => {
      const checkbox = document.getElementById(`platform-${platform}`);
      if (checkbox && checkbox.checked) {
        formData.platforms.push(platform);
      }
    });

    // Show loading state
    if (window.showToast) {
      window.showToast('🚀 Submitting to Zapier...', 'info');
    }

    // Submit to Zapier
    fetch('/api/submit-to-zapier', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...this.currentPost,
        ...formData
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        if (window.showToast) {
          window.showToast('✅ Successfully submitted to Zapier!', 'success');
        } else {
          alert('Successfully submitted to Zapier!');
        }
        this.close();
      } else {
        throw new Error(data.message || 'Failed to submit to Zapier');
      }
    })
    .catch(error => {
      console.error('❌ Zapier submission failed:', error);
      if (window.showToast) {
        window.showToast('❌ Failed to submit to Zapier: ' + error.message, 'error');
      } else {
        alert('Failed to submit to Zapier: ' + error.message);
      }
    });
  }
}

// Initialize modal when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.postModal = new PostModal();
  console.log('🎭 PostModal initialized and ready');
});