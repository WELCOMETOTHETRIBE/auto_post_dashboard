// === Modal Module ===
// Handles post editing and image upload modals with proper scroll management

class PostModal {
  constructor() {
    this.isOpen = false;
    this.currentPost = null;
    this.init();
  }

  init() {
    // Create modal HTML if it doesn't exist
    this.createModalHTML();
    
    // Bind event listeners
    this.bindEvents();
    
    console.log('🎭 Post modal initialized');
  }

  createModalHTML() {
    // Check if modal already exists
    if (document.getElementById('post-modal')) {
      return;
    }

    const modalHTML = `
      <div id="post-modal" class="post-modal">
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>Edit Post</h3>
            <button class="modal-close" onclick="window.postModal.close()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="post-preview">
              <img id="modal-image" src="" alt="Post image" />
            </div>
            <div class="post-form">
              <div class="form-group">
                <label for="modal-caption">Caption</label>
                <div class="input-group">
                  <textarea id="modal-caption" placeholder="Write an engaging caption..."></textarea>
                  <button type="button" class="btn btn-sm btn-secondary" onclick="window.postModal.generateCaption()">
                    <i class="fas fa-magic"></i>
                    <span>AI Generate</span>
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label for="modal-hashtags">Hashtags</label>
                <div class="input-group">
                  <input type="text" id="modal-hashtags" placeholder="#hashtag1 #hashtag2" />
                  <button type="button" class="btn btn-sm btn-secondary" onclick="window.postModal.generateHashtags()">
                    <i class="fas fa-hashtag"></i>
                    <span>AI Generate</span>
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label>Platforms</label>
                <div class="platform-toggles">
                  <label class="platform-toggle">
                    <input type="checkbox" id="platform-instagram" />
                    <span>Instagram</span>
                  </label>
                  <label class="platform-toggle">
                    <input type="checkbox" id="platform-facebook" />
                    <span>Facebook</span>
                  </label>
                  <label class="platform-toggle">
                    <input type="checkbox" id="platform-twitter" />
                    <span>Twitter</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="window.postModal.close()">Cancel</button>
            <button class="btn btn-primary" onclick="window.postModal.save()">Save Changes</button>
            <button class="btn btn-success" onclick="window.postModal.submitToZapier()">🚀 Submit to Zapier</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
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
  }

  findPostById(postId) {
    // This should be implemented based on how posts are stored
    // For now, we'll use a global posts array
    if (window.allPosts) {
      return window.allPosts.find(post => post.token_id === postId);
    }
    return null;
  }

  open(post) {
    if (!post) {
      console.error('No post provided to modal');
      return;
    }

    this.currentPost = post;
    this.isOpen = true;

    // Populate modal with post data
    this.populateModal(post);

    // Show modal
    const modal = document.getElementById('post-modal');
    modal.classList.add('open');

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    console.log('🎭 Modal opened for post:', post.token_id);
  }

  close() {
    this.isOpen = false;
    this.currentPost = null;

    // Hide modal
    const modal = document.getElementById('post-modal');
    modal.classList.remove('open');

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
  }

  async generateCaption() {
    try {
      const prompt = `Generate an engaging social media caption for this image. Make it creative, authentic, and engaging.`;
      
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        throw new Error(`AI generation failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      document.getElementById('modal-caption').value = data.caption;
      
      window.showToast('✨ AI caption generated successfully!', 'success');
    } catch (error) {
      console.error('Caption generation error:', error);
      window.showToast('❌ Failed to generate caption: ' + error.message, 'error');
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
    try {
      if (!this.currentPost) {
        window.showToast('❌ No post to submit', 'error');
        return;
      }

      const caption = document.getElementById('modal-caption').value;
      const hashtags = document.getElementById('modal-hashtags').value;
      const platforms = [];
      
      if (document.getElementById('platform-instagram').checked) platforms.push('instagram');
      if (document.getElementById('platform-facebook').checked) platforms.push('facebook');
      if (document.getElementById('platform-twitter').checked) platforms.push('twitter');

      if (!caption.trim()) {
        window.showToast('⚠️ Please write a caption first', 'warning');
        return;
      }

      if (platforms.length === 0) {
        window.showToast('⚠️ Please select at least one platform', 'warning');
        return;
      }

      const submitData = {
        image_url: this.currentPost.image_url,
        caption: caption,
        hashtags: hashtags,
        platforms: platforms.join(','),
        brand: this.currentPost.brand || 'wttt',
        submitted_at: new Date().toISOString()
      };

      window.showToast('📤 Submitting to Zapier...', 'info');

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
        window.showToast('✅ Successfully submitted to Zapier!', 'success');
        this.close();
      } else {
        throw new Error(result.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Zapier submission error:', error);
      window.showToast('❌ Failed to submit: ' + error.message, 'error');
    }
  }

  save() {
    if (!this.currentPost) {
      console.error('No post to save');
      return;
    }

    // Collect form data
    const caption = document.getElementById('modal-caption').value;
    const hashtags = document.getElementById('modal-hashtags').value;
    const platforms = [];
    
    if (document.getElementById('platform-instagram').checked) platforms.push('instagram');
    if (document.getElementById('platform-facebook').checked) platforms.push('facebook');
    if (document.getElementById('platform-twitter').checked) platforms.push('twitter');

    // Update post data
    this.currentPost.caption = caption;
    this.currentPost.hashtags = hashtags;
    this.currentPost.platform = platforms.join(', ');

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
}

class UploadModal {
  constructor() {
    this.isOpen = false;
    this.init();
  }

  init() {
    this.createModalHTML();
    this.bindEvents();
    console.log('📤 Upload modal initialized');
  }

  createModalHTML() {
    if (document.getElementById('upload-modal')) {
      return;
    }

    const modalHTML = `
      <div id="upload-modal" class="upload-modal">
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>Upload New Image</h3>
            <button class="modal-close" onclick="window.uploadModal.close()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form id="upload-form" enctype="multipart/form-data">
              <div class="form-group">
                <label for="upload-image">Select Image</label>
                <input type="file" id="upload-image" name="image" accept="image/*" required />
                <div class="image-preview" id="image-preview" style="display: none;">
                  <img id="preview-img" src="" alt="Preview" />
                </div>
              </div>
              
              <div class="form-group">
                <label for="upload-description">Image Description</label>
                <textarea id="upload-description" name="description" placeholder="Describe what you see in the image..." rows="3"></textarea>
                <small>This description will be used by AI to generate better captions</small>
              </div>
              
              <div class="form-group">
                <label for="upload-caption">Caption (Optional)</label>
                <div class="input-group">
                  <textarea id="upload-caption" name="caption" placeholder="Write a caption or let AI generate one..."></textarea>
                  <button type="button" class="btn btn-sm btn-secondary" onclick="window.uploadModal.generateCaption()">
                    <i class="fas fa-magic"></i>
                    <span>AI Generate</span>
                  </button>
                </div>
              </div>
              
              <div class="form-group">
                <label for="upload-hashtags">Hashtags (Optional)</label>
                <div class="input-group">
                  <input type="text" id="upload-hashtags" name="hashtags" placeholder="#hashtag1 #hashtag2" />
                  <button type="button" class="btn btn-sm btn-secondary" onclick="window.uploadModal.generateHashtags()">
                    <i class="fas fa-hashtag"></i>
                    <span>AI Generate</span>
                  </button>
                </div>
              </div>
              
              <div class="form-group">
                <label>Posting Platforms</label>
                <div class="platform-toggles">
                  <label class="platform-toggle">
                    <input type="checkbox" name="platforms" value="instagram" />
                    <span>Instagram</span>
                  </label>
                  <label class="platform-toggle">
                    <input type="checkbox" name="platforms" value="facebook" />
                    <span>Facebook</span>
                  </label>
                  <label class="platform-toggle">
                    <input type="checkbox" name="platforms" value="twitter" />
                    <span>Twitter</span>
                  </label>
                  <label class="platform-toggle">
                    <input type="checkbox" name="platforms" value="linkedin" />
                    <span>LinkedIn</span>
                  </label>
                  <label class="platform-toggle">
                    <input type="checkbox" name="platforms" value="tiktok" />
                    <span>TikTok</span>
                  </label>
                </div>
              </div>
              
              <div class="form-group">
                <label for="upload-delay">Posting Delay (Hours)</label>
                <input type="number" id="upload-delay" name="hourDelay" min="0" max="168" value="0" />
                <small>0 = post immediately, 24 = post in 24 hours</small>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="window.uploadModal.close()">Cancel</button>
            <button class="btn btn-primary" onclick="window.uploadModal.upload()">
              <i class="fas fa-upload"></i>
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
    this.isOpen = true;
    document.getElementById('upload-modal').classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    document.getElementById('upload-modal').classList.remove('show');
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