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
      <div id="post-modal" class="modal-overlay hidden">
        <div class="modal-content max-w-4xl">
          <div class="modal-header">
            <h3 class="text-xl font-semibold text-secondary-900">Edit Post</h3>
            <button class="modal-close text-secondary-400 hover:text-secondary-600 transition-colors duration-200" onclick="window.postModal.close()">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <!-- Image Preview -->
            <div class="mb-6 text-center">
              <img id="modal-image" src="" alt="Post image" class="max-w-full max-h-64 rounded-xl shadow-lg mx-auto" />
            </div>
            
            <!-- Tab Navigation -->
            <div class="flex border-b border-gray-200 mb-6">
              <button class="tab-btn active px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600" data-tab="content">
                <i class="fas fa-edit mr-2"></i>Content
              </button>
              <button class="tab-btn px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700" data-tab="settings">
                <i class="fas fa-cog mr-2"></i>Settings
              </button>
              <button class="tab-btn px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700" data-tab="publish">
                <i class="fas fa-rocket mr-2"></i>Publish
              </button>
            </div>
            
            <!-- Content Tab -->
            <div id="tab-content" class="tab-content">
              <div class="space-y-6">
                <div>
                  <label for="modal-description" class="block text-sm font-medium text-gray-700 mb-2">Image Description</label>
                  <textarea id="modal-description" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Describe what you see in the image..." rows="2"></textarea>
                  <p class="text-xs text-gray-500 mt-1">Help AI generate better captions by describing the image</p>
                </div>
                
                <div>
                  <label for="modal-caption" class="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                  <div class="flex gap-2">
                    <textarea id="modal-caption" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Write an engaging caption..." rows="3"></textarea>
                    <button type="button" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap" onclick="window.postModal.generateCaption()">
                      <i class="fas fa-magic mr-1"></i>AI
                    </button>
                  </div>
                </div>
                
                <div>
                  <label for="modal-hashtags" class="block text-sm font-medium text-gray-700 mb-2">Hashtags</label>
                  <div class="flex gap-2">
                    <input type="text" id="modal-hashtags" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="#hashtag1 #hashtag2" />
                    <button type="button" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap" onclick="window.postModal.generateHashtags()">
                      <i class="fas fa-hashtag mr-1"></i>AI
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Settings Tab -->
            <div id="tab-settings" class="tab-content hidden">
              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="modal-brand" class="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                    <select id="modal-brand" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="wttt">WTTT</option>
                      <option value="denlys">Denly</option>
                      <option value="jabronis">Jabroni</option>
                    </select>
                  </div>
                  
                  <div>
                    <label for="modal-product-type" class="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                    <select id="modal-product-type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
                  <label for="modal-product" class="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input type="text" id="modal-product" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Specific product name or category" />
                </div>
                
                <div>
                  <label for="modal-website" class="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                  <input type="url" id="modal-website" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="https://example.com/product" />
                </div>
              </div>
            </div>
            
            <!-- Publish Tab -->
            <div id="tab-publish" class="tab-content hidden">
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Posting Platforms</label>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" id="platform-instagram" class="mr-3" />
                      <i class="fab fa-instagram text-pink-500 mr-2"></i>
                      <span class="text-sm font-medium">Instagram</span>
                    </label>
                    <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" id="platform-facebook" class="mr-3" />
                      <i class="fab fa-facebook text-blue-600 mr-2"></i>
                      <span class="text-sm font-medium">Facebook</span>
                    </label>
                    <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" id="platform-twitter" class="mr-3" />
                      <i class="fab fa-twitter text-blue-400 mr-2"></i>
                      <span class="text-sm font-medium">Twitter</span>
                    </label>
                    <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" id="platform-linkedin" class="mr-3" />
                      <i class="fab fa-linkedin text-blue-700 mr-2"></i>
                      <span class="text-sm font-medium">LinkedIn</span>
                    </label>
                    <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" id="platform-tiktok" class="mr-3" />
                      <i class="fab fa-tiktok text-black mr-2"></i>
                      <span class="text-sm font-medium">TikTok</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label for="modal-delay" class="block text-sm font-medium text-gray-700 mb-2">Posting Delay</label>
                  <div class="flex items-center gap-3">
                    <input type="number" id="modal-delay" class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" min="0" max="168" value="0" />
                    <span class="text-sm text-gray-600">hours (0 = post immediately)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors" onclick="window.postModal.close()">Cancel</button>
            <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onclick="window.postModal.save()">Save Changes</button>
            <button class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" onclick="window.postModal.submitToZapier()">
              <i class="fas fa-rocket mr-2"></i>Submit to Zapier
            </button>
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
      btn.classList.remove('active', 'text-blue-600', 'border-blue-600');
      btn.classList.add('text-gray-500');
    });
    
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active', 'text-blue-600', 'border-blue-600');
      activeBtn.classList.remove('text-gray-500');
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

    // Show modal
    const modal = document.getElementById('post-modal');
    console.log('🎭 Found modal element:', !!modal);
    
    if (modal) {
      modal.classList.remove('hidden');
      console.log('✅ Modal hidden class removed');
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

    // Hide modal
    const modal = document.getElementById('post-modal');
    modal.classList.add('hidden'); // Add hidden class to hide

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