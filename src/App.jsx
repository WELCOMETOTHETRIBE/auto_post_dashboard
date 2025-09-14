import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import TabNavigation from './components/TabNavigation'
import PostsGrid from './components/PostsGrid'
import LoadingScreen from './components/LoadingScreen'
import EmptyState from './components/EmptyState'
import PostModal from './components/PostModal'
import UploadModal from './components/UploadModal'
import ToastContainer from './components/ToastContainer'
import { fetchPosts, deletePost } from './services/api'

function App() {
  const [posts, setPosts] = useState([])
  const [currentTab, setCurrentTab] = useState('active')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setIsLoading(true)
      const postsData = await fetchPosts()
      setPosts(postsData)
    } catch (error) {
      console.error('Failed to load posts:', error)
      showToast('Failed to load posts', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePost = async (tokenId) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      await deletePost(tokenId)
      setPosts(posts.filter(post => post.token_id !== tokenId))
      showToast('Post deleted successfully!', 'success')
    } catch (error) {
      console.error('Failed to delete post:', error)
      showToast('Failed to delete post', 'error')
    }
  }

  const handleEditPost = (post) => {
    setSelectedPost(post)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPost(null)
  }

  const handleSavePost = (updatedPost) => {
    setPosts(posts.map(post => 
      post.token_id === updatedPost.token_id ? updatedPost : post
    ))
    showToast('Post updated successfully!', 'success')
    handleCloseModal()
  }

  const handleUploadSuccess = (newPost) => {
    setPosts(prev => [newPost, ...prev])
    showToast('Post uploaded successfully!', 'success')
    setIsUploadModalOpen(false)
  }

  const showToast = (message, type = 'info') => {
    const id = Date.now()
    const toast = { id, message, type }
    setToasts(prev => [...prev, toast])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }

  const filteredPosts = currentTab === 'active' 
    ? posts.filter(post => post.status !== 'posted')
    : posts.filter(post => post.status === 'posted')

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        activeCount={posts.filter(p => p.status !== 'posted').length}
        postedCount={posts.filter(p => p.status === 'posted').length}
        onUpload={() => setIsUploadModalOpen(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TabNavigation 
          currentTab={currentTab}
          onTabChange={setCurrentTab}
        />
        
        {filteredPosts.length === 0 ? (
          <EmptyState onUpload={() => setIsUploadModalOpen(true)} />
        ) : (
          <PostsGrid 
            posts={filteredPosts}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
          />
        )}
      </main>

      {isModalOpen && selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={handleCloseModal}
          onSave={handleSavePost}
          onToast={showToast}
        />
      )}

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <ToastContainer toasts={toasts} onRemove={(id) => 
        setToasts(prev => prev.filter(t => t.id !== id))
      } />
    </div>
  )
}

export default App
