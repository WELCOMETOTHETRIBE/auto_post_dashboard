// === Tribe SPA - Recovery Version ===

// Global variables
let allPosts = [];
let currentTab = 'active';

// === Initialization ===
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Tribe SPA v1.0.0-recovery initializing...');
  console.log('📱 User Agent:', navigator.userAgent);
  console.log('📅 Build Time:', new Date().toISOString());
  
  // Check if auth is required
  const requireAuth = window.CONFIG?.requireAuth || false;
  
  if (!requireAuth) {
    console.log('✅ Auth disabled - going straight to dashboard');
    // Initialize app directly without auth
    initializeApp();
  } else {
    console.log('🔐 Auth required - showing auth screen');
    // Show auth screen (not implemented in this version)
    showAuthScreen();
  }
});

// === App Initialization ===
function initializeApp() {
  // Initialize basic functionality
  initializeBasicApp();
  
  // Load posts using new git API module
  loadPosts();
  
  // Hide splash screen after a delay
  setTimeout(hideSplashScreen, 2500);
}

// === Auth Screen (placeholder) ===
function showAuthScreen() {
  console.log('Auth screen not implemented in recovery version');
  // For now, just initialize the app anyway
  initializeApp();
}

// === Basic App Initialization ===
function initializeBasicApp() {
  // Add basic event listeners
  const activeTab = document.getElementById('active-tab');
  const postedTab = document.getElementById('posted-tab');
  
  if (activeTab) activeTab.addEventListener('click', () => switchTab('active'));
  if (postedTab) postedTab.addEventListener('click', () => switchTab('posted'));
  
  // Initialize upload modal
  const uploadBtn = document.querySelector('[onclick="toggleUploadModal()"]');
  if (uploadBtn) uploadBtn.addEventListener('click', toggleUploadModal);
  
  // Initialize search modal
  const searchBtn = document.querySelector('[onclick="toggleSearchModal()"]');
  if (searchBtn) searchBtn.addEventListener('click', toggleSearchModal);
  
  // Initialize profile modal
  const profileBtn = document.querySelector('[onclick="toggleProfileModal()"]');
  if (profileBtn) profileBtn.addEventListener('click', toggleProfileModal);
}

// === iOS Splash Screen ===
function hideSplashScreen() {
  const splash = document.getElementById('ios-splash');
  if (splash) {
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.style.display = 'none';
    }, 500);
  }
}

// === Tab Switching ===
function switchTab(tab) {
  currentTab = tab;
  
  // Update tab buttons
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  if (tab === 'active') {
    document.getElementById('active-tab').classList.add('active');
  } else {
    document.getElementById('posted-tab').classList.add('active');
  }
  
  // Reload posts for the selected tab
  displayPosts();
}

// === Load Posts ===
async function loadPosts() {
  const loadingIndicator = document.getElementById('loading-indicator');
  const emptyState = document.getElementById('empty-state');
  
  if (loadingIndicator) loadingIndicator.style.display = 'flex';
  
  try {
    // Use the new git API module with fallback
    const posts = await window.fetchPosts();
    allPosts = posts;
    
    // Store in global scope for modal access
    window.allPosts = allPosts;
    
    displayPosts();
    
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    
    console.log(`✅ Loaded ${posts.length} posts successfully`);
  } catch (err) {
    console.error('❌ Failed to load posts:', err);
    window.logError('POSTS_LOAD_ERROR', { error: err.message });
    
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    if (emptyState) emptyState.style.display = 'flex';
  }
}

// === Display Posts ===
function displayPosts() {
  const container = document.getElementById('posts-container');
  const emptyState = document.getElementById('empty-state');
  
  if (!container) return;
  
  container.innerHTML = '';
  
  const postsToShow = currentTab === 'active' 
    ? allPosts.filter(post => post.status !== 'hidden')
    : allPosts.filter(post => post.status === 'hidden');
  
  if (postsToShow.length === 0) {
    if (emptyState) {
      emptyState.style.display = 'flex';
      const h3 = emptyState.querySelector('h3');
      const p = emptyState.querySelector('p');
      if (h3) h3.textContent = currentTab === 'active' ? 'No active content' : 'No posted content';
      if (p) p.textContent = currentTab === 'active' ? 'Upload new media to get started' : 'No posts have been published yet';
    }
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  
  postsToShow.forEach((post, index) => {
    const postElement = createPostElement(post, index);
    container.appendChild(postElement);
  });
}

// === Create Post Element ===
function createPostElement(post, index) {
  const postElement = document.createElement('div');
  postElement.className = 'post';
  
  const isPosted = post.status === 'hidden';
  const postedDate = post.posted_date || new Date().toLocaleDateString();
  
  postElement.innerHTML = `
    <div class="post-image-container" onclick="openEditModal(${index}, '${post.image_url}')">
      <div class="post-image">
        <img src="${post.image_url}" alt="Post image" loading="lazy" />
        ${isPosted ? `<div class="posted-badge">
          <i class="fas fa-check-circle"></i>
          <span>Posted</span>
        </div>` : ''}
        ${post.brand ? `<div class="brand-badge brand-${post.brand}">
          <i class="fas fa-tag"></i>
          <span>${getBrandDisplayName(post.brand)}</span>
        </div>` : ''}
      </div>
    </div>
    
    ${isPosted ? `
    <div class="post-info">
      <div class="post-meta">
        <span class="posted-date">
          <i class="fas fa-calendar"></i>
          Posted on ${postedDate}
        </span>
        ${post.platform ? `<span class="posted-platform">
          <i class="fas fa-share"></i>
          ${post.platform}
        </span>` : ''}
      </div>
      ${post.caption ? `<div class="posted-caption">
        <strong>Caption:</strong> ${post.caption}
      </div>` : ''}
      ${post.hashtags ? `<div class="posted-hashtags">
        <strong>Hashtags:</strong> ${post.hashtags}
      </div>` : ''}
    </div>
    ` : `
    <div class="post-actions">
      <button class="btn btn-primary post-now-btn" onclick="openEditModal(${index}, '${post.image_url}')">
        <i class="fas fa-edit"></i>
        <span>Edit Post</span>
      </button>
    </div>
    `}
  `;
  
  return postElement;
}

// === Utility Functions ===
function getBrandDisplayName(brandCode) {
  const brandNames = {
    'wttt': 'WTTT',
    'denlys': 'Denly',
    'jabronis': 'Jabroni'
  };
  return brandNames[brandCode] || brandCode;
}

// === Modal Functions ===
function toggleUploadModal() {
  const modal = document.getElementById('upload-modal');
  if (modal) {
    modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
  }
}

function toggleSearchModal() {
  const modal = document.getElementById('search-modal');
  if (modal) {
    modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
  }
}

function toggleProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) {
    modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
  }
}

// === Edit Modal ===
function openEditModal(index, imageUrl) {
  // Use the new modal system
  const post = allPosts[index];
  if (post) {
    window.openPostModal(post.token_id);
  } else {
    console.error('Post not found for index:', index);
    window.logError('MODAL_ERROR', { index, imageUrl });
  }
}

function closeEditModal() {
  // Use the new modal system
  window.closePostModal();
}

// === Toast Notifications ===
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  const container = document.getElementById('toast-container');
  if (container) {
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}
