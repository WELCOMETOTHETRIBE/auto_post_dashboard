// === Tribe SPA - Recovery Version ===

// Global variables
let allPosts = [];
let currentTab = 'active';

// === Initialization ===
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Tribe SPA v1.0.1 initializing...');
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
  console.log('🚀 Initializing app...');
  
  try {
    // Initialize basic functionality
    initializeBasicApp();
    console.log('✅ Basic app initialized');
    
    // Register service worker
    registerServiceWorker();
    console.log('✅ Service worker registered');
    
    // Load posts using new git API module
    loadPosts().catch(error => {
      console.error('❌ Failed to load posts:', error);
      // Show empty state if posts fail to load
      showEmptyState();
    });
    console.log('✅ Posts loading started');
    
  } catch (error) {
    console.error('❌ App initialization failed:', error);
  }
  
  // Always hide splash screen after a delay, even if there are errors
  setTimeout(() => {
    console.log('🔄 Hiding splash screen...');
    hideSplashScreen();
  }, 2500);
}

// === Service Worker Registration ===
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Simple service worker registration without aggressive updates
    navigator.serviceWorker.register('/sw.js?v=20250914-stable')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration);
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data && event.data.type === 'FORCE_RELOAD') {
            console.log('🔄 Force reload requested by service worker');
            window.location.reload(true);
          }
        });
        
        // Only check for updates once, not continuously
        if (registration.waiting) {
          // There's already a waiting service worker
          console.log('Service worker waiting, skipping update check');
          return;
        }
        
        // Check for updates only once
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, but don't prompt immediately
              console.log('New service worker installed, will update on next page load');
            }
          });
        });
      })
      .catch(error => {
        console.error('❌ Service Worker registration failed:', error);
      });
  }
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
  
  if (activeTab) {
    activeTab.addEventListener('click', () => switchTab('active'));
    // Set initial active state
    activeTab.classList.add('bg-primary-100', 'text-primary-700');
    activeTab.classList.remove('text-secondary-600');
  }
  if (postedTab) {
    postedTab.addEventListener('click', () => switchTab('posted'));
    postedTab.classList.add('text-secondary-600');
  }
}

// === iOS Splash Screen ===
function hideSplashScreen() {
  console.log('🔄 Hiding splash screen...');
  const splash = document.getElementById('ios-splash');
  if (splash) {
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.style.display = 'none';
      console.log('✅ Splash screen hidden');
    }, 500);
  } else {
    console.log('❌ Splash screen element not found');
  }
}

// Emergency fallback - hide splash screen after 5 seconds no matter what
setTimeout(() => {
  const splash = document.getElementById('ios-splash');
  if (splash && splash.style.display !== 'none') {
    console.log('🚨 Emergency splash screen hide');
    splash.style.display = 'none';
  }
}, 5000);

// === Tab Switching ===
function switchTab(tab) {
  currentTab = tab;
  
  // Update tab buttons
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('bg-primary-100', 'text-primary-700');
    item.classList.add('text-secondary-600');
  });
  
  if (tab === 'active') {
    const activeTab = document.getElementById('active-tab');
    if (activeTab) {
      activeTab.classList.add('bg-primary-100', 'text-primary-700');
      activeTab.classList.remove('text-secondary-600');
    }
  } else {
    const postedTab = document.getElementById('posted-tab');
    if (postedTab) {
      postedTab.classList.add('bg-primary-100', 'text-primary-700');
      postedTab.classList.remove('text-secondary-600');
    }
  }
  
  // Reload posts for the selected tab
  displayPosts();
}

// === Load Posts ===
async function loadPosts() {
  const loadingIndicator = document.getElementById('loading-indicator');
  const emptyState = document.getElementById('empty-state');
  
  if (loadingIndicator) loadingIndicator.classList.remove('hidden');
  
  try {
    // Use the new git API module with fallback
    const posts = await window.fetchPosts();
    allPosts = posts;
    
    // Store in global scope for modal access
    window.allPosts = allPosts;
    
    displayPosts();
    
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    
    console.log(`✅ Loaded ${posts.length} posts successfully`);
  } catch (err) {
    console.error('❌ Failed to load posts:', err);
    if (window.logError) {
      window.logError('POSTS_LOAD_ERROR', { error: err.message });
    }
    
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
  }
}

// === Display Posts ===
function displayPosts() {
  const container = document.getElementById('posts-container');
  const emptyState = document.getElementById('empty-state');
  const loadingIndicator = document.getElementById('loading-indicator');
  
  if (!container) return;
  
  container.innerHTML = '';
  
  const postsToShow = currentTab === 'active' 
    ? allPosts.filter(post => post.status !== 'hidden')
    : allPosts.filter(post => post.status === 'hidden');
  
  if (postsToShow.length === 0) {
    if (emptyState) {
      emptyState.classList.remove('hidden');
      const h3 = emptyState.querySelector('h3');
      const p = emptyState.querySelector('p');
      if (h3) h3.textContent = currentTab === 'active' ? 'No active content' : 'No posted content';
      if (p) p.textContent = currentTab === 'active' ? 'Upload new media to get started' : 'No posts have been published yet';
    }
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    return;
  }
  
  if (emptyState) emptyState.classList.add('hidden');
  if (loadingIndicator) loadingIndicator.classList.add('hidden');
  
  postsToShow.forEach((post, index) => {
    const postElement = createPostElement(post, post.token_id);
    container.appendChild(postElement);
  });
}

// === Create Post Element ===
function createPostElement(post, tokenId) {
  const postElement = document.createElement('div');
  postElement.className = 'bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer';
  
  const isPosted = post.status === 'hidden';
  const postedDate = post.posted_date || new Date().toLocaleDateString();
  
  postElement.innerHTML = `
    <div class="relative group" onclick="openEditModal('${tokenId}', '${post.image_url}')">
      <div class="aspect-square overflow-hidden">
        <img src="${post.image_url}" alt="Post image" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      
      <!-- Delete button -->
      <button class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold opacity-80 hover:opacity-100 transition-opacity duration-200 z-10 shadow-lg" 
              onclick="event.stopPropagation(); deletePost('${tokenId}')" 
              title="Delete post">
        <i class="fas fa-times"></i>
      </button>
      
      ${isPosted ? `<div class="absolute top-2 right-12 bg-success-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
        <i class="fas fa-check-circle"></i>
        <span>Posted</span>
      </div>` : ''}
      
      ${post.brand ? `<div class="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
        <i class="fas fa-tag"></i>
        <span>${getBrandDisplayName(post.brand)}</span>
      </div>` : ''}
    </div>
    
    ${isPosted ? `
    <div class="p-4 space-y-3">
      <div class="flex items-center gap-4 text-xs text-secondary-600">
        <span class="flex items-center gap-1">
          <i class="fas fa-calendar"></i>
          Posted on ${postedDate}
        </span>
        ${post.platform ? `<span class="flex items-center gap-1">
          <i class="fas fa-share"></i>
          ${post.platform}
        </span>` : ''}
      </div>
      ${post.caption ? `<div class="text-sm">
        <strong class="text-secondary-900">Caption:</strong> 
        <span class="text-secondary-700">${post.caption}</span>
      </div>` : ''}
      ${post.hashtags ? `<div class="text-sm">
        <strong class="text-secondary-900">Hashtags:</strong> 
        <span class="text-secondary-700">${post.hashtags}</span>
      </div>` : ''}
    </div>
    ` : `
    <div class="p-4">
      <button class="w-full btn btn-primary" onclick="openEditModal('${tokenId}', '${post.image_url}')">
        <i class="fas fa-edit mr-2"></i>
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

// === Edit Modal ===
function openEditModal(tokenId, imageUrl) {
  console.log('🔍 openEditModal called:', { tokenId, imageUrl, allPostsLength: allPosts.length });
  
  // Use the new modal system - find post by token_id
  const post = allPosts.find(p => p.token_id === tokenId);
  console.log('📝 Found post:', post);
  
  if (post && window.postModal) {
    console.log('✅ Opening modal with post:', post);
    // Open the modal directly with the post object
    window.postModal.open(post);
  } else {
    console.error('❌ Post not found for token_id:', tokenId, 'or modal not available');
    console.log('🔍 Debug info:', {
      post: !!post,
      postModal: !!window.postModal,
      postModalOpen: !!window.postModal?.open
    });
    if (window.logError) {
      window.logError('MODAL_ERROR', { tokenId, imageUrl });
    }
  }
}

function closeEditModal() {
  // Use the new modal system
  if (window.postModal) {
    window.postModal.close();
  }
}

// === Delete Post Function ===
async function deletePost(tokenId) {
  // Find the post to get confirmation details
  const post = allPosts.find(p => p.token_id === tokenId);
  if (!post) {
    console.error('Post not found for deletion:', tokenId);
    return;
  }

  // Show confirmation dialog
  const confirmed = confirm(`Are you sure you want to delete this post?\n\nImage: ${post.image_url.split('/').pop()}\nBrand: ${post.brand || 'Unknown'}\n\nThis action cannot be undone.`);
  
  if (!confirmed) {
    return;
  }

  try {
    console.log('🗑️ Deleting post:', tokenId);
    
    // Remove from local array
    const postIndex = allPosts.findIndex(p => p.token_id === tokenId);
    if (postIndex !== -1) {
      allPosts.splice(postIndex, 1);
      console.log('✅ Post removed from local array');
    }

    // Update posts.json file
    await updatePostsJsonAfterDelete(tokenId);
    
    // Refresh the display
    displayPosts();
    
    // Show success message
    if (window.showToast) {
      window.showToast('✅ Post deleted successfully!', 'success');
    } else {
      alert('Post deleted successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    
    // Show error message
    if (window.showToast) {
      window.showToast('❌ Failed to delete post: ' + error.message, 'error');
    } else {
      alert('Failed to delete post: ' + error.message);
    }
  }
}

// === Update Posts JSON After Delete ===
async function updatePostsJsonAfterDelete(tokenId) {
  try {
    // Update GitHub posts.json via API
    const response = await fetch('/api/delete-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        token_id: tokenId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete post: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Post deleted from server:', result);
    
  } catch (error) {
    console.error('❌ Error deleting post from server:', error);
    throw error;
  }
}

