// === Tribe SPA - Modern Dashboard ===

// Global state
let allPosts = [];
let currentTab = 'active';
let isLoading = false;

// === Initialization ===
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Tribe SPA initializing...');
  initializeApp();
});

async function initializeApp() {
  try {
    // Hide loading screen and show main app
    setTimeout(() => {
      document.getElementById('loading-screen').classList.add('hidden');
      document.getElementById('main-app').classList.remove('hidden');
    }, 1000);

    // Initialize event listeners
    initializeEventListeners();
    
    // Load posts
    await loadPosts();
    
    console.log('✅ App initialized successfully');
  } catch (error) {
    console.error('❌ App initialization failed:', error);
    showError('Failed to initialize app');
  }
}

// === Event Listeners ===
function initializeEventListeners() {
  // Tab switching
  document.getElementById('active-tab').addEventListener('click', () => switchTab('active'));
  document.getElementById('posted-tab').addEventListener('click', () => switchTab('posted'));
  
  // Upload button
  document.getElementById('upload-btn').addEventListener('click', () => {
    // TODO: Implement upload functionality
    showToast('Upload functionality coming soon!', 'info');
  });
}

// === Tab Management ===
function switchTab(tab) {
  currentTab = tab;
  
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('border-blue-500', 'text-blue-600');
    btn.classList.add('border-transparent', 'text-gray-500');
  });
  
  const activeBtn = document.getElementById(`${tab}-tab`);
  if (activeBtn) {
    activeBtn.classList.add('border-blue-500', 'text-blue-600');
    activeBtn.classList.remove('border-transparent', 'text-gray-500');
  }
  
  // Update display
  displayPosts();
  updateStats();
}

// === Data Loading ===
async function loadPosts() {
  if (isLoading) return;
  
  isLoading = true;
  showLoadingState();
  
  try {
    const posts = await window.fetchPosts();
    allPosts = posts;
    window.allPosts = allPosts; // For modal access
    
    displayPosts();
    updateStats();
    
    console.log(`✅ Loaded ${posts.length} posts`);
  } catch (error) {
    console.error('❌ Failed to load posts:', error);
    showError('Failed to load posts');
  } finally {
    isLoading = false;
    hideLoadingState();
  }
}

// === Display Functions ===
function displayPosts() {
  const grid = document.getElementById('posts-grid');
  const emptyState = document.getElementById('empty-state');
  
  if (!grid) return;
  
  // Filter posts based on current tab
  const postsToShow = currentTab === 'active' 
    ? allPosts.filter(post => post.status !== 'posted')
    : allPosts.filter(post => post.status === 'posted');
  
  // Clear grid
  grid.innerHTML = '';
  
  if (postsToShow.length === 0) {
    showEmptyState();
    return;
  }
  
  hideEmptyState();
  
  // Create post cards
  postsToShow.forEach(post => {
    const card = createPostCard(post);
    grid.appendChild(card);
  });
}

function createPostCard(post) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group';
  
  const imageUrl = post.image_url || post.imageUrl || '';
  const caption = post.caption || 'No caption';
  const isPosted = post.status === 'posted';
  
  card.innerHTML = `
    <div class="relative">
      <img src="${imageUrl}" alt="Post image" class="w-full h-48 object-cover" />
      
      <!-- Status Badge -->
      <div class="absolute top-3 right-3">
        ${isPosted ? 
          '<span class="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">Posted</span>' :
          '<span class="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">Active</span>'
        }
      </div>
      
      <!-- Delete Button -->
      <button onclick="deletePost('${post.token_id}')" class="absolute top-3 left-3 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600">
        <i class="fas fa-times text-sm"></i>
      </button>
      
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
    </div>
    
    <div class="p-4">
      <p class="text-gray-900 text-sm line-clamp-2 mb-3">${caption}</p>
      
      <div class="flex items-center justify-between">
        <div class="flex items-center text-xs text-gray-500">
          <i class="fas fa-hashtag mr-1"></i>
          <span>${(post.hashtags || '').split(' ').length} tags</span>
        </div>
        
        <button onclick="openEditModal('${post.token_id}')" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200">
          <i class="fas fa-edit mr-1"></i>
          Edit
        </button>
      </div>
    </div>
  `;
  
  return card;
}

// === State Management ===
function showLoadingState() {
  document.getElementById('loading-state').classList.remove('hidden');
  document.getElementById('posts-grid').classList.add('hidden');
  document.getElementById('empty-state').classList.add('hidden');
}

function hideLoadingState() {
  document.getElementById('loading-state').classList.add('hidden');
}

function showEmptyState() {
  document.getElementById('empty-state').classList.remove('hidden');
  document.getElementById('posts-grid').classList.add('hidden');
}

function hideEmptyState() {
  document.getElementById('empty-state').classList.add('hidden');
  document.getElementById('posts-grid').classList.remove('hidden');
}

function updateStats() {
  const activeCount = allPosts.filter(post => post.status !== 'posted').length;
  const postedCount = allPosts.filter(post => post.status === 'posted').length;
  
  const activeElement = document.getElementById('active-count');
  const postedElement = document.getElementById('posted-count');
  
  if (activeElement) activeElement.textContent = activeCount;
  if (postedElement) postedElement.textContent = postedCount;
}

// === Post Actions ===
function openEditModal(tokenId) {
  const post = allPosts.find(p => p.token_id === tokenId);
  if (post && window.postModal) {
    window.postModal.open(post);
  }
}

async function deletePost(tokenId) {
  if (!confirm('Are you sure you want to delete this post?')) {
    return;
  }
  
  try {
    // Remove from local array
    allPosts = allPosts.filter(post => post.token_id !== tokenId);
    window.allPosts = allPosts;
    
    // Update display
    displayPosts();
    updateStats();
    
    // Delete from server
    await fetch('/api/delete-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token_id: tokenId })
    });
    
    showToast('Post deleted successfully!', 'success');
  } catch (error) {
    console.error('❌ Failed to delete post:', error);
    showToast('Failed to delete post', 'error');
  }
}

// === Toast Notifications ===
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };
  
  toast.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300`;
  toast.innerHTML = `
    <div class="flex items-center">
      <span class="flex-1">${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white hover:text-gray-200">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
  }, 100);
  
  // Auto remove
  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

function showError(message) {
  showToast(message, 'error');
}

// === Service Worker ===
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js?v=20250914-rebuild')
    .then(registration => console.log('✅ Service Worker registered'))
    .catch(error => console.error('❌ Service Worker registration failed:', error));
}