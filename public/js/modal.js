// === Simple Working Post Modal ===
class PostModal {
  constructor() {
    this.isOpen = false;
    this.currentPost = null;
    this.createModal();
    this.bindEvents();
    console.log('✅ Modal initialized');
  }

  createModal() {
    if (document.getElementById('post-modal')) {
      return;
    }

    const modalHTML = `
      <div id="post-modal" class="fixed inset-0 z-50 hidden bg-black bg-opacity-50">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b">
              <h2 class="text-xl font-semibold">Edit Post</h2>
              <button id="modal-close" class="text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <!-- Scrollable Content -->
            <div class="overflow-y-auto max-h-[calc(90vh-120px)] p-4">
              
              <!-- Image Preview -->
              <div class="mb-4">
                <img id="modal-image" src="" alt="Post image" class="w-full h-48 object-cover rounded-lg" />
              </div>
              
              <!-- Form Fields -->
              <div class="space-y-4">
                
                <!-- Description -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Image Description</label>
                  <textarea id="modal-description" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Describe the image..."></textarea>
                </div>
                
                <!-- Caption -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                  <textarea id="modal-caption" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="4" placeholder="Write your caption..."></textarea>
                  <button id="generate-caption" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    Generate with AI
                  </button>
                </div>
                
                <!-- Hashtags -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hashtags</label>
                  <input id="modal-hashtags" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="#hashtag1 #hashtag2" />
                  <button id="generate-hashtags" class="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                    Generate Hashtags
                  </button>
                </div>
                
                <!-- Brand -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <select id="modal-brand" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="wttt">WTTT</option>
                    <option value="denlys">Denly</option>
                    <option value="jabronis">Jabroni</option>
                  </select>
                </div>
                
                <!-- Product Type -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                  <select id="modal-product-type" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select product type</option>
                    <option value="supplement">Supplement</option>
                    <option value="apparel">Apparel</option>
                    <option value="accessory">Accessory</option>
                    <option value="digital">Digital</option>
                    <option value="service">Service</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <!-- Product Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input id="modal-product" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Product name" />
                </div>
                
                <!-- Website -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input id="modal-website" type="url" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com" />
                </div>
                
                <!-- Platforms -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Posting Platforms</label>
                  <div class="grid grid-cols-2 gap-2">
                    <label class="flex items-center">
                      <input type="checkbox" id="platform-instagram" class="mr-2" />
                      Instagram
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" id="platform-facebook" class="mr-2" />
                      Facebook
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" id="platform-twitter" class="mr-2" />
                      Twitter
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" id="platform-linkedin" class="mr-2" />
                      LinkedIn
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" id="platform-tiktok" class="mr-2" />
                      TikTok
                    </label>
                  </div>
                </div>
                
                <!-- Delay -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Posting Delay (hours)</label>
                  <input id="modal-delay" type="number" min="0" max="168" value="0" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
              </div>
            </div>
            
            <!-- Footer -->
            <div class="flex items-center justify-end space-x-3 p-4 border-t bg-gray-50">
              <button id="modal-cancel" class="px-4 py-2 text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button id="modal-save" class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900">
                Save Changes
              </button>
              <button id="modal-submit" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
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
    // Close button
    document.getElementById('modal-close').addEventListener('click', () => this.close());
    document.getElementById('modal-cancel').addEventListener('click', () => this.close());
    
    // Save button
    document.getElementById('modal-save').addEventListener('click', () => this.save());
    
    // Submit button
    document.getElementById('modal-submit').addEventListener('click', () => this.submitToZapier());
    
    // AI generation buttons
    document.getElementById('generate-caption').addEventListener('click', () => this.generateCaption());
    document.getElementById('generate-hashtags').addEventListener('click', () => this.generateHashtags());
    
    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
    
    // Click outside to close
    document.getElementById('post-modal').addEventListener('click', (e) => {
      if (e.target.id === 'post-modal') {
        this.close();
      }
    });
  }

  open(post) {
    console.log('Opening modal for post:', post);
    
    if (!post) {
      console.error('No post provided');
      return;
    }

    this.isOpen = true;
    this.currentPost = post;

    // Populate form
    this.populateForm(post);

    // Show modal
    const modal = document.getElementById('post-modal');
    modal.classList.remove('hidden');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    this.currentPost = null;

    // Hide modal
    const modal = document.getElementById('post-modal');
    modal.classList.add('hidden');
    
    // Restore body scroll
    document.body.style.overflow = '';
  }

  populateForm(post) {
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
      console.error('No current post to save');
      return;
    }

    // Collect form data
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
    alert('Post updated successfully!');
    this.close();
  }

  generateCaption() {
    const description = document.getElementById('modal-description').value;
    const captionField = document.getElementById('modal-caption');
    
    if (!captionField) return;

    // Show loading
    captionField.placeholder = 'Generating caption...';
    captionField.disabled = true;

    // Simulate AI generation
    setTimeout(() => {
      const aiCaption = `Check out this amazing ${description || 'content'}! 🚀 #amazing #content #viral`;
      captionField.value = aiCaption;
      captionField.placeholder = 'Write your caption...';
      captionField.disabled = false;
      alert('Caption generated!');
    }, 2000);
  }

  generateHashtags() {
    const description = document.getElementById('modal-description').value;
    const hashtagsField = document.getElementById('modal-hashtags');
    
    if (!hashtagsField) return;

    // Show loading
    hashtagsField.placeholder = 'Generating hashtags...';
    hashtagsField.disabled = true;

    // Simulate AI generation
    setTimeout(() => {
      const aiHashtags = `#viral #trending #amazing #content #socialmedia #instagram #facebook #twitter #linkedin #tiktok`;
      hashtagsField.value = aiHashtags;
      hashtagsField.placeholder = '#hashtag1 #hashtag2';
      hashtagsField.disabled = false;
      alert('Hashtags generated!');
    }, 2000);
  }

  submitToZapier() {
    if (!this.currentPost) {
      console.error('No current post to submit');
      return;
    }

    // Collect form data
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

    // Collect selected platforms
    ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'].forEach(platform => {
      const checkbox = document.getElementById(`platform-${platform}`);
      if (checkbox && checkbox.checked) {
        formData.platforms.push(platform);
      }
    });

    // Show loading
    alert('Submitting to Zapier...');

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
        alert('Successfully submitted to Zapier!');
        this.close();
      } else {
        throw new Error(data.message || 'Failed to submit to Zapier');
      }
    })
    .catch(error => {
      console.error('Zapier submission failed:', error);
      alert('Failed to submit to Zapier: ' + error.message);
    });
  }
}

// Initialize modal when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.postModal = new PostModal();
  console.log('✅ Modal ready');
});