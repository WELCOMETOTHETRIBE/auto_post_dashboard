// === Modal Module ===
// Handles post editing modal with proper scroll management

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
                <textarea id="modal-caption" placeholder="Write an engaging caption..."></textarea>
              </div>
              <div class="form-group">
                <label for="modal-hashtags">Hashtags</label>
                <input type="text" id="modal-hashtags" placeholder="#hashtag1 #hashtag2" />
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

// Create global instance
const postModal = new PostModal();
window.postModal = postModal;

// Export functions for global use
window.openPostModal = (postId) => {
  const post = postModal.findPostById(postId);
  if (post) {
    postModal.open(post);
  }
};

window.closePostModal = () => postModal.close(); 