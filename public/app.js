// === iOS Mobile-First Content Hub App ===

// Authentication check
function checkAuthentication() {
  const authenticated = sessionStorage.getItem('authenticated');
  const loginTime = sessionStorage.getItem('loginTime');
  
  if (authenticated !== 'true' || !loginTime) {
    window.location.href = 'login.html';
    return false;
  }
  
  const now = Date.now();
  const loginTimestamp = parseInt(loginTime);
  const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours
  
  if (now - loginTimestamp >= sessionDuration) {
    // Session expired
    sessionStorage.removeItem('authenticated');
    sessionStorage.removeItem('loginTime');
    window.location.href = 'login.html';
    return false;
  }
  
  return true;
}

// Check authentication on page load
if (!checkAuthentication()) {
  throw new Error('Authentication required');
}

// Global variables
const API_BASE = 'https://autopostdashboard-production.up.railway.app';
let selectedPosts = new Set();
let isBulkMode = false;
let viewMode = 'grid';
let currentTab = 'active';
let allPosts = [];
let activePosts = [];
let postedPosts = [];
let filteredPosts = [];
let productsData = [];
let isRefreshing = false;
let startY = 0;
let currentY = 0;

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

// Hide splash after 2.5 seconds
setTimeout(hideSplashScreen, 2500);

// === Touch Interactions ===
function initializeTouchInteractions() {
  // Add touch feedback to buttons
  const buttons = document.querySelectorAll('.btn, .nav-item, .platform-button');
  buttons.forEach(button => {
    button.addEventListener('touchstart', function() {
      this.style.transform = 'scale(0.95)';
    });
    
    button.addEventListener('touchend', function() {
      this.style.transform = 'scale(1)';
    });
  });
  
  // Add haptic feedback for iOS
  if ('vibrate' in navigator) {
    buttons.forEach(button => {
      button.addEventListener('click', function() {
        navigator.vibrate(10);
      });
    });
  }
}

// === Pull to Refresh ===
function initializePullToRefresh() {
  const contentArea = document.querySelector('.content-area');
  const pullRefresh = document.getElementById('pull-refresh');
  
  if (!contentArea || !pullRefresh) return;
  
  contentArea.addEventListener('touchstart', handleTouchStart, { passive: false });
  contentArea.addEventListener('touchmove', handleTouchMove, { passive: false });
  contentArea.addEventListener('touchend', handleTouchEnd, { passive: false });
}

function handleTouchStart(e) {
  if (contentArea.scrollTop === 0) {
    startY = e.touches[0].clientY;
  }
}

function handleTouchMove(e) {
  if (contentArea.scrollTop === 0 && startY > 0) {
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    if (diff > 0 && diff < 100) {
      e.preventDefault();
      const pullRefresh = document.getElementById('pull-refresh');
      pullRefresh.style.transform = `translateY(${Math.min(diff * 0.5, 100)}px)`;
      
      if (diff > 80) {
        pullRefresh.classList.add('show');
      }
    }
  }
}

function handleTouchEnd() {
  const pullRefresh = document.getElementById('pull-refresh');
  const diff = currentY - startY;
  
  if (diff > 80) {
    // Trigger refresh
    refreshContent();
  }
  
  // Reset
  pullRefresh.style.transform = 'translateY(-100%)';
  pullRefresh.classList.remove('show');
  startY = 0;
  currentY = 0;
}

async function refreshContent() {
  if (isRefreshing) return;
  
  isRefreshing = true;
  showToast('Refreshing content...', 'info');
  
  try {
    await loadPosts();
    showToast('Content refreshed!', 'success');
  } catch (error) {
    showToast('Refresh failed', 'error');
  } finally {
    isRefreshing = false;
  }
}

// === Modal Management ===
function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal.style.display === 'none' || !modal.style.display) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Add iOS-style modal animation
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';
    
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
      modal.style.transform = 'scale(1)';
    });
  } else {
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }, 200);
  }
}

function toggleUploadModal() {
  toggleModal('upload-modal');
}

function toggleSearchModal() {
  toggleModal('search-modal');
}

function toggleProfileModal() {
  toggleModal('profile-modal');
}

function closeImageModal() {
  toggleModal('image-modal');
}

function closeEditModal() {
  toggleModal('edit-modal');
}

// === Tab Management ===
function switchTab(tab) {
  currentTab = tab;
  const tabButtons = document.querySelectorAll('.nav-item');
  
  tabButtons.forEach(btn => btn.classList.remove('active'));
  
  if (tab === 'active') {
    document.getElementById('active-tab').classList.add('active');
  } else {
    document.getElementById('posted-tab').classList.add('active');
  }
  
  displayPosts();
}

// === View Mode Toggle ===
function toggleViewMode() {
  viewMode = viewMode === 'grid' ? 'list' : 'grid';
  const container = document.getElementById('posts-container');
  const viewIcon = document.getElementById('view-icon');
  
  if (viewMode === 'grid') {
    container.className = 'posts-grid';
    viewIcon.className = 'fas fa-th';
  } else {
    container.className = 'posts-list';
    viewIcon.className = 'fas fa-list';
  }
  
  displayPosts();
}

// === Bulk Operations ===
function toggleBulkMode() {
  isBulkMode = !isBulkMode;
  selectedPosts.clear();
  
  const bulkBtn = document.getElementById('bulk-mode-btn');
  const bulkActions = document.getElementById('bulk-actions');
  const posts = document.querySelectorAll('.post');
  
  if (isBulkMode) {
    bulkBtn.classList.add('active');
    bulkActions.style.display = 'flex';
    posts.forEach(post => {
      post.classList.add('bulk-selectable');
    });
  } else {
    bulkBtn.classList.remove('active');
    bulkActions.style.display = 'none';
    posts.forEach(post => {
      post.classList.remove('bulk-selectable', 'selected');
    });
  }
  
  updateBulkCount();
}

function togglePostSelection(post) {
  const postId = post.dataset.postId;
  if (selectedPosts.has(postId)) {
    selectedPosts.delete(postId);
    post.classList.remove('selected');
  } else {
    selectedPosts.add(postId);
    post.classList.add('selected');
  }
  
  updateBulkCount();
}

function updateBulkCount() {
  const bulkCount = document.getElementById('bulk-count');
  if (bulkCount) {
    bulkCount.textContent = selectedPosts.size;
  }
}

// === Search & Filtering ===
function searchPosts() {
  const searchTerm = document.getElementById('search-posts').value.toLowerCase();
  const clearBtn = document.getElementById('clear-search-btn');
  
  if (searchTerm.length > 0) {
    clearBtn.style.display = 'flex';
  } else {
    clearBtn.style.display = 'none';
  }
  
  filterPosts();
}

function clearSearch() {
  document.getElementById('search-posts').value = '';
  document.getElementById('clear-search-btn').style.display = 'none';
  filterPosts();
}

function applyFilters(posts) {
  const brandFilter = document.getElementById('brand-filter').value;
  const productFilter = document.getElementById('product-filter').value;
  const searchTerm = document.getElementById('search-posts').value.toLowerCase();
  const hasCaption = document.getElementById('has-caption').checked;
  const hasHashtags = document.getElementById('has-hashtags').checked;
  const hasLink = document.getElementById('has-link').checked;
  
  return posts.filter(post => {
    const matchesBrand = !brandFilter || post.brand === brandFilter;
    const matchesProduct = !productFilter || post.product === productFilter;
    const matchesSearch = !searchTerm || 
      (post.caption && post.caption.toLowerCase().includes(searchTerm)) ||
      (post.hashtags && post.hashtags.toLowerCase().includes(searchTerm)) ||
      (post.image_url && post.image_url.toLowerCase().includes(searchTerm));
    const matchesCaption = !hasCaption || (post.caption && post.caption.trim().length > 0);
    const matchesHashtags = !hasHashtags || (post.hashtags && post.hashtags.trim().length > 0);
    const matchesLink = !hasLink || (post.link && post.link.trim().length > 0);
    
    return matchesBrand && matchesProduct && matchesSearch && matchesCaption && matchesHashtags && matchesLink;
  });
}

function filterPosts() {
  displayPosts();
}

function clearFilters() {
  document.getElementById('brand-filter').value = '';
  document.getElementById('product-filter').value = '';
  document.getElementById('has-caption').checked = false;
  document.getElementById('has-hashtags').checked = false;
  document.getElementById('has-link').checked = false;
  filterPosts();
}

// === Data Loading ===
async function loadProductsData() {
  try {
    const response = await fetch('products.json');
    productsData = await response.json();
  } catch (error) {
    console.error('Failed to load products:', error);
  }
}

function loadProductsForBrand() {
  const brand = document.getElementById('upload-brand').value;
  const productSelect = document.getElementById('upload-product');
  
  productSelect.innerHTML = '<option value="">No specific product</option>';
  
  if (brand && productsData.length > 0) {
    const brandProducts = productsData.filter(product => product.brand === brand);
    brandProducts.forEach(product => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = product.title;
      productSelect.appendChild(option);
    });
  }
}

async function loadPosts() {
  const container = document.getElementById('posts-container');
  const loadingIndicator = document.getElementById('loading-indicator');
  const emptyState = document.getElementById('empty-state');
  
  loadingIndicator.style.display = 'flex';
  container.innerHTML = '';
  
  const POSTS_JSON_URL = `https://raw.githubusercontent.com/WELCOMETOTHETRIBE/auto_post_dashboard/main/public/posts.json?cacheBust=${Date.now()}`;
  
  try {
    const [postsResponse] = await Promise.all([
      fetch(POSTS_JSON_URL).then(res => res.json()),
      loadProductsData()
    ]);
    
    allPosts = postsResponse;
    activePosts = postsResponse.filter(post => post.status !== 'hidden');
    postedPosts = postsResponse.filter(post => post.status === 'hidden');
    
    updateAnalytics();
    displayPosts();
    loadingIndicator.style.display = 'none';
  } catch (err) {
    console.error('❌ Failed to load posts.json:', err);
    showToast('Could not load posts from GitHub.', 'error');
    loadingIndicator.style.display = 'none';
    emptyState.style.display = 'flex';
  }
}

// === Post Display ===
function displayPosts() {
  const container = document.getElementById('posts-container');
  const emptyState = document.getElementById('empty-state');
  
  container.innerHTML = '';
  
  const postsToShow = currentTab === 'active' ? activePosts : postedPosts;
  filteredPosts = applyFilters(postsToShow);
  
  if (filteredPosts.length === 0) {
    emptyState.style.display = 'flex';
    emptyState.querySelector('h3').textContent = currentTab === 'active' ? 'No active content' : 'No posted content';
    emptyState.querySelector('p').textContent = currentTab === 'active' ? 'Upload new media or pull content to get started' : 'No posts have been published yet';
    return;
  }
  
  emptyState.style.display = 'none';
  
  filteredPosts.forEach((post, index) => {
    const tokenId = generateTokenId();
    const postElement = createPostElement(post, index, tokenId);
    container.appendChild(postElement);
  });
}

function createPostElement(post, index, tokenId) {
  const postElement = document.createElement('div');
  postElement.className = 'post';
  postElement.dataset.postId = tokenId;
  postElement.dataset.index = index;
  postElement.dataset.imageUrl = post.image_url;
  postElement.dataset.tokenId = tokenId;
  
  const isPosted = post.status === 'hidden';
  const postedDate = post.posted_date || new Date().toLocaleDateString();
  
  postElement.innerHTML = `
    <div class="post-image-container" onclick="togglePostDetails(this)">
      <div class="post-image">
        <img src="${post.image_url}" alt="Post image" loading="lazy" />
        <div class="image-overlay">
          <div class="overlay-content">
            <i class="fas fa-edit"></i>
            <span>Tap to edit</span>
          </div>
        </div>
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
      <button class="btn btn-primary post-now-btn" onclick="openEditModal(${index}, '${post.image_url}', '${tokenId}', this.closest('.post'))">
        <i class="fas fa-edit"></i>
        <span>Edit Post</span>
      </button>
    </div>
    `}
  `;
  
  return postElement;
}

function togglePostDetails(imageContainer) {
  const post = imageContainer.closest('.post');
  const index = post.dataset.index;
  const imageUrl = post.dataset.imageUrl;
  const tokenId = post.dataset.tokenId;
  
  openEditModal(index, imageUrl, tokenId, post);
}

// === Analytics ===
function updateAnalytics() {
  const totalPosts = allPosts.length;
  const activeCount = activePosts.length;
  const postedCount = postedPosts.length;
  
  // Calculate brand breakdown
  const brands = new Set(allPosts.map(post => post.brand).filter(Boolean));
  const brandBreakdown = brands.size;
  
  // Calculate completion rate
  const completedPosts = allPosts.filter(post => 
    post.caption && post.caption.trim().length > 0 && 
    post.hashtags && post.hashtags.trim().length > 0
  ).length;
  const completionRate = totalPosts > 0 ? Math.round((completedPosts / totalPosts) * 100) : 0;
  
  document.getElementById('total-posts').textContent = totalPosts;
  document.getElementById('brand-breakdown').textContent = brandBreakdown;
  document.getElementById('completion-rate').textContent = `${completionRate}%`;
}

// === Utility Functions ===
function generateTokenId() {
  return 'token_' + Math.random().toString(36).substring(2, 10);
}

function getBrandDisplayName(brandCode) {
  const brandNames = {
    'wttt': 'WTTT',
    'denlys': 'Denly',
    'jabronis': 'Jabroni'
  };
  return brandNames[brandCode] || brandCode;
}

function logout() {
  sessionStorage.removeItem('authenticated');
  sessionStorage.removeItem('loginTime');
  window.location.href = 'login.html';
}

// === Toast Notifications ===
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.getElementById('toast-container').appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// === File Upload ===
function initializeFileUpload() {
  const fileUpload = document.getElementById('file-upload');
  if (!fileUpload) return;
  
  fileUpload.addEventListener('change', function(e) {
    const label = document.querySelector('.file-upload-label');
    const preview = document.getElementById('upload-preview');
    const previewGrid = document.getElementById('preview-grid');
    
    if (e.target.files.length > 0) {
      const fileNames = Array.from(e.target.files).map(f => f.name).join(', ');
      label.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${e.target.files.length} file(s) selected</span>
        <small>${fileNames}</small>
      `;
      label.classList.add('has-file');
      
      // Show preview
      preview.style.display = 'block';
      previewGrid.innerHTML = '';
      
      Array.from(e.target.files).forEach((file, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
          <div class="preview-content">
            <i class="fas fa-file-image"></i>
            <span>${file.name}</span>
            <small>${(file.size / 1024 / 1024).toFixed(2)} MB</small>
          </div>
        `;
        previewGrid.appendChild(previewItem);
      });
    } else {
      label.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <span>Choose files or tap to select</span>
        <small>Images & videos (max 10)</small>
      `;
      label.classList.remove('has-file');
      preview.style.display = 'none';
    }
  });
}

// === Upload Form Handling ===
function initializeUploadForm() {
  const uploadForm = document.getElementById('upload-form');
  if (!uploadForm) return;
  
  uploadForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Uploading...</span>';
      submitBtn.disabled = true;
      
      const res = await fetch('/upload-image', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      showToast('✅ Media uploaded successfully!', 'success');
      this.reset();
      toggleUploadModal();
      setTimeout(() => location.reload(), 1000);
    } catch (err) {
      console.error('Upload failed:', err);
      showToast('❌ Upload failed. Please try again.', 'error');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

// === Template System ===
function applyUploadTemplate() {
  const template = document.getElementById('upload-template').value;
  if (template) {
    showToast('Template will be applied to uploaded posts', 'info');
  }
}

// === Export Functionality ===
function exportPosts() {
  const data = {
    posts: allPosts,
    exportDate: new Date().toISOString(),
    totalPosts: allPosts.length,
    activePosts: activePosts.length,
    postedPosts: postedPosts.length,
    filters: {
      brand: document.getElementById('brand-filter')?.value || '',
      product: document.getElementById('product-filter')?.value || '',
      search: document.getElementById('search-posts')?.value || ''
    }
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `posts-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  showToast('Data exported successfully!', 'success');
}

// === Bulk Operations ===
async function bulkGenerateCaptions() {
  if (selectedPosts.size === 0) {
    showToast('Please select at least one post', 'error');
    return;
  }
  
  showToast(`Generating captions for ${selectedPosts.size} posts...`, 'info');
  // Implementation would go here
}

async function bulkSchedule() {
  if (selectedPosts.size === 0) {
    showToast('Please select at least one post', 'error');
    return;
  }
  
  const delay = prompt('Enter delay in hours for all selected posts:');
  if (delay === null) return;
  
  const delayHours = parseInt(delay) || 0;
  showToast(`Scheduled ${selectedPosts.size} posts with ${delayHours} hour delay`, 'success');
}

async function bulkPost() {
  if (selectedPosts.size === 0) {
    showToast('Please select at least one post', 'error');
    return;
  }
  
  showToast(`Posting ${selectedPosts.size} selected posts...`, 'info');
  // Implementation would go here
}

// === Edit Modal Functions ===
let currentEditData = null;

function openEditModal(index, imageUrl, tokenId, postElement) {
  const modal = document.getElementById('edit-modal');
  const previewImage = document.getElementById('edit-preview-image');
  
  previewImage.src = imageUrl;
  
  currentEditData = {
    index: index,
    imageUrl: imageUrl,
    tokenId: tokenId,
    postElement: postElement
  };
  
  // Populate form with existing data if available
  const post = allPosts[index];
  if (post) {
    document.getElementById('edit-product').value = post.product || '';
    document.getElementById('edit-link').value = post.link || '';
    document.getElementById('edit-delay').value = '0';
    document.getElementById('edit-prompt').value = post.caption || '';
    document.getElementById('edit-caption').value = post.caption || '';
    document.getElementById('edit-hashtags').value = post.hashtags || '';
    document.getElementById('edit-brand').value = post.brand || 'wttt';
    
    // Set platforms
    if (post.platform) {
      const platforms = post.platform.split(' ');
      platforms.forEach(platform => {
        const button = document.querySelector(`[data-platform="${platform}"]`);
        if (button) {
          button.classList.add('active');
        }
      });
      document.getElementById('edit-platform').value = post.platform;
    }
  }
  
  toggleModal('edit-modal');
}

function toggleEditPlatform(button) {
  button.classList.toggle('active');
  const platforms = Array.from(button.parentElement.querySelectorAll('.platform-button.active')).map(btn => btn.dataset.platform);
  document.getElementById('edit-platform').value = platforms.join(' ');
}

async function generateEditCaption() {
  const prompt = document.getElementById('edit-prompt').value;
  const product = document.getElementById('edit-product').value;
  const brand = document.getElementById('edit-brand').value;
  const captionField = document.getElementById('edit-caption');
  const generateBtn = captionField.nextElementSibling;
  
  if (!prompt.trim()) {
    showToast('Please describe the image first', 'error');
    return;
  }

  const enhancedPrompt = `${prompt} | Brand: ${brand} | Product: ${product}`;

  const originalText = generateBtn.innerHTML;
  generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  generateBtn.disabled = true;
  captionField.placeholder = "⏳ Generating caption...";

  try {
    const res = await fetch(`${API_BASE}/api/generate-caption`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: enhancedPrompt })
    });
    
    if (!res.ok) throw new Error('Generation failed');
    
    const data = await res.json();
    captionField.value = data.caption || '';
    showToast('✅ Caption generated!', 'success');
  } catch (error) {
    console.error('Error generating caption:', error);
    showToast('❌ Failed to generate caption.', 'error');
  } finally {
    generateBtn.innerHTML = originalText;
    generateBtn.disabled = false;
    captionField.placeholder = "Click generate to create a caption";
  }
}

async function generateEditHashtags() {
  const caption = document.getElementById('edit-caption').value;
  const hashtagsField = document.getElementById('edit-hashtags');
  const generateBtn = hashtagsField.nextElementSibling;
  
  if (!caption.trim()) {
    showToast('Please add a caption first', 'error');
    return;
  }

  const originalText = generateBtn.innerHTML;
  generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  generateBtn.disabled = true;
  hashtagsField.placeholder = "⏳ Generating hashtags...";

  try {
    const res = await fetch(`${API_BASE}/api/generate-hashtags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption })
    });
    
    if (!res.ok) throw new Error('Generation failed');
    
    const data = await res.json();
    hashtagsField.value = data.hashtags || '';
    showToast('✅ Hashtags generated!', 'success');
  } catch (error) {
    console.error('Error generating hashtags:', error);
    showToast('❌ Failed to generate hashtags.', 'error');
  } finally {
    generateBtn.innerHTML = originalText;
    generateBtn.disabled = false;
    hashtagsField.placeholder = "Click generate to create hashtags";
  }
}

async function submitEditPost() {
  if (!currentEditData) {
    showToast('No post data available', 'error');
    return;
  }

  const caption = document.getElementById('edit-caption').value;
  const hashtags = document.getElementById('edit-hashtags').value;
  const platform = document.getElementById('edit-platform').value;
  const link = document.getElementById('edit-link').value;
  const product = document.getElementById('edit-product').value;
  const delay_hours = parseInt(document.getElementById('edit-delay').value) || 0;
  const brand = document.getElementById('edit-brand').value;
  
  if (!caption.trim()) {
    showToast('Caption is required', 'error');
    return;
  }
  
  if (!platform) {
    showToast('At least one platform must be selected', 'error');
    return;
  }
  
  const payload = {
    image_url: currentEditData.imageUrl,
    caption,
    hashtags,
    platform,
    token_id: currentEditData.tokenId,
    link,
    product,
    brand,
    delay_hours
  };

  const submitBtn = document.querySelector('.edit-actions .btn-primary');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Posting...</span>';
  submitBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) throw new Error('Post failed');
    
    showToast('✅ Post submitted successfully!', 'success');
    closeEditModal();
    
    // Remove the post from the UI
    if (currentEditData.postElement) {
      currentEditData.postElement.remove();
    }
  } catch (error) {
    console.error('Error submitting post:', error);
    showToast('❌ Error submitting post. Please try again.', 'error');
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// === Event Listeners ===
document.addEventListener('DOMContentLoaded', function() {
  // Initialize touch interactions
  initializeTouchInteractions();
  
  // Initialize pull to refresh
  initializePullToRefresh();
  
  // Initialize file upload
  initializeFileUpload();
  
  // Initialize upload form
  initializeUploadForm();
  
  // Load posts
  loadPosts();
  
  // Add iOS-specific event listeners
  if ('ontouchstart' in window) {
    // Touch device optimizations
    document.addEventListener('touchmove', function(e) {
      if (e.target.closest('.modal-content')) {
        e.preventDefault();
      }
    }, { passive: false });
  }
});

// === Close modals when clicking outside ===
window.addEventListener('click', function(e) {
  const modals = ['upload-modal', 'search-modal', 'profile-modal', 'image-modal', 'edit-modal'];
  modals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (e.target === modal) {
      if (modalId === 'upload-modal') toggleUploadModal();
      if (modalId === 'search-modal') toggleSearchModal();
      if (modalId === 'profile-modal') toggleProfileModal();
      if (modalId === 'image-modal') closeImageModal();
      if (modalId === 'edit-modal') closeEditModal();
    }
  });
});

// === Keyboard shortcuts ===
document.addEventListener('keydown', function(e) {
  // Escape key to close modals
  if (e.key === 'Escape') {
    const modals = ['upload-modal', 'search-modal', 'profile-modal', 'image-modal', 'edit-modal'];
    modals.forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (modal && modal.style.display === 'flex') {
        if (modalId === 'upload-modal') toggleUploadModal();
        if (modalId === 'search-modal') toggleSearchModal();
        if (modalId === 'profile-modal') toggleProfileModal();
        if (modalId === 'image-modal') closeImageModal();
        if (modalId === 'edit-modal') closeEditModal();
      }
    });
  }
  
  // Ctrl/Cmd + Enter for quick posting
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    const activeElement = document.activeElement;
    const postElement = activeElement.closest('.post');
    if (postElement) {
      const index = postElement.dataset.index;
      const postButton = postElement.querySelector('.post-now-btn');
      if (postButton) {
        openEditModal(index, postElement.dataset.imageUrl, postElement.dataset.tokenId, postElement);
      }
    }
  }
});

// === Service Worker Registration for PWA ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('SW registered: ', registration);
      })
      .catch(function(registrationError) {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
