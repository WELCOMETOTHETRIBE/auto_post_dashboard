// === Modern Post Modal ===
class PostModal {
  constructor() {
    this.isOpen = false;
    this.currentPost = null;
    this.createModal();
    this.bindEvents();
    console.log('✅ Modern modal initialized');
  }

  createModal() {
    if (document.getElementById('post-modal')) {
      return;
    }

    const modalHTML = `
      <div id="post-modal" class="fixed inset-0 z-50 hidden">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onclick="window.postModal.close()"></div>
        
        <!-- Modal -->
        <div class="relative flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Edit Post</h2>
                <p class="text-gray-600 mt-1">Customize your content for social media</p>
              </div>
              <button id="modal-close" class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <i class="fas fa-times text-gray-600"></i>
              </button>
            </div>
            
            <!-- Content -->
            <div class="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
              
              <!-- Image Preview -->
              <div class="mb-6">
                <img id="modal-image" src="" alt="Post image" class="w-full h-48 object-cover rounded-xl shadow-sm" />
              </div>
              
              <!-- Form -->
              <div class="space-y-6">
                
                <!-- Description -->
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Image Description</label>
                  <textarea id="modal-description" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" rows="3" placeholder="Describe what you see in the image..."></textarea>
                  <p class="text-xs text-gray-500 mt-1">Help AI generate better captions</p>
                </div>
                
                <!-- Caption -->
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Caption</label>
                  <textarea id="modal-caption" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" rows="4" placeholder="Write an engaging caption..."></textarea>
                  <button id="generate-caption" class="mt-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium">
                    <i class="fas fa-magic mr-2"></i>
                    Generate with AI
                  </button>
                </div>
                
                <!-- Hashtags -->
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Hashtags</label>
                  <input id="modal-hashtags" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="#hashtag1 #hashtag2" />
                  <button id="generate-hashtags" class="mt-3 w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium">
                    <i class="fas fa-hashtag mr-2"></i>
                    Generate Hashtags
                  </button>
                </div>
                
                <!-- Brand & Product -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">Brand</label>
                    <select id="modal-brand" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="wttt">WTTT</option>
                      <option value="denlys">Denly</option>
                      <option value="jabronis">Jabroni</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">Product Type</label>
                    <select id="modal-product-type" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Select type</option>
                      <option value="supplement">Supplement</option>
                      <option value="apparel">Apparel</option>
                      <option value="accessory">Accessory</option>
                      <option value="digital">Digital</option>
                      <option value="service">Service</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <!-- Product Name & Website -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">Product Name</label>
                    <input id="modal-product" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Product name" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">Website URL</label>
                    <input id="modal-website" type="url" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="https://example.com" />
                  </div>
                </div>
                
                <!-- Platforms -->
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-3">Posting Platforms</label>
                  <div class="grid grid-cols-2 gap-3">
                    <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input type="checkbox" id="platform-instagram" class="mr-3 text-pink-500" />
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                          <i class="fab fa-instagram text-white text-sm"></i>
                        </div>
                        <span class="font-medium">Instagram</span>
                      </div>
                    </label>
                    
                    <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input type="checkbox" id="platform-facebook" class="mr-3 text-blue-600" />
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                          <i class="fab fa-facebook text-white text-sm"></i>
                        </div>
                        <span class="font-medium">Facebook</span>
                      </div>
                    </label>
                    
                    <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input type="checkbox" id="platform-twitter" class="mr-3 text-blue-400" />
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center mr-3">
                          <i class="fab fa-twitter text-white text-sm"></i>
                        </div>
                        <span class="font-medium">Twitter</span>
                      </div>
                    </label>
                    
                    <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input type="checkbox" id="platform-linkedin" class="mr-3 text-blue-700" />
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center mr-3">
                          <i class="fab fa-linkedin text-white text-sm"></i>
                        </div>
                        <span class="font-medium">LinkedIn</span>
                      </div>
                    </label>
                    
                    <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors col-span-2">
                      <input type="checkbox" id="platform-tiktok" class="mr-3 text-black" />
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
                          <i class="fab fa-tiktok text-white text-sm"></i>
                        </div>
                        <span class="font-medium">TikTok</span>
                      </div>
                    </label>
                  </div>
                </div>
                
                <!-- Delay -->
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Posting Delay</label>
                  <div class="flex items-center space-x-4">
                    <input id="modal-delay" type="number" min="0" max="168" value="0" class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center" />
                    <span class="text-sm text-gray-600">hours (0 = post immediately)</span>
                  </div>
                </div>
                
              </div>
            </div>
            
            <!-- Footer -->
            <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button id="modal-cancel" class="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors">
                Cancel
              </button>
              <button id="modal-save" class="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium transition-colors">
                Save Changes
              </button>
              <button id="modal-submit" class="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 font-medium transition-all duration-200">
                <i class="fas fa-rocket mr-2"></i>
                Submit to Zapier
              </button>
            </div>
            
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  bindEvents() {
    // Close buttons
    document.getElementById('modal-close').addEventListener('click', () => this.close());
    document.getElementById('modal-cancel').addEventListener('click', () => this.close());
    
    // Action buttons
    document.getElementById('modal-save').addEventListener('click', () => this.save());
    document.getElementById('modal-submit').addEventListener('click', () => this.submitToZapier());
    
    // AI generation
    document.getElementById('generate-caption').addEventListener('click', () => this.generateCaption());
    document.getElementById('generate-hashtags').addEventListener('click', () => this.generateHashtags());
    
    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open(post) {
    if (!post) return;

    this.isOpen = true;
    this.currentPost = post;
    this.populateForm(post);

    const modal = document.getElementById('post-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    this.currentPost = null;

    const modal = document.getElementById('post-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  populateForm(post) {
    // Image
    const imageEl = document.getElementById('modal-image');
    if (imageEl) {
      imageEl.src = post.image_url || post.imageUrl || '';
    }

    // Form fields
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
      if (element) element.value = value;
    });

    // Platforms
    const platforms = post.platforms || [];
    ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'].forEach(platform => {
      const checkbox = document.getElementById(`platform-${platform}`);
      if (checkbox) {
        checkbox.checked = platforms.includes(platform);
      }
    });
  }

  save() {
    if (!this.currentPost) return;

    const formData = this.collectFormData();
    Object.assign(this.currentPost, formData);

    // Update global posts array
    if (window.allPosts) {
      const index = window.allPosts.findIndex(p => p.token_id === this.currentPost.token_id);
      if (index !== -1) {
        window.allPosts[index] = this.currentPost;
      }
    }

    // Show success and close
    if (window.showToast) {
      window.showToast('Post updated successfully!', 'success');
    }
    this.close();
  }

  generateCaption() {
    const description = document.getElementById('modal-description').value;
    const captionField = document.getElementById('modal-caption');
    
    captionField.placeholder = 'Generating caption...';
    captionField.disabled = true;

    setTimeout(() => {
      const aiCaption = `Check out this amazing ${description || 'content'}! 🚀 #amazing #content #viral`;
      captionField.value = aiCaption;
      captionField.placeholder = 'Write an engaging caption...';
      captionField.disabled = false;
      
      if (window.showToast) {
        window.showToast('Caption generated!', 'success');
      }
    }, 2000);
  }

  generateHashtags() {
    const description = document.getElementById('modal-description').value;
    const hashtagsField = document.getElementById('modal-hashtags');
    
    hashtagsField.placeholder = 'Generating hashtags...';
    hashtagsField.disabled = true;

    setTimeout(() => {
      const aiHashtags = `#viral #trending #amazing #content #socialmedia #instagram #facebook #twitter #linkedin #tiktok`;
      hashtagsField.value = aiHashtags;
      hashtagsField.placeholder = '#hashtag1 #hashtag2';
      hashtagsField.disabled = false;
      
      if (window.showToast) {
        window.showToast('Hashtags generated!', 'success');
      }
    }, 2000);
  }

  collectFormData() {
    const formData = {
      description: document.getElementById('modal-description').value,
      caption: document.getElementById('modal-caption').value,
      hashtags: document.getElementById('modal-hashtags').value,
      brand: document.getElementById('modal-brand').value,
      product_type: document.getElementById('modal-product-type').value,
      product: document.getElementById('modal-product').value,
      website: document.getElementById('modal-website').value,
      delay: parseInt(document.getElementById('modal-delay').value) || 0,
      platforms: []
    };

    ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'].forEach(platform => {
      const checkbox = document.getElementById(`platform-${platform}`);
      if (checkbox && checkbox.checked) {
        formData.platforms.push(platform);
      }
    });

    return formData;
  }

  submitToZapier() {
    if (!this.currentPost) return;

    const formData = this.collectFormData();
    
    if (window.showToast) {
      window.showToast('Submitting to Zapier...', 'info');
    }

    fetch('/api/submit-to-zapier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...this.currentPost, ...formData })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        if (window.showToast) {
          window.showToast('Successfully submitted to Zapier!', 'success');
        }
        this.close();
      } else {
        throw new Error(data.message || 'Failed to submit');
      }
    })
    .catch(error => {
      console.error('Zapier submission failed:', error);
      if (window.showToast) {
        window.showToast('Failed to submit to Zapier', 'error');
      }
    });
  }
}

// Initialize modal
document.addEventListener('DOMContentLoaded', () => {
  window.postModal = new PostModal();
});