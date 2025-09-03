// === GitHub API Module ===
// Handles fetching posts from GitHub API with fallback to mock data

class GitAPI {
  constructor() {
    this.baseUrl = window.CONFIG?.apiBase || window.location.origin;
    this.endpoints = {
      posts: '/api/git/posts',
      mock: '/posts.json'
    };
  }

  // Fetch posts from GitHub proxy API
  async fetchPosts() {
    try {
      console.log('🌐 Fetching posts from GitHub proxy...');
      
      const response = await fetch(this.endpoints.posts);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const posts = await response.json();
      console.log(`✅ Fetched ${posts.length} posts from GitHub proxy`);
      
      return posts;
    } catch (error) {
      console.error('❌ GitHub proxy failed:', error.message);
      
      // Fallback to mock data
      return this.fetchMockPosts();
    }
  }

  // Fallback to local mock data
  async fetchMockPosts() {
    try {
      console.log('🔄 Falling back to mock data...');
      
      const response = await fetch(this.endpoints.mock);
      
      if (!response.ok) {
        throw new Error(`Mock data error: ${response.status}`);
      }
      
      const posts = await response.json();
      console.log(`✅ Loaded ${posts.length} posts from mock data`);
      
      return posts;
    } catch (error) {
      console.error('❌ Mock data failed:', error.message);
      
      // Return empty array as last resort
      return [];
    }
  }

  // Get posts with automatic fallback
  async getPosts() {
    if (window.CONFIG?.enableGitHubProxy) {
      return this.fetchPosts();
    } else {
      return this.fetchMockPosts();
    }
  }
}

// Create global instance
const gitAPI = new GitAPI();

// Export for use in other modules
window.gitAPI = gitAPI;
window.fetchPosts = () => gitAPI.getPosts(); 